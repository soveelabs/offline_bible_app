var Chapter = require('../../models/chapter'),
    app = require('../../server'),
    setup = require('../setup');

describe('Chapter', function() {
  
  var validChapterArgs = {
    bookId: '123abc',
    chapter: '1',
    translations: [{bibleId:'558baf2f1d24c1e514692054', url:'http://translation.bar'}],
    url: 'http://foo.xml'
  };

  describe('find one', function() {

    beforeEach(function(done) {
      var chapter = new Chapter(validChapterArgs);
      chapter.save(function(err, res) {
        if (err) { return done(err); }
        done();
      });
    });

    it('finds one matching chapter', function(done) {
      Chapter.findOne({bookId: '123abc', chapter:'1'}, function(err, res){
        expect(err).to.not.exist;
        expect(res).to.have.property('bookId', '123abc');
        expect(res).to.have.property('chapter', '1');
        expect(res).to.have.property('url', 'http://foo.xml');
        expect(res).to.have.property('translations');
	expect(res.translations[0]).to.have.property('url', 'http://translation.bar');
	expect(res.translations[0]).to.have.property('bibleId');
        done();
      });
    });
  
  });

});
