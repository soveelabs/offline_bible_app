// Dependencies
var express = require('express');
var router = express.Router();

var models = require('./exporter'),
    modelMe = require('model-me'),
    xlsx = require('../lib/xlsx'),
    xlsxStream = require('xlsx-stream')(),
    uuid = require('uuid').v4(),
    xlsxWriter = new xlsx(uuid, xlsxStream),
    s3 = require('../lib/s3'),
    knox = require('knox').createClient({
      key: process.env.S3_KEY,
      secret: process.env.S3_SECRET,
      bucket: process.env.S3_BUCKET
    }),
    s3Uploader = new s3(knox),
    request = require('request');

function Exporter(data) { console.log("hereeeeeeeeeeeeeeeee");
  var _data = data || {};

  this.book = _data.book || null;
  this.chapter = _data.chapter || null;
  this.sourceLang = _data.sourceLang || null;
  this.targetLang = _data.targetLang || null;
  this.version = _data.version || null;

}

modelMe(Exporter)
  .attr('book', String, { required: true, allowNull: false })
  .attr('chapter', String, { required: true, allowNull: false })
  .attr('sourceLang', String, { required: true, allowNull: false })
  .attr('targetLang', String, { required: true, allowNull: false })
  .attr('version', String, { require: true, allowNull: false });


/**
 * Execute 
 *
 *
 * @param {hash} data
 * @param {function} callback
 */

Exporter.execute = function execute(data, callback) {
  console.log(data);
    Exporter.create(data, function(validationErr, createRes) {
    if (validationErr) { return callback(validationErr); }

      var exporter = createRes.exporter

    exporter.getData(function(dataErr, dataRes) {
      if (dataErr) { return callback(dataErr); }

      exporter.getSource(dataRes.data, function(sourceErr, sourceRes) {
        if (sourceErr) { return callback(sourceErr); }

        exporter.generateSuggestions(sourceRes, data.sourceLang, data.targetLang, function(suggestionErr, suggestionRes) {
          if (suggestionErr) { return callback(suggestionErr); }

          exporter.injectSuggestions(dataRes.data, suggestionRes, function(injectErr, injectRes) {
            if (injectErr) { return callback(injectErr); }

            exporter.generateXlsx(injectRes, data.book, data.chapter, data.sourceLang, data.targetLang, function(xlsxErr, xlsxRes){
              if (xlsxErr) { return callback(xlsxErr); }

              exporter.upload(xlsxRes.file, dataRes.s3Url, function(s3Err, s3Res) {
                if (s3Err) { return callback(s3Err); }
              
                return callback(null, { url: s3Res.url });
              });
            });
          });
        });
      });
    });
  
  });

}

/**
 * Creates an Exporter Instance
 *
 * @param {hash} data
 * @param {function} callback
 */

Exporter.create = function create(data, callback) {
  var exporter = new models.Exporter(data);
  exporter.validate(function(err) {
    if (err) { return callback(err); }
    return callback(null, { exporter: exporter });
  });
}

/**
 * Checks for requested data and returns if possible
 *
 * @param {function} callback
 */

Exporter.prototype.getData = function getData(callback) {
  var self = this,
      xlsxUrl = Exporter.createS3XlsxUrl(self.attributes);

  Exporter.checkForFile(xlsxUrl, function(err, res) {
    if (err) { return callback(err); }

    if (res) {

      /**
       * Call parallel to extract xlsx bible data
       */

      var options = {
        url: process.env.PARALLEL_HOST + '/bible_xlsx',
        qs: { 'url': xlsxUrl }
      };

      request.get(options, function(apiErr, apiRes, apiBody) {
        if (apiErr) { return callback(apiErr); }
        return callback(null, { data: JSON.parse(apiBody), s3Path: xlsxUrl });
      });
      
    } else {

      /**
       * Call parallel to extract usx bible data
       */

      var usxUrl = Exporter.createS3UsxUrl(self.attributes),
          options = {
            url: process.env.PARALLEL_HOST + '/usx',
            qs: { 'url': usxUrl }
          };

      request.get(options, function(apiErr, apiRes, apiBody) {
        if (apiErr) { return callback(apiErr); }

        /**
         * Format usx data
         */

        Exporter.formatUsxData(JSON.parse(apiBody), self.attributes.book, self.attributes.chapter, function(formatErr, formatRes) {
          if (formatErr) { return callback(formatErr); }

          return callback(null, formatRes);
        });
      });
    }
  });
}

/**
 * Retrieves source data from chapter data
 *
 * @param {array} data
 * @param {function} callback
 */

Exporter.prototype.getSource = function getSource(data, callback) {
  var sourceData = [];

  for(var i = 0; i < data.length; i++) {
    sourceData.push(data[i].source);
  }

  return callback(null, sourceData);
}

/**
 * Generates translation suggestions for source
 *
 * @param {array} sourceData
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {function} callback
 */

Exporter.prototype.generateSuggestions = function generateSuggestions(sourceData, sourceLang, targetLang, callback) {
  var options = {
    url: process.env.ALCHEMY_HOST + '/text-batch',
    qs: { texts: JSON.stringify(sourceData), from: sourceLang, to: targetLang, customer: process.env.ALCHEMY_CUSTOMER, token: process.env.AUTH_TOKEN, project: process.env.SE_PROJECT, asset: process.env.SE_ASSET }
  };

  request.get(options, function(alchemyErr, alchemyRes, alchemyBody) {
    if (alchemyErr) { return callback(alchemyErr); }

    var suggestions = []

    for (var i = 0; i < sourceData.length; i++) {
      suggestions.push({ source: sourceData[i], suggestion: JSON.parse(alchemyBody)[i] });
    }

    return callback(null, suggestions);
  });
}

