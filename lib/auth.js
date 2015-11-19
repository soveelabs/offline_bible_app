var request = require('request'),
    url = require('url'),
    config = require('config');

var Auth = {};
module.exports = Auth;

/**
 * Builds an Auth url based on the given path.
 *
 * @param {string} path
 */
Auth.authUrl = function(path) {
  if (typeof path == 'string'){
    return url.resolve(
      config.get('auth.host'),
      path
    );
  } else {
    return new Error("Path must be a string");
  }
};

/**
 * Returns array of hashes with language object
 *
 * @param {string} codes
 * @param {string} languages
 * @param {function} callback
 */
Auth.convertLanguageCodes = function(codes, languages, callback) {
  if ( !codes ) { return callback(new Error('You must specify codes'), null) };
  if ( !languages ) { return callback(new Error('You must specify languages'), null) };

  var langs = codes.map(function(code) {
    var languageHash = null;

    Auth.findLanguageByCode(code, languages, function(err, language) {
      var l = Object.keys(language).length;
      languageHash = {
        code: l > 0 ? language.code : code,
        name: l > 0 ? language.name : code,
        direction: l > 0 ? language.direction : 'ltr'
      }
    });

    return languageHash;
  });

  return callback(null, langs);
};

/**
 * Returns language object
 *
 * @param {string} code
 * @param {string} languages
 * @param {function} callback
 */
Auth.findLanguageByCode = function(code, languages, callback) {
  if ( !code ) { return callback(new Error('You must specify code'), null) };
  if ( !languages ) { return callback(new Error('You must specify languages'), null) };

  var matchingLanguage = {};

  languages.forEach(function(language) {
    if (code === language.code) {
      matchingLanguage = language;
    }
  });

  return callback(null, matchingLanguage);
};

/**
 * Locates a particular customer's record in the Auth response.
 *
 * @param {string} customer
 * @param {string} user
 * @param {function} callback
 */
Auth.findCustomer = function(customer, user, callback) {
  if ( !customer ) { return callback(new Error('You must specify customer'), null) };
  if ( !user ) { return callback(new Error('You must specify user'), null) };

  var customers = user.extra.customers;
  var matchingCustomer = null;

  customers.forEach(function(_customer) {
    if ( _customer.name.toLowerCase() === customer.toLowerCase() || _customer.id === customer) {
      matchingCustomer = _customer;
    }
  });

  return callback(null, matchingCustomer);
};

/**
 * Returns array of language codes from customer object
 *
 * @param {string} customer
 * @param {string} user
 * @param {function} callback
 */
Auth.findLanguagesByCustomer = function(customer, user, callback) {
  if ( !customer ) { return callback(new Error('You must specify customer'), null) };
  if ( !user ) { return callback(new Error('You must specify user'), null) };


  Auth.findCustomer(customer, user, function(err, _customer) {
    return callback(null, _customer ? _customer.languages : []);
  });
};

/**
 * Return formatted languages to include code, name and direction
 *
 * @param {string} languages
 * @param {function} callback
 */
Auth.formatLanguageJson = function(languages, callback) {
  if ( !languages ) { return callback(new Error('You must specify languages'), null) };

  var formattedLanguages = [];

  languages.map(function(lang) {
    formattedLanguages.push({
      code: lang.alpha2 ? lang.alpha2 : lang.alpha3,
      name: lang.name,
      direction: lang.direction
    });

    if ( lang.regions.length > 0 ) {
      lang.regions.forEach(function(region) {
        code = lang.alpha2 ? lang.alpha2 : lang.alpha3;
        formattedLanguages.push({
          code: code + '-' + region.code,
          name: lang.name + '-' + region.name,
          direction: lang.direction
        });
      });
    }
  });

  return callback(null, formattedLanguages);
};
