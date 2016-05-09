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
        // console.log(res)

        if (!error && response.statusCode == 200) {

            // data for Book

            var resJson = JSON.parse(body);

            // resJson.forEach(function(book){
            resJson.books.forEach(function(book, index, array){

              // var jbooks = resJson.books

                // var bookMetadata = [];
                // var info = _.pluck(books, 'info');
                // info.forEach(function(bookInfo){

                //   bookInfo.forEach(function(oneBookInfo){
                //       var tempTxt = {};
                //       tempTxt[oneBookInfo.text] = oneBookInfo.type;
                //       bookMetadata.push(tempTxt);
                //   });
                // });

                keys = Object.keys(book);
                // var verses = _.pluck(resJson.books, 'chapters');

                var verses = resJson.books[index].chapters;
                // console.log(verses)

                var i = 0;
                var newChapIds = [];
                var newVerseIds = [];

                verses.forEach(function(versee) {

                  _.forEach(versee, function(verseValue){

                    // var verseKey =
                          // console.log(verseKey)
                          // verseValue.forEach(function(){

                            var newVerse = Verse();
                            // if( verseKey != 'footnotes') {
                                // newVerse.verseNumber = verseKey;
                                newVerse.verse = verseValue;
                                newVerse.bookId = resJson.books[index].name;
                                // newVerse.chapterId = newChapter._id;
                                newVerse.save();
                                newVerseIds.push(newVerse._id);
                            // }

                          // });
                        });

                  var chapterKey = Object.keys(verses[0]);

                    // _.forEach(versee, function(versesChapter, chapterKey) {
                        var newChapter = Chapter();
                        newChapter.chapter = chapterKey;
                        newChapter.bookId = resJson.books[index].name;
                        newChapter.verses= newVerseIds;
                        newChapter.save();
                        newChapIds.push(newChapter._id);
                    // });
                });

                // bookCreate(keys[0].trim());

                var newBook = new Book();
                newBook.bookName = resJson.books[index].toc[1].text;
                newBook.bibleId = req.body.bibleId;
		// tempBookId = keys[0].trim().replace(/\s+/g, '');
                // newBook.bookId = tempBookId.toLowerCase();
                newBook.bookId = resJson.books[index].name;
                //newBook.url = req.body.url;
                newBook.chapters = newChapIds;

                //bookMetadata = bookMetadata.substring(0, bookMetadata.length - 1);

                //console.log(bookMetadata);
                // newBook.metadata = JSON.stringify(bookMetadata);

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
