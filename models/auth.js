var request = require('request');

var auth = {};
module.exports = auth;

/**
 * Validates API request
 *
 * Extracts the auth token from the authorization header
 * and validates it with the Auth app
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
auth.authenticate = function(req, res, next) {
  var token = auth.extractToken(req);
  if (!token) { return sendError(res, 401); }

  // validate the token with Auth
  auth.checkToken(token, function(err, resp) {
    if (err) { return sendError(res, 500); }
    if (resp !== true) { return sendError(res, 401); }

    req.authToken = token;
    return next();
  });
  
}

/**
 * Extracts an auth token from the request header
 *
 * @param {object} req
 */
auth.extractToken = function(req) {
  var authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) { return null; }

  var re = /^Token token=([a-zA-Z0-9]*)$/g;
  var match = re.exec(authorizationHeader);
  var token = (match !== null) ? match[1] : '';
  if (token === '') { return null }
  return token;
}

/**
 * Sends a token to Auth to validate endpoint for validation.
 *
 * @param {string} token
 * @param {function} callback
 */
auth.checkToken = function(token, callback) {
  var options = {
    url: process.env.AUTH_HOST + '/auth/validate',
    qs: { 'token': token },
    headers: { 'Accept': 'application/json' }
  };

  request.get(options, function(err, res, body) {
    if (err) {
      return callback(new Error('Error communicating with auth: ', err.message), null);
    } else if (res.statusCode != 200) {
      return callback(new Error('Non-Success returned from auth: ' + res.statusCode), null);
    } else {
      var authResponse = JSON.parse(body);
      return callback(null, typeof authResponse.error === 'undefined');
    }
  });
}

/**
 * Sends error message
 *
 * @param {object} res
 * @param {integer} code
 * @param {array} errs
 */
function sendError(res, code, errs) {
  var resp = { error: {} };
  var message = null;

  switch(code) {
    case 401:
      message = 'Invalid/missing Auth token';
      break;
    case 500:
      message = 'Unable to authenticate';
      break;
  }
  if (message) { resp.error.message = message; }
  if (errs) { resp.error.errors = errs; }
  return res.status(code).send(resp);
}
