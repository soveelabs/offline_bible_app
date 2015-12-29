
// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('config');
var auth = require('./models/auth');
var session = require('express-session');
// MongoDB
console.log(config.get('mongo.uri'));
mongoose.connect(config.get('mongo.uri'));

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(auth.authenticate);
app.use(auth.getUid);


// Routes

app.use('/api', require('./routes/gateway_language_apis'));

app.use('/api', require('./routes/chapters'));

app.use('/api', require('./routes/books'));

app.use('/api', require('./routes/translation'));

app.use('/api', require('./routes/checkout'));

app.use('/api', require('./routes/exports'));

exports = module.exports = app;
