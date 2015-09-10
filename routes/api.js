
// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Bible = require('../models/bible');


// Routes

// CREATE Gateway Language Bibles
router.route('/bibles').post(function(req, res){

  // Bible info from request body
  var bibleId = req.body.bibleId;
  var version = req.body.version;
  var langCode = req.body.langCode;
  var bibleUrl = req.body.bibleUrl;

  Bible.findOne({
    bibleId: {
      $regex: new RegExp(bibleId, "i")
    }
  }, function(err, bib) { // Using RegEx - search is case insensitive
    if (!err && !bib) {
      var newBible = new Bible();

      newBible.bibleId = bibleId;
      newBible.version = version;
      newBible.langCode = langCode;
      newBible.bibleUrl = bibleUrl;
      newBible.save(function(err) {
        if (!err) {
          res.status(201).json({
            message: "Bible created with bibleId: " + newBible.bibleId
          });
        } else {
          res.status(500).json({
            message: "Could not create Bible. Error: " + err
          });
        }
      });

    } else if (!err) {

      // User is trying to create a Bible with a BibleId that already exists.
      res.status(403).json({
        message: "Bible with that BibleId already exists, please update instead of create or create a new Bible with a different Bible Id."
      });

    } else {
      res.status(500).json({
        message: err
      });
    }
  });

});

// LIST Gateway Language Bibles
router.route('/bibles').get(function(req, res) {
  Bible.find(function(err, bibles) {
    if (err) {
      return res.send(err);
    }
    res.json(bibles);
  });
});

// Return router
module.exports = router;
