// Dependencies
var express = require('express');
var router = express.Router();

var request = require('request');
var _ = require('lodash');
var async = require('async');


// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter = require('../models/chapter');
var Verse = require('../models/verse');


// Bible Book Routes

// CREATE  Bible Books
router.route('/bibles/:bible_id/books').post(function(req, res){
  
  var newChapIds = []; var newReqBody = {};

  var firstIndex = 0;
  for (var key in req.body) {
    
    if (req.body.hasOwnProperty(key)) {
        item = req.body[key];
        item.forEach(function(bookReq){
            if (firstIndex == 0) {
                newReqBody.bookId = bookReq['bookId'];
                newReqBody.url = bookReq['url'];
            }firstIndex++;
        });
    }
   
  }
  
  req.body = newReqBody;

//  console.log("Processed request body url" + req.body.url);
//  console.log("Processed request body bookId" + req.body.bookId);

    request({
          url: process.env.PARALLEL_HOST + "/usx?url=" + req.body.url, //URL to hit
          headers: { //We can define headers too
              'Authorization': "Token token=" + process.env.AUTH_TOKEN
          }
    }, function (error, response, body) {
    
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
                    newChapIds.push(newChapter._id);
                    

                    _.forEach(versesChapter, function(verseValue, verseKey){
                        var newVerse = Verse();
                        if( verseKey != 'footnotes') {
                            newVerse.verseNumber = verseKey;
                            newVerse.verse = verseValue;
                            newVerse.bookId = req.body.bookId;
                            newVerse.chapterId = newChapter._id;
                            newVerse.save();

                        }

                    });

                });

            });

            //console.log("bookId: " + keys[0].trim());
            Book.findOne({
                bookName: {
                  $regex: new RegExp(keys[0].trim(), "i")
                }
              }, function(err, book) { // Using RegEx - search is case insensitive
                //console.log(book);
                if (!err && !book) {

                    bookCreate(keys[0].trim());
                } else if (!err) {

                  // User is trying to create a Bible with a BibleId that already exists.
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

    }else if(!error) {
          return res.send(error);
        }
  });


   
function bookCreate(inputBookName) {
  
    bibleId = req.params.bible_id;
    Bible.findOne({'bibleId':bibleId}, function(err, bible) { //Checking for valid bible_id.
	    if (!err && bible) { 
	        var newBook = new Book();
	        newBook.bookName = inputBookName;
            newBook.bibleId = bibleId;
            newBook.bookId = req.body.bookId;
            newBook.url = req.body.url;
            newBook.chapters = newChapIds;
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
          
}
});


// LIST Bible Books
router.route('/bibles/:bible_id/books').get(function(req, res) {

    var bibleId = req.params.bible_id;
    var jsonRes = {};
    jsonRes['bibleId'] = bibleId;
    var finalResults = {};
    

    var iterateChapters = function (num, callback) {
    var chaptJson = {};
    chaptJson['chapters'] = [];
    Chapter.populate(num, [{path:'chapters'}], function(chaptError, value){
        
        chapterJson = {};
        chapterJson['chapter'] = value.chapter;
        chapterJson['url'] = value.url;
        chaptJson['chapters'].push(chapterJson);
        chaptJson['bookId'] = value.bookId;
        
        return callback(null, chaptJson);
    });
    };

    var iterateBooks = function(num, callback) {

        Book.populate(num, [{path:'books'}], function(chaptError, value){
        Book.findById(value._id)
            .populate('chapters')
            .exec(function (bookErr, bookDoc) {
                async.map(bookDoc.chapters, iterateChapters, function (err, results) {

                return callback(null, results);
                });
            });
        
        });

    }


    Bible
    .findOne({'bibleId':bibleId})
    .populate('books')
        .exec(function (err, selBible) {
        if (err) {
        return res.status(500).json({
            message: "Error processing request. " + err
        });
        }
        if (!selBible) {
        return res.status(404).json({
            message: "Could not find Bible with the given name. " + err
        });
        }
        jsonRes['version'] = selBible.version;
        jsonRes['langCode'] = selBible.langCode;
        
        async.map(selBible.books, iterateBooks, function (err, results) {

            jsonRes['books'] = results;
            
            res.status(200).json(jsonRes);
        });

    });
    
});



// UPDATE Books
router.route('/bibles/:bible_id/books/:bookId').put( function(req, res) {
  
//  console.log(req.body); // Check the request body on console
  var newChapIds = [];

    request({
          url: process.env.PARALLEL_HOST + "/usx?url=" + req.body.bibleUrl, //URL to hit
          headers: { //We can define headers too
              'Authorization': "Token token=" + process.env.AUTH_TOKEN
          }
    }, function (error, response, body) {
    
    if (!error && response.statusCode == 200) {
       
        var resJson = JSON.parse(body); // Print the google web page.

        resJson.forEach(function(books){
          

            keys = Object.keys(books);
            var verses = _.pluck(books, 'chapters');
            var i = 0;

            verses.forEach(function(versee) {

                _.forEach(versee, function(versesChapter, chapterKey) {
                    
                    var newChapter = Chapter();             
                    Chapter.findOne(
                        {'chapter':chapterKey}, 
                        {'bookId':req.params.bookId},
                        
                        function(err, chapterExist) {
                        if (err) {
                            return res.send(err);
                        }
                        
                        if (chapterExist == null) {
                            
                            newChapter.chapter = chapterKey;
                            newChapter.bookId = req.params.bookId;
                            newChapter.save();
                            newChapIds.push(newChapter._id);
                        }
                    });

                  

                    _.forEach(versesChapter, function(verseValue, verseKey){
                        var newVerse = Verse();
                        if( verseKey != 'footnotes') {

                            Verse.findOne(
                                {'bookId':req.params.bookId}, 
                                {'verse':verseValue}, 

                            function(err, verseExist) {
                                if (err) {
                                    return res.send(err);
                                }
                                //console.log(verseExist['verse']);
                                if (verseExist == null) {
                                    newVerse.verseNumber = verseKey;
                                    newVerse.verse = verseValue;
                                    newVerse.bookId = req.params.bookId;
                                    newVerse.chapterId = newChapter._id;
                                    newVerse.save();
                                }
                            });

                        }

                    });

                });

            });

            updateBook(keys[0].trim());
        });
        
    }
  });


   
function updateBook(inputBookName) {
  
    bibleId = req.params.bible_id;
    Bible.findOne({'bibleId':bibleId}, function(err, bible) { //Checking for valid bible_id.
        if (!err && bible) { 
                Book.findOne(
                    {'bibleId':bibleId}, 
                    {'bookName':inputBookName}, 
                    function(err, book) {
                        if (err) {
                           return res.send(err);
                        }
          
                         book.url = req.body.url;
                         //book.chapters = req.body.chapters;


                         book.save(function(bookErr) {
                     
                    
                                if (!bookErr ) {

                                    var json = {};

                                    json['bibleId'] = bibleId;
                                    json['bookId']  = req.params.bookId;
                                    json['url'] = req.body.url;
                                    json['version'] = bible['version'];
                                    json['langCode'] = bible['langCode'];

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
          
}
});




// Return router
module.exports = router;
