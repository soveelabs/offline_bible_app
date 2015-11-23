var request = require('supertest'),
Book = require('../../models/book'),
TranslatedBible = require('../../models/translated_bible'),
Chapter = require('../../models/chapter'),
Bible = require('../../models/bible'),
Verse = require('../../models/verse'),
setup = require('../setup'),
app = require('../../server');

describe('exporter', function() {

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
    
    describe('post /xlxs', function() {
	beforeEach(function(done) {
	    var translatedBible = new TranslatedBible(validTranslatedBibleArgs);
	    translatedBible.save(function(transErr, transBible){
		var chapter = new Chapter(validChapterArgs);
		chapter.translations.push({bibleId: translatedBible._id, url: 'http://translatedBible.foo'});
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
		.post('/api/bibles/eng-asv/books/John/chapters/3/xlsx')
		.accept('json')
		.expect(401, done);
	});

	it('exports a chapter to xlsx', function(done) {
	    this.timeout(4000);
	    request(app)
		.post('/api/bibles/eng-asv/books/John/chapters/3/xlsx')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.send({
		    "chapters": [
			{  
			    "book": "John",
			    "chapter":"3",
			    "sourceLang":"hindi",
			    "targetLang":"english",
			    "version": "developer version"
			}
		    ]
		})
		.expect(200)
		.end(function(err, res) {
		    if (err) { return done(err);}
		    expect(res.body).to.have.property('url');
		    done();
		});
	});
    });
});
