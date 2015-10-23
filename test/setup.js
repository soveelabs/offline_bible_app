process.env.NODE_ENV = 'test';

var nock = require('nock'),
    config = require('config'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    url = require('url');

chai.use(sinonChai);
global.expect = chai.expect;
    
exports = module.exports = {};
