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
  var newChapIds = [];

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
                    newChapIds.push(newChapter._id);
                    

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
  
    bibleId = req.params.bible_id;
    Bible.findOne({'bibleId':bibleId}, function(err, bible) { //Checking for valid bible_id.
	    if (!err && bible) { 
	        var newBook = new Book();
	        newBook.bookName = inputBookName;
            newBook.bibleId = bibleId;
            newBook.bookId = req.body.bookId;
            newBook.url = req.body.url;
            newBook.chapters.push(newChapIds);
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
        
        books.forEach(function(oneBook) {
            //console.log(jsonRes);
            var obj = {};
            obj['bookId'] = oneBook['bookId'];
            //bookJsn.push(obj);
            //console.log(oneBook['chapters'].length);
            var chaJson = [];
           for (var chapLen =0 ; chapLen < oneBook['chapters'].length; chapLen++) {
            
                var objChap = {};
                
                //console.log("print id: " + oneBook['chapters'][chapLen] + "bookId" + oneBook['bookId']);
                Chapter.findById(oneBook['chapters'][chapLen], function(err, chap) {
                    if (err) {
                        return res.send(err);
                    }
                    //console.log(chap);
                    objChap['chapter'] = chap['chapter'];
                    objChap['url'] = chap['url'];
                    chaJson.push(objChap);
                    console.log(chaJson);
                                       
                });
            };
            obj['chapters'] = chaJson;
            bookJsn.push(obj);
            //console.log(bookJsn);

        });
            
            jsonRes['Books'] = bookJsn;
               
            res.json(jsonRes);
    
    });
    
});



// UPDATE Books
router.route('/bibles/:bible_id/books/:bookId').put( function(req, res) {
  
  console.log(req.body); // Check the request body on console
  var newChapIds = [];

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
