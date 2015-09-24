// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');


// Bible Chapter Routes

// CREATE Chapters
router.route('/bibles/:bible_id/books/:book_id').post(function(req, res){

console.log(req.body);

  Chapter.findOne({
    bibleId: {
      $regex: new RegExp(req.params.bible_id, "i")
    }
  }, function(err, chapter) { // Using RegEx - search is case insensitive
    if (!err && !chapter) {
      var chapter = new Chapter();

      chapter.chapters = req.body.chapters;
      chapter.bookId = req.params.book_id;
      
      chapter.save(function(err) {
        if (!err) {
          res.status(201).json({
            message: "Chapters created for Book Id: " + req.params.book_id
          });
        } else {
          res.status(500).json({
            message: "Could not create chapter. Error: " + err
          });
        }
      });

    }  else {
      res.status(500).json({
        message: err
      });
    }
  });

});

// LIST Bible Book Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters').get(function(req, res) {
    bibleId = req.params.bible_id;
    bookId = req.params.book_id;
    Chapter.find({'bookId':bookId}, function(err, chapters) {
        if (err) {
            return res.send(err);
        }
        res.json(chapters);
    });
});

// Update Chapters

router.route('/bibles/:bible_id/books/:book_id').put( function(req, res) {
  var bibleId = req.params.bible_id;
  var bookId = req.params.book_id;
  Chapter.findOne({'bookId':bookId}, function(err, chapter) {
    if (!err && chapter) {
      chapter.bookId = bookId;
      chapter.chapters = req.body.chapters;

      chapter.save(function(err) {
        if (!err) {
          res.status(200).json({
            message: "Chapters updated: " + bookId
          });
        } else {
          res.status(500).json({
            message: "Could not update chapter. " + err
          });
        }
      });
    } else if (!err) {
      res.status(404).json({
        message: "Could not find book."
      });
    } else {
      res.status(500).json({
        message: "Could not update chapters ." + err
      });
    }
  });
});


// Return router
module.exports = router;
