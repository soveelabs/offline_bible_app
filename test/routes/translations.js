var request = require('supertest'),
Book = require('../../models/book'),
TranslatedBible = require('../../models/translated_bible'),
Chapter = require('../../models/chapter'),
Bible = require('../../models/bible'),
Verse = require('../../models/verse'),
setup = require('../setup'),
app = require('../../server');

describe('translations', function() {

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
    
    describe('get /translations', function() {
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
		.get('/api/bibles/eng-asv/books/John/chapters/3/translations')
		.accept('json')
		.expect(401, done);
	});

	it('fails for inexistent bibleId', function(done){
	    request(app)
		.get('/api/bibles/inexistentBibleId/books/bookid/chapters/translations')
	        .set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(404, done);
	});
	
	it('lists the translations for the chapter', function(done) {
	    request(app)
		.get('/api/bibles/eng-asv/books/John/chapters/3/translations')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(200)
		.end(function(err, res) {
		    if (err) { return done(err); }
		    expect(res.body).to.have.property('bibleId', 'eng-asv');
		    expect(res.body).to.have.property('version', 'English Developer Edition');
		    expect(res.body).to.have.property('langCode', 'eng');
		    expect(res.body).to.have.property('bookId', 'John');
		    expect(res.body).to.have.property('chapter', '3');
		    expect(res.body.translations[0]).to.have.property('bibleId','hin-dev');
		    expect(res.body.translations[0]).to.have.property('version','Hindi Developer Edition');
		    expect(res.body.translations[0]).to.have.property('langCode','hin');
		    expect(res.body.translations[0]).to.have.property('url','http://translatedBible.bar');
		    done();
		});
	});
    });

    describe('post /translations', function() {

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
		.post('/api/bibles/eng-asv/translations')
		.accept('json')
		.expect(401, done);
	});

	it('creates a translations', function(done) {
	    this.timeout(4000);
	    request(app)
		.post('/api/bibles/eng-asv/translations')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.send({
		    "translations":[
			{
			    "bibleId": "kfx-std",
			    "version": "Kulvi Standard Version",
			    "langCode": "kfx"
			}
                    ]
		})
		.expect(201)
		.end(function(err, res) {
		    if (err) { return done(err);}
		    TranslatedBible.findOne({bibleId:'kfx-std'}, function(err, translatedBible){
			expect(translatedBible).to.have.property('version','Kulvi Standard Version');
			expect(translatedBible).to.have.property('sourceBibleId','eng-asv');
			expect(translatedBible).to.have.property('langCode','kfx');
			done();
		    });
		});
	});
    });

    describe('get /translations/translated_bible_id', function() {

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
		.get('/api/bibles/eng-asv/books/John/chapters/3/translations/hin-dev')
		.accept('json')
		.expect(401, done);
	});

	it('gets a specific translations', function(done) {
	    request(app)
		.get('/api/bibles/eng-asv/books/John/chapters/3/translations/hin-dev')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(200)
		.end(function(err, res) {
		    expect(err).to.not.exist;
		    expect(res.body).to.have.property('bibleId','eng-asv');
		    expect(res.body).to.have.property('bookId','John');
		    expect(res.body).to.have.property('chapter','3');
		    expect(res.body).to.have.property('version','English Developer Edition');
		    expect(res.body).to.have.property('langCode','eng');
		    expect(res.body.translations[0]).to.have.property('bibleId','hin-dev');
		    expect(res.body.translations[0]).to.have.property('version','Hindi Developer Edition');
		    expect(res.body.translations[0]).to.have.property('langCode','hin');
		    expect(res.body.translations[0]).to.have.property('url','http://translatedBible.foo');
		    done();
		    });
	});
    });

    describe('put /translations/translated_bible_id', function() {
	beforeEach(function(done) {
	    var translatedBible = new TranslatedBible(validTranslatedBibleArgs);
	    translatedBible.save(function(transErr, transBible){
		var chapter = new Chapter(validChapterArgs);
		chapter.translations.push({bibleId: translatedBible._id, url: 'http://translatedBible.foo/file.xml'});
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
		.put('/api/bibles/eng-asv/books/John/chapters/3/translations/hin-dev')
		.accept('json')
		.expect(401, done);
	});

	it('updates a specific translations', function(done) {
	    request(app)
		.put('/api/bibles/eng-asv/books/John/chapters/3/translations/hin-dev')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
	        .send({
		    'url': 'http://sovee-bibleapp.s3.amazonaws.com/sovee-bible-app/development/hin-dev/John/chapter_1/John_chapter_1_hin-dev_to_kfx-nt.xlsx'
		})
		.expect(200)
		.end(function(err, res) {
		    expect(err).to.not.exist;
		    expect(res.body).to.have.property('bibleId','eng-asv');
		    expect(res.body).to.have.property('bookId','John');
		    expect(res.body).to.have.property('chapter','3');
		    expect(res.body).to.have.property('version','English Developer Edition');
		    expect(res.body).to.have.property('langCode','eng');
		    expect(res.body.translations[0]).to.have.property('bibleId','hin-dev');
		    expect(res.body.translations[0]).to.have.property('version','Hindi Developer Edition');
		    expect(res.body.translations[0]).to.have.property('langCode','hin');
		    expect(res.body.translations[0]).to.have.property('url','http://sovee-bibleapp.s3.amazonaws.com/sovee-bible-app/development/hin-dev/John/chapter_1/John_chapter_1_hin-dev_to_kfx-nt.xlsx');
		    done();
		    });
	});
    });
});

