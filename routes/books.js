// Dependencies
var express = require('express');
var router = express.Router();

var request = require('request');
var _ = require('lodash');


// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter = require('../models/chapter');
var Verse = require('../models/verses');


// Bible Book Routes

// CREATE  Bible Books
router.route('/bibles/:bible_id/books').post(function(req, res){
  
  console.log(req.body); // Check the request body on console
  
  request("https://parallel-api.cloud.sovee.com/usx?url=" + req.body.url, function (error, response, body) {
    
    if (!error && response.statusCode == 200) {
       
        var resJson = JSON.parse(body); // Print the google web page.

        resJson.forEach(function(books){
          

            keys = Object.keys(books);
            var verses = _.pluck(books, 'chapters');
            var i = 0;

            verses.forEach(function(versee) {

                _.forEach(versee, function(versesChapter, chapterKey) {
                    
                    var newChapter = Chapter();
                    newChapter.chapter = chapterKey;
                    newChapter.bookId = req.body.bookId;
                    newChapter.save();

                    _.forEach(versesChapter, function(verseValue, verseKey){
                        var newVerse = Verse();
                        if( verseKey != 'footnotes') {
                            newVerse.verse = verseValue;
                            newVerse.bookId = req.body.bookId;
                            newVerse.chapterId = newChapter._id;
                            newVerse.save();
                        }

                    });

                });

            });

            bookCreate(keys[0].trim());
        });
        
    }
  });

   
  function bookCreate(inputBookName) {
  
  Book.findOne({
    bookName: {
      $regex: new RegExp(inputBookName, "i")
    }
  }, function(err, book) { // Using RegEx - search is case insensitive
         if (!err && !book) {
	           bibleId = req.params.bible_id;
             Bible.findOne({'bibleId':bibleId}, function(err, bible) { //Checking for valid bible_id.
	                if (!err && bible) { 
	                    var newBook = new Book();
	                    newBook.bookName = inputBookName;
                        newBook.bibleId = bibleId;
                        newBook.bookId = req.body.bookId;
                        newBook.url = req.body.url;
                        //newBook.chapters = req.body.chapters;
	                    bible.books.push(newBook._id); //Saving ref of books to Bible model.
	                    newBook.save(function(bookErr) {
		                      bible.save(function(bibleErr) {
		                          if (!bookErr && !bibleErr) {

                                    var json = {};

                                    json['bibleId'] = bibleId;
                                    json['bookId']  = req.body.bookId;
                                    json['url'] = req.body.url;

                                    Bible.findOne({'bibleId':bibleId}, function(err, bibles) {
                                        if (err) {
                                            return res.send(err);
                                        }
                                        console.log(bibles);
                                        //json.bible = bibles;
                                        
                                        json['version'] = bibles['version'];
                                        json['langCode'] = bibles['langCode'];
                                        
                                      });
			                         res.status(201).json(json);
		                        } else {
			                                res.status(500).json({
			                                    message: "Could not create Book."
			                                });
		                        }
		                      });
	                  });
	                  } else if (!err) {
	                        res.status(404).json({
		                          message: "Could not find bible with the bibleId."
	                        });
	                  }
                });
          } else if (!err) {
           // User is trying to create a Book with a name that already exists.
	              res.status(403).json({
                    message: "Cannot create Book with the same Book Name."
	              });
            } else {
	              res.status(500).json({
                    message: err
	              });
            }
      });
}
});


// LIST Bible Books
router.route('/bibles/:bible_id/books').get(function(req, res) {
    bibleId = req.params.bible_id;
    var jsonRes = {};
    jsonRes['bibleId'] = bibleId;
    
    Bible.findOne({'bibleId':bibleId}, function(err, bibles) {
        if (err) {
            return res.send(err);
        }
        jsonRes['version'] = bibles['version'];
        jsonRes['langCode'] = bibles['langCode'];
                                        
    });
    
    Book.find({'bibleId':bibleId}, function(err, books) {
        if (err) {
            return res.send(err);
        }
        var i =0;
        //console.log(books);
        var bookJsn = []; 
        var chaJson = [];
        books.forEach(function(oneBook) {
            //console.log(jsonRes);
            var obj = {};
            obj['bookId'] = oneBook['bookId'];
            bookJsn.push(obj);
            console.log(oneBook['chapters'].length);
           
           for (var chapLen =0 ; chapLen < oneBook['chapters'].length; chapLen++) {
            
                var objChap = {};
                
                console.log("print id: " + oneBook['chapters'][chapLen]);
                Chapter.findById(oneBook['chapters'][chapLen], function(err, chap) {
                    if (err) {
                        return res.send(err);
                    }
                    
                    objChap['chapter'] = chap['chapter'];
                    objChap['url'] = chap['url'];
                    //console.log(objChap);
                    chaJson.push(objChap);
                    
                });
            };
        });
            bookJsn['Chapters'] = chaJson;
            jsonRes['Books'] = bookJsn;
               
            res.json(jsonRes);
    
    });
    
});


// UPDATE Books
router.route('/bibles/:bible_id/books/:bookId').put( function(req, res) {

    console.log(req.body); // Check the request body on console

    Book.findOne({
        bookName: {
            $regex: new RegExp(req.body.bookName, "i")
        }
    }, function(err, book) { 
            if (!err && !book) {
                var bibleId = req.params.bible_id;
                Book.findOne({'bibleId':bibleId}, function(err, book) {
             
                     if (!err && book) {
          
                         book.bookName = req.body.bookName;
                         //book.chapters = req.body.chapters;

                         book.save(function(err) {
                         if (!err) {
                             res.status(200).json({
                             message: "Book updated: " + bibleId
                         });
                    } else {
                        res.status(500).json({
                            message: "Could not update book. " + err
                        });
                    }
                });
            } else if (!err) {
                 res.status(404).json({
                     message: "Could not find book."
                 });
                 } else {
                    res.status(500).json({
                        message: "Could not update book." + err
                    });
                 }
            });
            } else if (!err) {
                //User is trying to create a Book with a name that already exists.
                res.status(403).json({
                    message: "Cannot create Book with the same Book Name."
                });
            } else {
                res.status(500).json({
                    message: err
                });
            }
      });

});

// Return router
module.exports = router;
