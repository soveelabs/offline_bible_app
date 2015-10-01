// Dependencies
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');


// Bible Translation Routes

// CREATE Translation
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/translations').post(function(req, res){

  console.log(req.body);

  Chapter.findById(req.params.chapter_id, function(err, chapter) {
           
    if (!err && chapter) {

      console.log(chapter);
                    
      chapter.translations.push(req.body);
        
      chapter.save(function(err) {         
        
        if (!err) {
          res.status(201).json({
            message: "Translation for chapter Id: " + req.params.chapter_id + " saved."
          });
        } else {
          res.status(500).json({
            message: "Could not create chapter translation. Error: " + err
          });
        }
                          
      });
    } else if (!err) {
      res.status(404).json({
        message: "Could not find chapter with the chapterId."
      });
    }
  });
           
});

// LIST translations Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/translations').get(function(req, res) {
    bibleId = req.params.bible_id;
    bookId = req.params.book_id;
    chapterId = req.params.chapter_id;
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

    Chapter.findOne({'_id':chapterId}, function(err, chapters) {
        if (err) {
            return res.send(err);
        }
        json['chapter'] = chapters['chapter'];
        json['translations'] = chapters['translations'];
        res.json(json);
    });
});


// UPDATE Translation
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/translations/:translated_bible_id').put(function(req, res){

  Chapter.findById(req.params.chapter_id, function(err, chapter) {
           
    if (!err && chapter) {

     var length = chapter.translations.length;   
     for (var i = 0; i < length; i++) {
         
         console.log(chapter.translations[i]['bibleId']);
         
         if (chapter.translations[i]['bibleId'] == req.params.translated_bible_id) {
              chapter.translations[i]['url'] = req.body.url;
         }
     }
        
      chapter.save(function(err) {         
        
        if (!err) {
          res.status(201).json({
            message: "Translation for chapter Id: " + req.params.chapter_id + " updated."
          });
        } else {
          res.status(500).json({
            message: "Could not create chapter translation. Error: " + err
          });
        }
                          
      });
    } else if (!err) {
      res.status(404).json({
        message: "Could not find chapter with the chapterId."
      });
     }
  });
           
});


// Return router
module.exports = router;
