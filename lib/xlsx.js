var  fs = require('fs');

var Xlsx = function(uuid, xlsxStream) {
  this.uuid = uuid;
  this.xlsxStream = xlsxStream;
}
exports = module.exports = Xlsx;

/**
 * Creates a specific Xlsx file for post editing.
 *
 * 
 * @param {hash} chapterData
 * @param {string} book
 * @param {string} chapter
 * @param {string} sourceLang
 * @param {string} targetLang
 * @param {function} callback
 */

Xlsx.prototype.createChapter = function(chapterData, book, chapter, sourceLang, targetLang, callback) {
  var self = this,
      filename = book + '_chapter_' + chapter + '_' + sourceLang + '_to_' + targetLang + '.xlsx';

  self.createDir(function(err, res) {
    if (err) { return callback(err); }

    var writeStream = fs.createWriteStream(res.path + filename);

    self.startStream(writeStream, function(startErr) {
      if (startErr) { return callback(startErr); }

      self.addHeader(function(headerErr) {
        if (headerErr) { return callback(headerErr) };

        self.buildBody(chapterData, function(bodyErr, bodyRes) {
          if (bodyErr) { return callback(bodyErr); } 

          self.writeBody(bodyRes.bodyData, function(writeErr) {
            if (writeErr) { return callback(writeErr); }
          
            self.stopStream(writeStream, function(stopErr) {
              if (stopErr) { return callback(stopErr); }
              
              return callback(null, { filepath: res.path + filename, book: book, chapter: chapter });
            });

          });

        });

      });

    });

  });  

}

/**
 * Creates a directory in tmp based on a uuid.
 *
 * @param {function} callback
 */

Xlsx.prototype.createDir = function(callback) {
  var tmpDir = process.env.TEMP +'/' + this.uuid + '/';

  fs.mkdir(tmpDir, function(err, response) {
    if (err) { return callback(err); }
    return callback(null, { path: tmpDir });
  });
}

/**
 * Adds Headers to Xlsx.
 *
 * @param {function} callback
 */

Xlsx.prototype.addHeader = function(callback) {
  this.xlsxStream.write(['Type', 'Source', 'Suggestion', 'Post Edit']);
  return callback(null);
}



/**
 * Starts xlsx stream.
 *
 * @param {stream} writeStream
 * @param {function} callback
 */

Xlsx.prototype.startStream = function(writeStream, callback) {
  this.xlsxStream.pipe(writeStream);
  return callback(null);
}

/**
 * Extracts and formats body data.
 *
 * @param {hash} data
 * @param {function} callback
 */

Xlsx.prototype.buildBody = function(data, callback) {
  var bodyData = [];

  for (var i = 0; i < data.length; i++) {
    bodyData.push([data[i].type, data[i].source, data[i].suggestion, data[i].post_edit]);
  }
  
  if (bodyData.length > 0) {
    return callback(null, { bodyData: bodyData });
  } else {
    return callback('Your data was not formatted correctly');
  }
}

/**
 * Writes body to xlsx stream
 *
 * @param {array} body
 * @param {funciton} callback
 */

Xlsx.prototype.writeBody = function(body, callback) {
  for (var i = 0; i < body.length; i ++) {
    this.xlsxStream.write(body[i]);
  }
  return callback(null);
}

/**
 * Stops xlsx stream
 *
 * @param {stream} writeStream
 * @param {function} callback
 */

Xlsx.prototype.stopStream = function (writeStream, callback) {

  writeStream.on('finish', function() {
    return callback(null);
  });

  this.xlsxStream.end();
}


