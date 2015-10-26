var auth = require('../../models/auth'),
    setup = require('../setup'),
    express = require('express'),
    request = require('supertest'),
    nock = require('nock');

describe('auth', function() {

  describe('authenticate', function() {
    var app,
        requestObj,
        response,
        result;

    before(function() {
      app = express();
      app.use(auth.authenticate);
      app.use(function(req, res, next) {
        requestObj = req;
        res.end();
      });
    });

    after(function() {
      nock.cleanAll();
    });
    
    context('when token is valid', function() {
      beforeEach(function(done) {
        nock(process.env.AUTH_HOST)
          .get('/auth/validate?token=token')
          .reply(200, '{}');

        request(app)
          .get('/')
          .set('Authorization', 'Token token=token')
          .end(function(err, res) {
            response = res;
            result = res.body;
            done();
          });
      });

      it('responds with 200', function(done) {
        expect(response).to.have.property('statusCode', 200);
        done();
      });

      it('assigns the token to the request', function(done) {
        expect(requestObj).to.have.property('authToken', 'token');
        done();
      });
    
    });
  });
  
  describe('.extractToken', function() {
    
    context('when token is passed', function() {
      it('extracts token from header', function(done) {
        var req = { headers: { authorization: 'Token token=123456ABCabc' }};
        expect(auth.extractToken(req)).to.equal('123456ABCabc');
        done();
      });
    });

    context('when token is not passed', function() {
      it('returns null', function(done) {
        var req = { headers: { authorization: null }};
        expect(auth.extractToken(req)).to.equal(null);
        done();
      });
    });

    context('token is not passed properly', function() {
      it('returns null', function(done) {
        var req = { headers: { authorization: 'abcAbC123' } };
        expect(auth.extractToken(req)).to.equal(null);
        done();
      });
    });

  });

  describe('.checkToken', function() {
    
    context('when token is valid', function() {
    
      it('returns true', function(done) {
        var token = 'ea63a9770c6c577b1188167000715ddb9312557e';
        auth.checkToken(token, function(err, response) {
          if (err) { return done(err); }
          expect(response).to.equal(true);
          done();
        });
      });

    });

    context('when token is not valid', function() {
      
      it('returns false', function(done) {
        var token = 'abc123';
        auth.checkToken(token, function(err, response) {
          expect(err).not.to.be.null;
          expect(response).to.equal(null);
          done();
        });
      });
    });

  });

});
