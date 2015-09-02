
// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Bible = require('../models/bible');



// Routes
Bible.methods(['get', 'put', 'post', 'delete']);

Bible.register(router, '/bibles');



// Return router
module.exports = router;
