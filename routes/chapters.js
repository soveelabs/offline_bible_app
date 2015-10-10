// Dependencies
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var _ = require('lodash');

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
    var bookId = req.params.book_id;
    var tempArr = [];
    var resBuildChapt = {};
	Bible
	    .findOne({'bibleId':bibleId})
	    .populate('books')
            .exec(function (err, selBible) {
		if (err) {
		    return res.send(err);
		}
		selBible.books.forEach(function (book) {
		    if (book.bookName == bookId) {
			Book.findById(book._id)
			    .populate('chapters')
			    .exec(function (bookErr, bookDoc) {
				if(bookErr) {
				    return res.send(bookErr);
				}
				req.body.chapters.forEach(function(inputChapters) {
				    var inputChapterUrl = inputChapters.url;
				    var inputChapter = inputChapters.chapter;
				    if(bookDoc.chapters.length > 0){
					bookDoc.chapters.forEach(function (chpts) {
					    if (chpts.chapter == inputChapter) {
						res.status(409).json({
						    message: "Chapter already exists."
						});
					    }
					});
				    } else {
					request("https://parallel-api.cloud.sovee.com/usx?url=" + inputChapterUrl, function (error, response, body) {
					    if (!error && response.statusCode == 200) {
						var resJson = JSON.parse(body);
					    //		console.log(resJson[0].John.chapters);
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
//								    console.log(verseNum, verse);
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












    
    
//    req.body.chapters.forEach(function(chapts) {
//	console.log(chapts);
//	var inputChapter = chapts.chapter;
//	var inputChapterUrl = chapts.url;
//	console.log('');
//	console.log('hey now ' + inputChapterUrl);
//	request("https://parallel-api.cloud.sovee.com/usx?url=" + inputChapterUrl, function (error, response, body) {
//	    if (!error && response.statusCode == 200) {
//		var resJson = JSON.parse(body);
////		console.log(resJson[0].John.chapters);
//		resJson.forEach(function(books){
////		    book = Object.keys(books)[0];
//		    var chaptVerses = _.pluck(books, 'chapters');
//		    _.forEach(chaptVerses[0], function(chapt, chaptNum) {
//			//Create chapter
//			var newChapter = new Chapter({
//			});
//			_.forEach(chapt, function(verse, verseNum) {
//			    console.log(verseNum, verse);
//			});
//		    });
//		});
//	    }
//	});
//    });
//    });
		
	
//	Chapter.findOne({
//	    bibleId: {
//		$regex: new RegExp(req.params.bible_id, "i")
//	    }
//	}, function(err, chapter) { // Using RegEx - search is case insensitive
//            if (!err) {
//		var bookId = req.params.book_id;
//		console.log(bookId);
//		
//		Book.findById(bookId, function(err, book) {
//              
//                  if (!err && book) {
// 
//                      var chapter = new Chapter();
//                      chapter.chapter = req.body.chapter;
//                      chapter.bookId = bookId;
//                      chapter.url = req.body.url;
//                      chapter.translations = req.body.translations;
//                      console.log(book);
//                      
//                      book.chapters.push(chapter._id);
//        
//                      chapter.save(function(err) {         
//        
//                          book.save(function(bookErr) {
//                              if (!err && !bookErr) {
//                                  res.status(201).json({
//                                      message: "Chapters created for Book Id: " + req.params.book_id
//                                  });
//                              } else {
//                                  res.status(500).json({
//                                      message: "Could not create chapter. Error: " + err
//                                  });
//                              }
//                          });
//                      });
//                    } else if (!err) {
//                          res.status(404).json({
//                              message: "Could not find book with the bookId."
//                          });
//                    }
//              });
//            } else if (!err) {
//                           res.status(403).json({
//                               message: "Cannot create chapter."
//                           });              
//            }  else {
//                 res.status(500).json({
//                     message: err
//                 });
//            }
//  });
//    });
//});

							       
// LIST Bible Book Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters').get(function(req, res) {
    bibleId = req.params.bible_id;
    bookId = req.params.book_id;
    var json = {};

    json['bibleId'] = bibleId;
    json['bookId'] = bookId;

    Bible.findOne({'bibleId':bibleId}, function(err, bibles) {
        if (err) {
            return res.send(err);
        }
        //console.log(bibles);
        //json.bible = bibles;
        
        json['version'] = bibles['version'];
        json['langCode'] = bibles['langCode'];
        
      });

        Chapter.find({'bookId':bookId}, function(err, chapters) {
        if (err) {
            return res.send(err);
        }
        json.chapters= chapters;
        res.json(json);
    });
});

// Update Chapters

router.route('/bibles/:bible_id/books/:book_id').put( function(req, res) {
  var bibleId = req.params.bible_id;
  var bookId = req.params.book_id;
  Chapter.findOne({'bookId':bookId}, function(err, chapter) {
    if (!err && chapter) {
       chapter.bookId = bookId;
       chapter.chapter = req.body.chapter;
       chapter.url = req.body.url;
       chapter.translations = req.body.translations;

      chapter.save(function(err) {
        if (!err) {
          res.status(200).json({
            message: "Chapters updated: " + bookId
          });
        } else {
          res.status(500).json({
            message: "Could not update chapter. " + err
          });
        }
      });
    } else if (!err) {
      res.status(404).json({
        message: "Could not find book."
      });
    } else {
      res.status(500).json({
        message: "Could not update chapters ." + err
      });
    }
  });
});


// Return router
module.exports = router;
