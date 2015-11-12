var Book = require('../../models/book'),
    app = require('../../server'),
    setup = require('../setup');

describe('Books', function() {
  
  var validBooksArgs = {
    bookName: '123abc',
    bookId: '1',
    bibleId: 'en-asv',
    url: 'http://foo.xml',
    chapters: ["558baf2f1d24c1e514692054", "558baf2f1d24c1e514692055"]
  };

  describe('find one', function() {
    beforeEach(function(done) {
      var book = new Book(validBooksArgs);
      book.save(function(err, res) {
        if (err) { return done(err); }
        done();
      });
    });

    it('Finds one matching book', function(done) {
      Book.findOne({bookId: '1'}, function(err, res){
        expect(err).to.not.exist;
        expect(res).to.have.property('bookId', '1');
        expect(res).to.have.property('chapters');
        expect(res).to.have.property('bookName', '123abc');
        expect(res).to.have.property('bibleId', 'en-asv');
        expect(res).to.have.property('url', 'http://foo.xml');
        done();
      });
    });
  
  });

});
