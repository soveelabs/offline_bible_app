// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');

// Gateway Language Bible Routes

// CREATE Gateway Language Bibles
router.route('/bibles').post(function(req, res){

  Bible.findOne({
    bibleId: {
      $regex: new RegExp(req.body.bibleId, "i")
    }
  }, function(err, bible) { // Using RegEx - search is case insensitive
    if (!err && !bible) {
      var newBible = new Bible();

      newBible.bibleId = req.body.bibleId;
      newBible.version = req.body.version;
      newBible.langCode = req.body.langCode;
      newBible.bibleUrl = req.body.bibleUrl;
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
    res.json(bibles);
  });
});

// UPDATE Gateway Language Bibles

router.route('/bibles/:bible_id').put( function(req, res) {
  var bibleId = req.params.bible_id;
    
  Bible.findOne({'bibleId':bibleId}, function(err, bible) {
    if (!err && bible) {
      bible.bibleId = bibleId;
      bible.version = req.body.version;
      bible.bibleId = req.body.bibleId;
      bible.bibleUrl = req.body.bibleUrl;
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


// Bible Book Routes

// CREATE  Bible Books
router.route('/bibles/:bible_id/books').post(function(req, res){
  var inputBookName = req.body.book.trim();
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

// Return router
module.exports = router;
