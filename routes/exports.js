var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var _ = require('lodash');
var xlsx = require('xlsx-writestream');
var fs = require ('fs');

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
    resJson = {};

    var iterateChapters = function (chapt, callback) {
    
    var verseStr = []; var tmpRes = {};
	if (chapterId == chapt.chapter) {
	    //console.log('chapt is ' + chapt);
	    Verse.find({chapterId:chapt._id}).exec(function (verseErr, verseDocs) {
		//console.log('verse is ' + verseDocs);
		
		verses = _.pluck(verseDocs, 'verse');
		//console.log('the verses are ' + verses);

			verses.forEach(function(oneVerse){
				verseStr.push(oneVerse);
			});
			generateSuggestions(verseStr, req.body.srcLang, req.body.trgLang, function(suggestionErr, suggestionRes) {
          		if (suggestionErr) { return callback(suggestionErr); }

          		generateXls(suggestionRes, function(xlsxErr, xlsxRes) {
          			if (xlsxErr) { return callback(xlsxErr); }
          			return callback(null, xlsxRes);
			    });
          	});
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
			    //console.log('first it is' + bookDoc);
			    async.map(bookDoc.chapters, iterateChapters, function (err, results) {
					resJson = results;
					console.log(results);
			    });
			});
		}
	    });
	});
    
     res.status(200).json("Excel created in your current directory!");
});


generateSuggestions = function(sourceData, sourceLang, targetLang, callback) {
  var options = {
    url: process.env.ALCHEMY_HOST + '/text-batch',
    qs: { texts: JSON.stringify(sourceData), from: sourceLang, to: targetLang, customer: 'Sovee', token: process.env.ALCHEMY_AUTH_TOKEN, project: process.env.SE_PROJECT, asset: process.env.SE_ASSET }
  };
console.log(options);
  request.get(options, function(alchemyErr, alchemyRes, alchemyBody) {
    if (alchemyErr) { return callback(alchemyErr); }

    var suggestions = []

    for (var i = 0; i < sourceData.length; i++) {
      suggestions.push({ source: sourceData[i], suggestion: JSON.parse(alchemyBody)[i] });
    }

    return callback(null, suggestions);
  });
}

generateXls = function(sourceData, callback) {

	console.log("xls function called");

	xlsx.write('translations.xlsx', sourceData, function (err) {
	    // Error handling here
	});
	return callback(null, "translations.xlsx");
}

// Return router
module.exports = router;
