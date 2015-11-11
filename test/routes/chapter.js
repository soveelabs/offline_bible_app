var request = require('supertest'),
    Book = require('../../models/book'),
    TranslatedBible = require('../../models/translated_bible'),
    Chapter = require('../../models/chapter'),
    Bible = require('../../models/bible'),
    setup = require('../setup'),
    app = require('../../server');

describe('chapter', function() {

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
    
    describe('get /chapters', function() {
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
		.get('/api/bibles/eng-asv/books/John/chapters')
		.accept('json')
		.expect(401, done);
	});

	it('fails for inexistent bibleId', function(done){
	    request(app)
		.get('/api/bibles/inexistentBibleId/books/bookid/chapters')
	        .set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(404, done);
	});
	
	it('lists the chapters in the db', function(done) {
	    request(app)
		.get('/api/bibles/eng-asv/books/John/chapters')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(200)
		.end(function(err, res) {
		    if (err) { return done(err); }
		    expect(res.body).to.have.property('bibleId', 'eng-asv');
		    expect(res.body).to.have.property('version', 'English Developer Edition');
		    expect(res.body).to.have.property('langCode', 'eng');
		    expect(res.body).to.have.property('bookId', 'John');
		    expect(res.body.chapters.length).to.equal(1);
		    expect(res.body.chapters[0]).to.have.property('chapter','3');
		    expect(res.body.chapters[0]).to.have.property('translations');
		    return done();
		});
	});
    });

        describe('post /chapters', function() {

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
		    .post('/api/bibles/eng-asv/books/John/chapters')
		    .accept('json')
		    .expect(401, done);
	    });

	    it('creates a chapter', function(done) {
		this.timeout(4000);
		request(app)
		    .post('/api/bibles/eng-asv/books/John/chapters')
		    .set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		    .accept('json')
		    .send({
			"chapters": [
			    {
				"chapter": 2,
				"url": "http://operationagape.com/soveetest/John_chapter_2.xml"
			    }
			]
		    })
		    .expect(201)
		    .end(function(err, res) {
			if (err) { return done(err);}
			Chapter.findOne({bookId:'John', chapter: '2'}, function(err, chapter){
			    expect(chapter).to.have.property('chapter','2');
			    expect(chapter).to.have.property('bookId','John');
			    expect(chapter).to.have.property('url','http://operationagape.com/soveetest/John_chapter_2.xml');
			    expect(chapter).to.have.property('translations');
			    return done();
			});
		    });
	    });
	});
});

