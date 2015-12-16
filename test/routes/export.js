var request = require('supertest'),
Book = require('../../models/book'),
TranslatedBible = require('../../models/translated_bible'),
Chapter = require('../../models/chapter'),
Bible = require('../../models/bible'),
Verse = require('../../models/verse'),
setup = require('../setup'),
app = require('../../server'),
https = require('https'),
fs = require('fs');

describe('export', function() {

    describe('get /xlsx', function() {
      	beforeEach(function(done) {
	    this.timeout(8000);
	    request(app)
		.post('/api/bibles')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.send({"bibleId":"en-asv","version":"English Standard Version", "langCode":"en", "bibleUrl":"http://www.operationagape.com/soveetest/Bible_edited.xml"})
		.expect(201)
		.end(function(err, res) {
		    if (err) { return done(err);}
		    Bible.findOne({bibleId: 'en-asv'}, function(err, bible) {
			if (err) { return done(err); }
			expect(bible).to.have.property('bibleId', 'en-asv');
			expect(bible).to.have.property('version', 'English Standard Version');
			expect(bible).to.have.property('langCode', 'en');
			expect(bible).to.have.property('bibleUrl', 'http://www.operationagape.com/soveetest/Bible_edited.xml');
			return done();
		    });
		});
	});

	it('requires authentication', function(done) {
	    request(app)
		.get('/api/bibles/en-asv/books/Exodus/chapters/1/xlsx/hi')
		.accept('json')
		.expect(401, done);
	});

	it('creates and downloads a chapter xlsx', function(done) {
	    this.timeout(100000);
	    request(app)
		.get('/api/bibles/en-asv/books/Exodus/chapters/1/xlsx/hi')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(200)
		.end(function(err, res) {
		    if (err) { return done(err);}
		    expect(res.body).to.have.property('url');
		    url = res.body.url
		    download(url, './temp.xlsx', function(err, file) {
			if (err) return done(err);
			if (getFilesizeInBytes('./temp.xlsx') < 10) {
			    fs.unlink('./temp.xlsx');
			    return done(err);
			} else {
			    fs.unlink('./temp.xlsx');
			    done();
			}
		    });
		});
	});
	var download = function(url, dest, cb) {
	    var file = fs.createWriteStream(dest);
	    var request = https.get(url, function(response) {
		response.pipe(file);
		file.on('finish', function() {
		    console.log('no scene');
		    file.close(cb(null, dest));  // close() is async, call cb after close completes.
		});
	    }).on('error', function(err) {
		fs.unlink(dest);
		if (cb) cb(err.message);
	    });
	};

	var getFilesizeInBytes = function (filename) {
	    stats = fs.statSync(filename);
	    fileSizeInBytes = stats["size"];
	    return fileSizeInBytes;
	}
    });
});

