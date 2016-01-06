 // Dependencies
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var _ = require('lodash');
var async = require('async');

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');
var Verse = require('../models/verse');

// Bible Chapter Routes

// CREATE Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters').post(function(req, res){
    var json = {};
    var bibleId = req.params.bible_id;
    var bookId = req.params.book_id.toLowerCase();
    var tempArr = [];
    var resBuildChapt = {};
    var existsFlag = false;
    var bookFlag = false;
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
		if (book.bookId == bookId) {
		    Book.findById(book._id)
			.populate('chapters')
			.exec(function (bookErr, bookDoc) {
			    if(bookErr) {
				bookFlag = true;
				return res.send(bookErr);
			    }
			    if (bookFlag) {
				return;
			    }
			    req.body.chapters.forEach(function(inputChapters) {
				var inputChapterUrl = inputChapters.url;
				var inputChapter = inputChapters.chapter;
				if(bookDoc.chapters.length > 0){
				    existsFlag = bookDoc.chapters.some(function (chpts) {
					return chpts.chapter == inputChapter;
				    });
				}
				if(existsFlag){
				    return res.status(409).json({
					message: "Chapter already exists."
				    });
				} else if(!existsFlag){
				    json['bibleId'] = bibleId;
				    json['version'] = selBible.version;
				    json['langCode'] = selBible.langCode;
				    json['bookId'] = bookId;
				    request({
          				url: process.env.PARALLEL_HOST + "/usx?url=" + inputChapterUrl,
          				headers: {
              				'Authorization': "Token token=" + process.env.AUTH_TOKEN
          				}
      				}, function (error, response, body) {
				        if (error) {
					    return res.status(500).json({
						message: "Could not parse data." + error
					    });
					} else if (!error && response.statusCode == 200) {
					    var resJson = JSON.parse(body);
					    resJson.forEach(function(books){
						//		    book = Object.keys(books)[0];
						var chaptVerses = _.pluck(books, 'chapters');
						_.forEach(chaptVerses[0], function(chapt, chaptNum) {
						    //Create chapter
						    var newChapter = new Chapter({
							bookId: bookId,
							chapter: chaptNum,
							url: inputChapterUrl
						    });
						    newChapter.save(function(saveChaptError) {
							if(saveChaptError){
							    res.status(500).json({
								message: "Could not create new chapter." + saveChaptError
							    });
							} else {
							    bookDoc.chapters.push(newChapter._id);
							    bookDoc.save();
							    _.forEach(chapt, function(verse, verseNum) {
								//Create verses
								if( Number(verseNum) ) {
								    var newVerse = Verse({
									verse: verse,
									verseNumber: verseNum,
									bookId: bookId,
									chapterId: newChapter._id,
								    });
								    newVerse.save();
								}
							    });
							    resBuildChapt['chapter'] = newChapter.chapter;
							    resBuildChapt['url'] = 'www.sovee.com/bibles/'+bibleId+'/books/'+bookId+'/chapters/'+newChapter.chapter;
							    tempArr.push(resBuildChapt);
							    json['chapters'] = tempArr;
							    res.status(201).json(json);
							}
						    });
						});
					    });
					}
				    });
				}
			    });
			});
		}
	    });
	});
});

// LIST Bible Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters').get(function(req, res) {
    var bibleId = req.params.bible_id;
    var bookId = req.params.book_id.toLowerCase();
    var json = {};
    json['bibleId'] = bibleId;
    json['bookId'] = bookId;
    var chaptJsonArr = [];
    //var chaptJson = {};
    //var transJson = {};

    var iterateChapters = function (num, callback) {
    	var chaptJson = {};
    	var transJson = {};
    	chaptJson['translations'] = [];
	Chapter.populate(num, [{path:'translations.bibleId'}], function(chaptError, value){
	    chaptJson['chapter'] = value.chapter;
	    //chaptJson['translations'] = [];
	    value.translations.forEach(function(transUnit){
		transJson = {};
		transJson['bibleId'] = transUnit.bibleId.bibleId;
		transJson['version'] = transUnit.bibleId.version;
		transJson['langCode'] = transUnit.bibleId.langCode;
		transJson['url'] = transUnit.url;
		chaptJson['translations'].push(transJson);
	    });
	    return callback(null, chaptJson);
	});
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
	    json['version'] = selBible.version;
	    json['langCode'] = selBible.langCode;
	    selBible.books.forEach(function (book) {
		if (book.bookId == bookId) {
		    Book.findById(book._id)
			.populate('chapters')
			.exec(function (bookErr, bookDoc) {
			    async.map(bookDoc.chapters, iterateChapters, function (err, results) {
				json['chapters'] = results;
				res.status(200).json(json);
			    });
			});
		}
	    });
	});
});


// Update Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id').put( function(req, res) {
    var json = {};
    var bibleId = req.params.bible_id;
    var bookId = req.params.book_id.toLowerCase();
    var chapterId = req.params.chapter_id;
    var inputUrl = req.body.url;
    var tempArr = [];
    var resBuildChapt = {};

    var iterateChapters = function(inputChapter, callback) {
	var inputChapterNum = inputChapter.chapter;
	if (chapterId == inputChapterNum) {
		request({
          url: process.env.PARALLEL_HOST + "/usx?url=" + inputUrl,
          headers: {
              'Authorization': "Token token=" + process.env.AUTH_TOKEN
          }
      	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
		    var resJson = JSON.parse(body);
		    resJson.forEach(function(books){
			var chaptVerses = _.pluck(books, 'chapters');
			_.forEach(chaptVerses[0], function(chapt, chaptNum) {
			    //Edit chapter
			    Chapter.findOneAndUpdate({"_id":inputChapter._id},{url:inputUrl}, function(chaptError, chapter){
				if(chaptError){
				    callback("Chapter updation error.");
				} else {
				    Verse.find({chapterId:inputChapter._id}).remove(function(errs, ch){
					if(errs) {
					    callback("Verse updation error.");
					}
				    });
				    _.forEach(chapt, function(verse, verseNum) {
					//Create verses
					if( Number(verseNum) ) {
					    var newVerse = Verse({
						verse: verse,
						verseNumber: verseNum,
						bookId: bookId,
						chapterId: inputChapter._id,
					    });
					    newVerse.save();
					}
				    });
				    callback();
				}
			    });
			});
		    });
		} else if(error){ callback('Network error.'); }
	    })
	} else { callback();  }
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
		if (book.bookId == bookId) {
		    Book.findById(book._id)
			.populate('chapters')
			.exec(function (bookErr, bookDoc) {
			    if(bookErr) {
				return res.send(bookErr);
			    }
			    if(bookDoc.chapters.length > 0){
				//write here
				async.each(bookDoc.chapters, iterateChapters, function(chaptErr){
				    if(chaptErr) {
					res.status(500).json({
					message: "Could not update chapter." + chaptErr
					});
				    } else {
					json['bibleId'] = bibleId;
					json['version'] = selBible.version;
					json['langCode'] = selBible.langCode;
					json['bookId'] = bookId;
					json['chapter'] = chapterId;
					res.status(200).json(json);
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
