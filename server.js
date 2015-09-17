
// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var oauthserver = require('node-oauth2-server');
var auth = require('node-auth');

// MongoDB
mongoose.connect('mongodb://localhost/bible_app');

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.oauth = oauthserver({
  	model: require('./models/oauth'), // See below for specification 
    grants: ['password', 'authorization_code', 'refresh_token'],
    debug: true,
    accessTokenLifetime: 60 * 60 * 24
});
 
app.all('/oauth/token', app.oauth.grant());
 
app.use(app.oauth.errorHandler());


// Routes
app.use('/api', app.oauth.authorise(), require('./routes/gateway_language_apis'));


 // Auth for sovee
  // mw = auth({
  //   auth: {
  //     host: 'https://staging-auth.sovee.com'
  //   }
  // });

  // app.use('/api', mw.api);
  // app.use(/^\/(?!api(\/|$)).*$/, mw.app);
  // app.use('/api', mw.routes, require('./routes/api'));

// Start server
app.listen(3000);
console.log('Offline Bible APP is running on port 3000');
