var request = require('request'),
    url = require('url'),
    config = require('config');

var Alchemy = {};

/**
 * Alchemy subclasses
 */
Alchemy.translate = {};
Alchemy.parse = {};

module.exports = Alchemy;

/**
 * Builds an Alchemy url based on the given path.
 *
 * @param {string} path
 */
Alchemy.buildUrl = function(path) {
  if (typeof path == 'string'){
    return url.resolve(
      config.get('alchemy.host'),
      path
    );
  } else {
    return new Error("Path must be a string");
  }
};

/**
 * Retrieves translation for a text string
 *
 * @param {string} text
 * @param {string} from
 * @param {string} to
 * @param {string} customer
 * @param {string} token
 * @param {function} callback
 */
Alchemy.translate.text = function(text, from, to, customer, token, callback) {
  var options = {
    url: Alchemy.buildUrl('/text'),
    qs: {text: text, from: from, to: to, customer: customer, token: token},
    headers: {'Accept': 'application/json'}
  };

  request.get(options, function(err, res, body) {
    return callback(err, res);
  });
};

/**
 * Retrieves translation for html fragment
 *
 * @param {string} html
 * @param {string} from
 * @param {string} to
 * @param {string} customer
 * @param {string} token
 * @param {function} callback
 */
Alchemy.translate.htmlFragment = function(html, from, to, customer, token, callback) {
  var options = {
    url: Alchemy.buildUrl('/html-fragment'),
    qs: {html: html, from: from, to: to, customer: customer, token: token},
    headers: {'Accept': 'application/json'}
  };

  request.get(options, function(err, res, body) {
    return callback(err, res);
  });
};
