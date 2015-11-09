var Bible = require('../../models/bible'),
    app = require('../../server'),
    setup = require('../setup');

describe('Bible', function() {
  
  var validBibleArgs = {
    bibleId: '123abc',
    version: '1',
    langCode: 'en-asv',
    bibleUrl: 'http://foo.xml'
  };

  describe('find one', function() {

    beforeEach(function(done) {
      var bible = new Bible(validBibleArgs);
      bible.save(function(err, res) {
        if (err) { return done(err); }
        done();
      });
    });
    
    it('finds one matching bible', function(done) {
      Bible.findOne({bibleId: '123abc'}, function(err, res){ 
        expect(err).to.not.exist;
        expect(res).to.have.property('bibleId', '123abc');
        expect(res).to.have.property('books');
        expect(res).to.have.property('version', '1');
        expect(res).to.have.property('langCode', 'en-asv');
        expect(res).to.have.property('bibleUrl', 'http://foo.xml');
        done();
      });
    });
  
  });

});
