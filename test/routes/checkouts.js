var request = require('supertest'),
Book = require('../../models/book'),
TranslatedBible = require('../../models/translated_bible'),
Chapter = require('../../models/chapter'),
Bible = require('../../models/bible'),
Verse = require('../../models/verse'),
setup = require('../setup'),
app = require('../../server');

describe('checkout', function() {

    var validTranslatedBibleArgs = {
	bibleId: 'hin-dev',
	version: 'Hindi Developer Edition',
	langCode: 'hin',
	bibleUrl: 'http://foo.hin.bar',
    };
    
    var validChapterArgs = {
	bookId: 'John',
	chapter: '3',
	url: 'http://bar.xml'
    };
    
    var validBookArgs = {
	bookName: 'John',
	bookId: 'John',
	bibleId: 'eng-asv',
	url: 'http://foo.xml'
    };

    var validBibleArgs = {
	bibleId: 'eng-asv',
	version: 'English Developer Edition',
	langCode: 'eng',
	bibleUrl: 'http://foo.xml',
    };
    
    describe('put /checkout', function() {
      	beforeEach(function(done) {
	    var translatedBible = new TranslatedBible(validTranslatedBibleArgs);
	    translatedBible.save(function(transErr, transBible){
		var chapter = new Chapter(validChapterArgs);
		chapter.translations.push({bibleId: translatedBible._id, url: 'http://translatedBible.bar'});
		chapter.save(function(chapterErr, chapt) {
		    if (chapterErr) { return done(chapterErr); }
		    var book = new Book(validBookArgs);
		    book.chapters.push(chapter._id);
		    book.save(function(err, bookRes) {
			if (err) { return done(err); }
			var bible = new Bible(validBibleArgs);
			book_id = book._id;
			bible.books.push(book._id);
			bible.save(function(bibleErr, res) {
			    if (bibleErr){ return done(bibleErr); }
			    done();
			});
		    });
		});
	    });
	});
	
	it('requires authentication', function(done) {
	    request(app)
		.put('/api/bibles/eng-asv/books/John/chapters/3/checkout')
		.accept('json')
		.expect(401, done);
	});

	it('fails for inexistent chapterId', function(done){
	    request(app)
		.put('/api/bibles/inexistentBibleId/books/bookid/chapters/3/checkout')
	        .set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(404, done);
	});
	
	it('checks out a specific chapter', function(done) {
	    request(app)
		.put('/api/bibles/eng-asv/books/John/chapters/3/checkout')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(200)
		.send({'checkout':'true'})
		.end(function(err, res) {
		    if (err) { return done(err); }
		    Chapter.findOne({bookId:'John', chapter: '3'}, function(err, chapter){
			expect(chapter).to.have.property('chapter','3');
			expect(chapter).to.have.property('bookId','John');
			expect(chapter).to.have.property('url','http://bar.xml');
			expect(chapter.checkout).not.to.be.null;
		    });
		    done();
		});
	});

	it('releases a specific chapter', function(done) {
	    request(app)
		.put('/api/bibles/eng-asv/books/John/chapters/3/checkout')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(200)
		.send({'checkout':'false'})
		.end(function(err, res) {
		    if (err) { return done(err); }
		    Chapter.findOne({bookId:'John', chapter: '3'}, function(err, chapter){
			expect(chapter).to.have.property('chapter','3');
			expect(chapter).to.have.property('bookId','John');
			expect(chapter).to.have.property('url','http://bar.xml');
			expect(chapter.checkout).to.be.null;
		    });
		    done();
		});
	});
    });
});

