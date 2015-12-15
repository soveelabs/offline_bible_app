var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var _ = require('lodash');
var xlsx = require('xlsx-writestream');
var fs = require ('fs');
var s3 = require('s3');
var http = require('https');
var xlsx_read = require('excel');

//Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');
var Verse = require('../models/verse');

// Export xls
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/xlsx/:trglang').get(function(req, res){

    bibleId = req.params.bible_id;
    chapterId = req.params.chapter_id;
    bookId = req.params.book_id;
    var sourceLanguage;
    targetLanguage = req.params.trglang;
    resJson = {};
    var resFlag = 0;
    var verseStr = []; var bookMetakeys = []; 

    var iterateChapters = function (chapt, callback) {
    
       var tmpRes = {};
	    if (chapterId == chapt.chapter) {

        Verse.find({chapterId:chapt._id}).exec(function (verseErr, verseDocs) {
		
          verses = _.pluck(verseDocs, 'verse');

          verses.forEach(function(oneVerse){
				    verseStr.push(oneVerse);
          });

          generateSuggestions(verseStr, sourceLanguage, targetLanguage, function(suggestionErr, suggestionRes) {
            if (suggestionErr) { return callback(suggestionErr); }

            generateXls(suggestionRes,bookMetakeys, sourceLanguage, function(xlsxErr, xlsxRes) {
              if (xlsxErr) { return callback(xlsxErr); }

              uploadXls(xlsxRes, sourceLanguage, function(uploadErr, uploadRes) {
                if (uploadErr) { return callback(uploadErr); }
                callback(null, uploadRes);
               
              });

            });

          });
        });

      } else {
           callback(null, 'false');
      }
    };
    
    Bible
	.findOne({'bibleId':bibleId})
	.populate('books')
    .exec(function (err, selBible) {
	    if (err) {
		    return res.status(500).json({
		      message: "Error processing request. " + err
		    });
	    }
	    if (!selBible) {
		    return res.status(404).json({
		      message: "Could not find Bible with the given name. " + err
		    });
	    }
      sourceLanguage = selBible.langCode;
	    selBible.books.forEach(function (book) {
		    if (book.bookName == bookId) {
		      Book.findById(book._id)
			     .populate('chapters')
			     .exec(function (bookErr, bookDoc) {
             
            var metaData = JSON.parse(bookDoc.metadata);
            metaData.forEach(function(oneValue){

              var arr = JSON.stringify(oneValue).split(":");

              verseStr.push(arr[0].replace("{","").replace(/"/g, ""));
              var tmpType = {};
              tmpType['Type'] = arr[1].replace("}","").replace(/"/g, "");
              bookMetakeys.push(tmpType);
             
            });

             async.map(bookDoc.chapters, iterateChapters, function (err, results) {

                if(err) {
                  res.status(500).json({
                      message: "Could not export the chapter. " + err
                  });
                } else {

                  for(var i = 0; i < results.length; i++) {

                    if (results[i] != 'false') {
                      resFlag = 1;
                      //res.setHeader("Content-Type", "application/vnd.ms-excel");
                      //res.setHeader("Content-Disposition", "attachment");
                      //res.setHeader("filename", '"' + results[i] +'"');
                      //var tmpArr = results[i].split("/");
                      //fs.unlink(__dirname + tmpArr[8]);
                      res.status(200).json({url : results[i]});
                    }
                  }
                          
                  if (resFlag == 0) {
                    res.status(404).json({
                      message: "Could not found the chapter. " + err
                    });
                  }
                }

             });
			     });
		    }
	    });
	});

});


generateSuggestions = function(sourceData, sourceLang, targetLang, callback) {
  var options = {
    url: process.env.ALCHEMY_HOST + '/text-batch',
    qs: { texts: JSON.stringify(sourceData), from: sourceLang, to: targetLang, customer: process.env.ALCHEMY_CUSTOMER, token: process.env.ALCHEMY_AUTH_TOKEN, project: process.env.SE_PROJECT, asset: process.env.SE_ASSET }
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

generateXls = function(sourceData, metaKeys, sourceLanguage, callback) {

	var readFileSize = 0; var num = 1; var finalDta = []; existingPostEdits = [];
 
  var filename = bookId + '_chapter_' + chapterId + '_' + sourceLanguage + '_to_' + targetLanguage + '.xlsx';

  var iterateExcelData = function(numData, callback) {

    var tmpColumn = {};
    tmpColumn['Post Edit'] = numData[3];
    return callback(null, tmpColumn);

  }

  async.waterfall([
    function(callback) {

      var file = fs.createWriteStream(__dirname + filename);

      var url = process.env.AWS_HOST + '/' + process.env.S3_BUCKET + '/' + process.env.AWS_ENV + '/' + sourceLanguage + '/' + bookId + '/chapter_' + chapterId + '/' + filename;
      var request = http.get(url, function(response) {
        response.pipe(file);

        if (response.headers['content-length'] > 0) {
          fs.watchFile(__dirname + filename, function(){
            xlsx_read(__dirname + filename, function(err, data) {
              if(err) throw err;
          
              async.map(data, iterateExcelData, function(err, results) {
                existingPostEdits.push(results);
              });
              return callback(null, existingPostEdits);
            });
          });
        } else {
              return callback(null, false);
        }
      });
    },
    function(arg1, callback) {

      for( var i = 0; i < sourceData.length; i++) {
        if(metaKeys[i]!= null) {
          if (arg1 != false){
            var target = _.extend(metaKeys[i], sourceData[i], arg1[0][i]);
          } else {
            var target = _.extend(metaKeys[i], sourceData[i]);
          }

          finalDta.push(target);
        } else {
          var verseNum = {};
          verseNum['Type'] = num;
          if (arg1 != false){
            var target = _.extend(verseNum, sourceData[i],arg1[0][i]);
          } else {
            var target = _.extend(verseNum, sourceData[i]);
          }
          
          num++;
          finalDta.push(target);
        }
      }
      fs.unlink(process.env.TEMP + filename);
      xlsx.write(process.env.TEMP + filename, finalDta, function (err) {
        if(err) {return callback(null, err);}
      });
        return callback(null, filename);
    }
], function (err, result) {
      return callback(null, result);
});

}


uploadXls = function(filename, sourceLanguage, callback) {

	var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default 
    s3RetryCount: 3,    // this is the default 
    s3RetryDelay: 1000, // this is the default 
    multipartUploadThreshold: 20971520, // this is the default (20 MB) 
    multipartUploadSize: 15728640, // this is the default (15 MB) 
    s3Options: {
      accessKeyId: process.env.S3_KEY,
      secretAccessKey: process.env.S3_SECRET
      // any other options are passed to new AWS.S3() 
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
    }
  });

  var prefixLoc = process.env.AWS_HOST + '/' + process.env.S3_BUCKET + '/' + process.env.AWS_ENV + '/' + sourceLanguage + '/' + bookId + '/chapter_' + chapterId + '/' + filename;
  var s3BucketKey = process.env.AWS_ENV + '/' + sourceLanguage + '/' + bookId + '/chapter_' + chapterId + '/' + filename;

  var params = {
    localFile: process.env.TEMP  + filename,
 
    s3Params: {
      Bucket: process.env.S3_BUCKET,
      Key: s3BucketKey,
      ACL:'public-read'

      // other options supported by putObject, except Body and ContentLength. 
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property 
    }
  };

fs.watchFile(process.env.TEMP  + filename, function () {

  var uploader = client.uploadFile(params);
  
  uploader.on('error', function(err) {
    console.error("unable to upload:", err.stack);
  });
  uploader.on('progress', function() {
    console.log("progress", uploader.progressMd5Amount,
      uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
   console.log("done uploading");
  });
  //fs.unlink(process.env.TEMP  + filename);
  });
  return callback(null, prefixLoc);
}


// Return router
module.exports = router;
