
// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('config');

// MongoDB
mongoose.connect(config.get('mongo.uri'));

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes

app.use('/api', require('./routes/gateway_language_apis'));

app.use('/api', require('./routes/chapters'));

app.use('/api', require('./routes/books'));

app.use('/api', require('./routes/translation'));

app.use(session({secret: 'MY_SECRET'}));

// Start server
app.listen(3000);
console.log('Offline Bible APP is running');
