var request = require('supertest'),
    Book = require('../../models/book'),
    Bible = require('../../models/bible'),
    setup = require('../setup'),
    app = require('../../server');

describe('books', function() {

    var validBookArgs = {
	bookName: 'John',
	bookId: '1',
	bibleId: 'en-asv',
	url: 'http://foo.xml',
	chapters: ["558baf2f1d24c1e514692054", "558baf2f1d24c1e514692055"]
    };

    var validBibleArgs = {
	bibleId: 'en-asv',
	version: 'English Developer Edition',
	langCode: 'eng',
	bibleUrl: 'http://foo.xml',
    };
    
    describe('get /books', function() {
	var book_id = '1234';
      	beforeEach(function(done) {
	    var book = new Book(validBookArgs);
	    book.save(function(err, res) {
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
	
//	it('fails for inexistent bibleId', function(done){
//	    request(app)
//		.get('/api/bibles/inexistentBibleId/books')
//	        .set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
//		.accept('json')
//		.expect(404, done);
//	});
    
	it('requires authentication', function(done) {
	    request(app)
		.get('/api/bibles/eng-asv/books')
		.accept('json')
		.expect(401, done);
	});
	
	it('lists the books in the db', function(done) {
	    request(app)
		.get('/api/bibles/en-asv/books')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.expect(200)
		.end(function(err, res) {
		    if (err) { return done(err); }
		    expect(res.body).to.have.property('bibleId', 'en-asv');
		    expect(res.body).to.have.property('version', 'English Developer Edition');
		    expect(res.body).to.have.property('langCode', 'eng');
		    expect(res.body).to.have.property('Books');
		    expect(res.body.Books.length).to.equal(1);
		    return done();
		});
	});
    });


    describe('post /books', function() {
	this.timeout(9000);
	it('requires authentication', function(done) {
	    request(app)
		.post('/api/bibles/en-asv/books')
		.accept('json')
		.expect(401, done);
	});

      	beforeEach(function(done) {
	    var book = new Book(validBookArgs);
	    book.save(function(err, res) {
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
	
	it('creates a book', function(done) {
	    request(app)
		.post('/api/bibles/en-asv/books')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.send({
		    books:
		    [{
			"bookId": "Acts",
			"url": "http://operationagape.com/soveetest/Acts.xml"
		    }]
		})
		.expect(201)
		.end(function(err, res) {
		    if (err) { return done(err);}
		    Book.findOne({bookId:'Acts'}, function(err, book) {
			expect(book).to.have.property('bibleId', 'en-asv');
			expect(book).to.have.property('bookName', 'Acts');
			expect(book).to.have.property('bookId', 'Acts');
			expect(book).to.have.property('url', 'http://operationagape.com/soveetest/Acts.xml');
			expect(book).to.have.property('chapters');
			return done();			
		    });
		});
	});	

	it('unable to create a book', function(done) {
	    request(app)
		.post('/api/bibles/en-asv/books')
		.set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
		.accept('json')
		.send({
		    books:
		    [{
			"bookId": "1",
			"url": "http://operationagape.com/soveetest/Acts.xml"
		    }]
		})
		.expect(403)
		.end(function(err, res) {
		    if (err) { console.log(err);}
		       	assert.equal(res, "Cannot create Book with the same Book Name.")
			return done();			
		    });
		});
	});


});
