// Dependencies
var express = require('express');
var router = express.Router();

var request = require('request');
var _ = require('lodash');

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter = require('../models/chapter');
var Verse = require('../models/verse');

// Gateway Language Bible Routes

// CREATE Gateway Language Bibles
router.route('/bibles').post(function(req, res){

  Bible.findOne({
    bibleId: {
      $regex: new RegExp(req.body.bibleId, "i")
    }
  }, function(err, bible) { // Using RegEx - search is case insensitive
    if (!err && !bible) {

      // Bible model
      var newBible = new Bible();
      var count = 1;

      newBible.bibleId = req.body.bibleId;
      newBible.version = req.body.version;
      newBible.langCode = req.body.langCode;
      newBible.bibleUrl = req.body.bibleUrl;

      request({
          url: process.env.PARALLEL_HOST + "/json?usfx=" +  req.body.bibleUrl //URL to hit
      }, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            // data for Book
            var resJson = JSON.parse(body);
            var bookData = resJson.books;

            bookData.forEach(function(book, index, array){

              var i = 0;
              var newChapIds = [];
              var chapData = bookData[index].chapters;

              chapData.forEach(function(verses) {

                var newVerseIds = [];

                _.forEach(verses, function(versesChapter, chapterKey){

                  // Chapter model
                  var newChapter = Chapter();
                  newChapter.chapterId = chapterKey;
                  newChapter.bookId = bookData[index].name;
                  newChapter.bibleId = req.body.bibleId;
                  newChapter.save();
                  newChapIds.push(newChapter._id);

                  _.forEach(versesChapter, function(verseValue, verseKey){

                      // Verse model
                      var newVerse = Verse();
                      newVerse.verseNumber = verseKey;
                      newVerse.verse = verseValue;
                      newVerse.chapterId = chapterKey;
                      newVerse.bookId = bookData[index].name;
                      newVerse.bibleId = req.body.bibleId;
                      newChapter.verses.push(newVerse._id)
                      newVerse.save()

                  })
                })
              })

              // Book Model
              var newBook = new Book();
              newBook.bookName = bookData[index].toc[1].text.trim();
              newBook.bibleId = req.body.bibleId;
              newBook.bookId = bookData[index].name;
              newBook.chapters = newChapIds;
              newBible.books.push(newBook._id); //Saving ref of books to Bible model.
              newBook.save()

            });

              if (count == 1) {
                newBible.save(function(err) {
                  if (!err) {
                    res.status(201).json({
                      message: "Bible created with bibleId: " + req.body.bibleId
                    });
                  } else {
                    res.status(500).json({
                      message: "Could not create Bible. Error: " + err
                    });
                  }
                });
              }count++;

        } else if(error) {
         return res.send(error);
        }
         console.log("i am here bottom");
      });

    } else if (!err) {

      // User is trying to create a Bible with a BibleId that already exists.
      res.status(403).json({
        message: "Cannot create Bible with the same Bible ID."
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
    var gatewayList = [];
    bibles.forEach(function(element){
      var resArry = {};
      resArry['bibleId'] = element.bibleId;
      resArry['version'] = element.version;
      resArry['langCode'] = element.langCode;
      resArry['bibleUrl'] = element.bibleUrl;

      gatewayList.push(resArry);
    });
    res.status(200).json(gatewayList);
  });
});

// UPDATE Gateway Language Bibles

router.route('/bibles/:bible_id').put( function(req, res) {
  var bibleId = req.params.bible_id;

  Bible.findOne({'bibleId':bibleId}, function(err, bible) {
    if (!err && bible) {
      bible.version = req.body.version;
      bible.langCode = req.body.langCode;

      bible.save(function(err) {
        if (!err) {
          res.status(200).json({
            message: "Bible updated: " + bibleId
          });
        } else {
          res.status(500).json({
            message: "Could not update bible. " + err
          });
        }
      });
    } else if (!err) {
      res.status(404).json({
        message: "Could not find bible."
      });
    } else {
      res.status(500).json({
        message: "Could not update bible." + err
      });
    }
  });
});

// Return router
module.exports = router;
