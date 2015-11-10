process.env.NODE_ENV = 'test';

var nock = require('nock'),
    config = require('config'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    mongoose = require('mongoose'),
    url = require('url');

chai.use(sinonChai);
global.expect = chai.expect;
    
beforeEach(function(done) {
  mongoose.connection.db.collections(function(err, collections) {
    if (err) return done(err);

    if (collections.length === 0) return done();

    var validCollections = [];

    for (var i = 0; i < collections.length; i++) {
      if (/^system\./.test(collections[i].collectionName) !== true) {
        validCollections.push(collections[i]);
      }
    }

    var cleanedCollections = [];

    if (validCollections.length === 0) { return done(); }

    validCollections.forEach(function(collection) {
      collection.drop(function() {
        cleanedCollections.push(collection);
        if (cleanedCollections.length === validCollections.length) return done();
      });
    });
  });
});

exports = module.exports = {};
