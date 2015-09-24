// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');


// Bible Book Routes

// CREATE  Bible Books
router.route('/bibles/:bible_id/books').post(function(req, res){
  
  console.log(req.body); // Check the request body on console
  
  var inputBookName = req.body.bookName.trim();
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
                      newBook.chapters = req.body.chapters;
	                    bible.books.push(newBook._id); //Saving ref of books to Bible model.
	                    newBook.save(function(bookErr) {
		                      bible.save(function(bibleErr) {
		                          if (!bookErr && !bibleErr) {
			                                res.status(201).json({
			                                message: "Book created with bookName: " + inputBookName
			                       });
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
});


// LIST Bible Books
router.route('/bibles/:bible_id/books').get(function(req, res) {
    bibleId = req.params.bible_id;
    Book.find({'bibleId':bibleId}, function(err, books) {
        if (err) {
            return res.send(err);
        }
        res.json(books);
    });
});


// UPDATE Books
router.route('/bibles/:bible_id/books').put( function(req, res) {

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
                         book.chapters = req.body.chapters;

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
