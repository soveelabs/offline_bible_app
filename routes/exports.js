var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var _ = require('lodash');

//Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');
var Verse = require('../models/verse');

// Export xls
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/xlsx').post(function(req, res){
    console.log("inside router");
    bibleId = req.params.bible_id;
    chapterId = req.params.chapter_id;
    bookId = req.params.book_id;

    var iterateChapters = function (chapt, callback) {
	if (chapterId == chapt.chapter) {
	    console.log('chapt is ' + chapt);
	    Verse.find({chapterId:chapt._id}).exec(function (verseErr, verseDocs) {
		console.log('verse is ' + verseDocs);
		verses = _.pluck(verseDocs, 'verse');
		console.log('the verses are ' + verses);
	    });
	}
    };
    
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
			    console.log('first it is' + bookDoc);
			    async.map(bookDoc.chapters, iterateChapters, function (err, results) {
				return res.status(200).json(json);
			    });
			});
		}
	    });
	});
    
//    generateSuggestions(
    
/*      models.Exporter.execute(req.body, function(executeErr, exportData) {
        if (executeErr && executeErr.name == 'ValidationError') { return res.status(400).json(executeErr); }
        else if (executeErr) { return res.status(500).json(executeErr); }
        return res.status(200).json({ url: exportData.url });
      });
*/
    
    res.sendStatus(200);
});


generateSuggestions = function(sourceData, sourceLang, targetLang, callback) {
  var options = {
    url: process.env.ALCHEMY_HOST + '/text-batch',
    qs: { texts: JSON.stringify(sourceData), from: sourceLang, to: targetLang, customer: process.env.ALCHEMY_CUSTOMER, token: process.env.AUTH_TOKEN, project: process.env.SE_PROJECT, asset: process.env.SE_ASSET }
  };

  request.get(options, function(alchemyErr, alchemyRes, alchemyBody) {
    if (alchemyErr) { return callback(alchemyErr); }

    var suggestions = []

    for (var i = 0; i < sourceData.length; i++) {
      suggestions.push({ source: sourceData[i], suggestion: JSON.parse(alchemyBody)[i] });
    }

    return callback(null, suggestions);
  });
}



// Return router
module.exports = router;
