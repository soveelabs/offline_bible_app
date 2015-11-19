var fs = require('fs'),
    HTTPStatus = require('http-status'),
    HTTPError = require('node-http-error'),
    mime = require('mime');

var S3 = function(knox) {
  this.knox = knox;
}

exports = module.exports = S3;

/**
 * Uploads a file to a specified location in s3.
 *
 * @param {string || file object} file
 * @param {string} s3Path
 * @param {function} callback
 */

S3.prototype.upload = function(file, s3Path, callback) {
  var self = this;

  if (file.path) {
    var stream = fs.createReadStream(file.path),
        mimetype = mime.lookup(file.path),
        originalFilename = file.originalname.replace('(', '').replace(')', ''),
        fileSize = file.size;
  } else {
    var stream = fs.createReadStream(file),
        mimetype = mime.lookup(file),
        originalFilename = file.split('/').slice(-1)[0].replace('(', '').replace(')', ''),
        fileSize = (fs.statSync(file))['size'];
  }

  self.knox.putStream(stream, s3Path + originalFilename,
    {
      'Content-Type': mimetype,
      'Cache-Control': 'max-age=604800',
      'x-amz-acl': 'public-read',
      'Content-Length': fileSize
    },
    function(err, result) {
      if (err) { return callback(err); }

      self.cleanS3Url(result.req.url, function(cleanErr, cleanRes) {
        if (cleanErr) { return callback(cleanErr); }

        return callback(null, { url: cleanRes.url });
      });
    }
  );
}

/**
 * Fixes borked s3 url
 *
 *
 * @param {string} url
 * @param {function} callback
 */

S3.prototype.cleanS3Url = function(url, callback) {
  var clean = url.replace('sovee-bible-app.s3.amazonaws.com', 's3.amazonaws.com').replace(/\%2520/g, '+').replace(/%2527/g, "'");
  return callback(null, { url: clean });
}
