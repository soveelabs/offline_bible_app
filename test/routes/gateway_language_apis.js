var request = require('supertest'),
    Bible = require('../../models/bible'),
    setup = require('../setup'),
    app = require('../../server');

describe('bibles', function() {

  describe('get /bibles', function() {

    beforeEach(function(done) {
      var bible = new Bible({bibleId: '123', version: '2', langCode: 'hi-id', bibleUrl: 'http://foo.bar' });
      bible.save(function(err, res) {
        if (err) { return done(err); }
        done();
      });
    });

    it('requires authentication', function(done) {
      request(app)
        .get('/api/bibles')
        .accept('json')
        .expect(401, done);
    });
  
    it('lists the bibles in the db', function(done) {
      request(app)
        .get('/api/bibles')
        .set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
        .accept('json')
        .expect(200)
        .end(function(err, res) {
          if (err) { return done(err); }
          expect(res.body.length).to.equal(1);
          expect(res.body[0]).to.have.property('bibleId', '123');
          expect(res.body[0]).to.have.property('version', '2');
          expect(res.body[0]).to.have.property('langCode', 'hi-id');
          expect(res.body[0]).to.have.property('bibleUrl', 'http://foo.bar');
          return done();
        });
    });

  });

  describe('post /bibles', function() {
    
    it('requires authentication', function(done) {
      request(app)
        .post('/api/bibles')
        .accept('json')
        .expect(401, done);
    });

    it('creates a bible', function(done) {
      request(app)
        .post('/api/bibles')
        .set('Authorization', 'Token token=' + process.env.AUTH_TOKEN)
        .accept('json')
        .send({"bibleId":"hin-dev","version":"Hindi Standard Version", "langCode":"hin", "bibleUrl":"https://s3.amazonaws.com/firma8-parallel/Test+Data/sample_usx.xml"})
        .expect(201)
        .end(function(err, res) {
          if (err) { return done(err);}
          Bible.findOne({bibleId: 'hin-dev'}, function(err, bible) {
            if (err) { return done(err); }
            expect(bible).to.have.property('bibleId', 'hin-dev');
            expect(bible).to.have.property('version', 'Hindi Standard Version');
            expect(bible).to.have.property('langCode', 'hin');
            expect(bible).to.have.property('bibleUrl', 'https://s3.amazonaws.com/firma8-parallel/Test+Data/sample_usx.xml');
            return done();
          });
        });
    });

  });

});
