
// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Bible = require('../models/bible');


// Routes
router.route('/bibles').get(function(req, res) {
  Bible.find(function(err, bibles) {
    if (err) {
      return res.send(err);
    }
    res.json(movies);
  });
});



// Return router
module.exports = router;
