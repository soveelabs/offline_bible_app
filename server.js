
// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('config');
var auth = require('./models/auth');

// MongoDB
console.log(config.get('mongo.uri'));
mongoose.connect(config.get('mongo.uri'));

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(auth.authenticate);

// Routes

app.use('/api', require('./routes/gateway_language_apis'));

app.use('/api', require('./routes/chapters'));

app.use('/api', require('./routes/books'));

app.use('/api', require('./routes/translation'));

app.use('/api', require('./routes/exporter'));

app.use(session({secret: 'MY_SECRET',  resave: true, saveUninitialized: true}));

app.listen(3000);

console.log('Offline Bible APP is running');

exports = module.exports = app;