/**
 * Injects suggestions into data
 *
 * @param {array} data
 * @param {array} suggestions
 * @param {function} callback
 */

Exporter.prototype.injectSuggestions = function injectSuggestions(data, suggestions, callback) {
  var injected = [];

  for (var i = 0; i < data.length; i++) {
    var segment = data[i],
        source = segment.source;

    for (var s = 0; s < suggestions.length; s++) {
      if (suggestions[s].source == source) {
        segment.suggestion = suggestions[s].suggestion;
        break;
      }
    }
    injected.push(segment);
  }

  return callback(null, injected);
}

/**
 * Generates Xlsx
 *
 * @param {array} data
 * @param {string} book
 * @param {string} chapter
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {function} callback
 */

Exporter.prototype.generateXlsx = function generateXlsx(data, book, chapter, sourceLang, targetLang, callback) {
  xlsxWriter.createChapter(data, book, chapter, sourceLang, targetLang, function(xlsxErr, xlsxRes) {
    if (xlsxErr) { return callback(xlsxErr); }

    return callback(null, { file: xlsxRes.filepath });
  });
}

/**
 * Uploads XLSX to s3
 *
 * @param {string} file
 * @param {string} s3Path
 * @param {function} callback
 */

Exporter.prototype.upload = function upload(file, s3Path, callback) {
  s3Uploader.upload(file, s3Path, function(err, res) {
    if (err) { return callback(err); }

    return callback(null, { url: res.url });
  }); 
}

/**
 * Creates xlsx url
 *
 * @param {hash} params
 */

Exporter.createS3XlsxUrl = function createS3XlsxUrl (params) {
  var url = process.env.AWS_HOST + '/' + process.env.S3_BUCKET + '/' + process.env.AWS_ENV + '/' + params.sourceLang + '/' + params.book.replace(/\s+/g, '_') + '/chapter_' + params.chapter + '/' + params.book.replace(/\s+/g, '+') + '_chapter_' + params.chapter + '_' + params.sourceLang + '_to_' + params.targetLang + '.xlsx';
  return url;
}

/**
 * Checks if file exists in s3
 *
 * @param {string} url
 * @param {function} callback
 */

Exporter.checkForFile = function checkForFile (url, callback) {
  
  request.get(url, function(err, res, body) {
    if (err) { return callback(err); }
    if (body.substring(40, 45) == 'Error') {
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  });

}

/**
 * Creates usx url
 *
 * @param {hash} params
 */

Exporter.createS3UsxUrl = function createS3UsxUrl (params) {
  var url = process.env.AWS_HOST + '/' + process.env.S3_BUCKET + '/' + process.env.AWS_ENV + '/' + params.sourceLang + '/' + params.book.replace(/\s+/g, '_') + '/chapter_' + params.chapter + '/' + params.book.replace(/\s+/g, '+') + '_chapter_' + params.chapter + '.xml';
  return url;
}

/**
 * Formats usx data correctly
 *
 * @param {array} data
 * @param {string} book
 * @param {string} chapter
 * @param {function} callback
 */

Exporter.formatUsxData = function formatUsxData (data, book, chapter, callback) {
  var bookData = {};

  for(var i = 0; i < data.length; i++) {
    var b = Object.keys(data[i])[0];
    if (b == book) {
      bookData = data[i][book];
    }
  }

  if (Object.keys(bookData).length == 0) {
    bookData = data[0][""];
  } 

  var bookInfo = bookData.info,
      chapterData = bookData.chapters[chapter],
      footNotes = chapterData.footnotes,
      formattedData = [];


  Exporter.addInfo(formattedData, bookInfo, function(infoErr, infoRes) {
    if (infoErr) { return callback(infoErr); }  
    
    Exporter.addFootnotes(infoRes, footNotes, function(footnoteErr, footnoteRes) {
      if (footnoteErr) { return callback(footnoteErr); }

      Exporter.addVerses(footnoteRes, chapterData, function(verseErr, verseRes) {
        if (verseErr) { return callback(verseErr); }
      
        return callback(null, { data: verseRes });
      });
    });

  });

}

/**
 * Adds info data to formatted data
 *
 * @param {array} formattedData
 * @param {array} bookInfo
 * @param {function} callback
 */

Exporter.addInfo = function addInfo(formattedData, bookInfo, callback) {
  var data = formattedData;
  
  for(var i = 0; i < bookInfo.length; i++) {
    formattedData.push({type: bookInfo[i].type, source: bookInfo[i].text, suggestion: '', post_edit: ''});
  }
  return callback(null, data);
}

/**
 * Adds footnotes to formatted data
 * @params {array} formattedData
 * @params {hash} footnotes
 * @params {function} callback
 */

Exporter.addFootnotes = function addFootnotes(formattedData, footnotes, callback) {
  var data = formattedData;

  for(var i = 0; i < Object.keys(footnotes).length; i++) {
    var ref = Object.keys(footnotes)[i];
    data.push({ type: 'footnote ' + ref, source: footnotes[ref], suggestion: '', post_edit: '' });
  }
  return callback(null, data);
}

/**
 * Adds verses to formatted data
 * @params {array} formattedData
 * @params {hash} chapterData
 * @params {function} callback
 */

Exporter.addVerses = function addVerses(formattedData, chapterData, callback) {
  var data = formattedData;

  for(var i = 0; i < Object.keys(chapterData).length; i++) {
    var type = Object.keys(chapterData)[i];
    if (type != 'footnotes') {
      data.push({ type: type, source: chapterData[type], suggestion: '', post_edit: '' });
    }
  }
  return callback(null, data);
}

// Return router
module.exports = router;
