// Dependencies
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

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
              var bookId = req.params.book_id;
              console.log(bookId);

              Book.findById(bookId, function(err, book) {
              
                  if (!err && book) {
 
                      var chapter = new Chapter();
                      chapter.chapter = req.body.chapter;
                      chapter.bookId = bookId;
                      chapter.url = req.body.url;
                      chapter.translations = req.body.translations;
                      console.log(book);
                      
                      book.chapters.push(chapter._id);
        
                      chapter.save(function(err) {         
        
                          book.save(function(bookErr) {
                              if (!err && !bookErr) {
                                  res.status(201).json({
                                      message: "Chapters created for Book Id: " + req.params.book_id
                                  });
                              } else {
                                  res.status(500).json({
                                      message: "Could not create chapter. Error: " + err
                                  });
                              }
                          });
                      });
                    } else if (!err) {
                          res.status(404).json({
                              message: "Could not find book with the bookId."
                          });
                    }
              });
            } else if (!err) {
                           res.status(403).json({
                               message: "Cannot create chapter."
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
    var json = {};

    json['bibleId'] = bibleId;
    json['bookId'] = bookId;

    Bible.findOne({'bibleId':bibleId}, function(err, bibles) {
        if (err) {
            return res.send(err);
        }
        //console.log(bibles);
        //json.bible = bibles;
        
        json['version'] = bibles['version'];
        json['langCode'] = bibles['langCode'];
        
      });

        Chapter.find({'bookId':bookId}, function(err, chapters) {
        if (err) {
            return res.send(err);
        }
        json.chapters= chapters;
        res.json(json);
    });
});

// Update Chapters

router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id').put( function(req, res) {
  var bibleId = req.params.bible_id;
  var bookId = req.params.book_id;
  Chapter.findOne({'bookId':bookId}, function(err, chapter) {
    if (!err && chapter) {
       chapter.bookId = bookId;
       chapter.chapter = req.body.chapter;
       chapter.url = req.body.url;
       chapter.translations = req.body.translations;

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
