// Dependencies
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var async = require('async');

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');


// CREATE toggle entry for chapter checkout
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapterId/checkout').put(function(req, res){
    
    chapterId = req.params.chapterId;
    bibleId = req.params.bible_id
    bookId = req.params.book_id

    var checkoutChapter = function(aChapter, callback) {
	if(aChapter.chapter == chapterId) {
	    Chapter.findById(aChapter._id)
		.exec(function(err, chapter) {
		    if (!err) {
			if(req.body.checkout.toLowerCase() === 'true') {
	      		    chapter.checkout = req.userId;
			} else {
	      		    chapter.checkout = null;
			}

			chapter.save(function(err) {
			    if (!err) {
				callback(null, 'true');
			    } else {
				callback('Unable to save to Database.');
			    }
			});
		    } else {
			callback('Unable to query Database.');
		    }
		});
	} else {
	    callback(null, 'false');
	}
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
	    selBible.books.forEach(function (book) {
		if (book.bookName == bookId) {
		    Book.findById(book._id)
			.populate('chapters')
			.exec(function (bookErr, bookDoc) {
			    if(bookDoc.chapters.length > 0){
				async.map(bookDoc.chapters, checkoutChapter, function(chaptErr, results){
				    if(chaptErr) {
					res.status(500).json({
					    message: "Could not update chapter. " + chaptErr
					});
				    } else if(results.indexOf('true') > -1) {
					res.status(200).json({
					    message: "Chapter status updated."
					});
				    } else {
					res.status(404).json({
					    message: "Chapter not found."
					});
				    }
				});
			    }
			});
		    }
		});
	});
});


// Return router
module.exports = router;
