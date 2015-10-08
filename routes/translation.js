// Dependencies
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var TranslatedBible = require('../models/translated_bible');
var Chapter =  require('../models/chapter');

// Bible Translation Routes

// CREATE Translation
router.route('/bibles/:bible_id/translations').post(function(req, res){
    var bibleId = req.params.bible_id;
    var inputTranslatedBibleId = req.body.translations[0].bibleId;
    var inputTranslatedVersion = req.body.translations[0].version;
    var inputTranslatedLangCode = req.body.translations[0].langCode;
    TranslatedBible.findOne({
	bibleId: {$regex: new RegExp(inputTranslatedBibleId, "i")}
    }, function(err, translation) {
	if(!err && !translation) {
	    Bible.findOne({'bibleId':bibleId}, function(bibleErr, bible) { //Checking for valid bible_id.
		if(!bibleErr && bible) {
		    var newTranslation = new TranslatedBible();
		    newTranslation.bibleId = inputTranslatedBibleId;
		    newTranslation.sourceBibleId = req.params.bible_id;
		    newTranslation.version = inputTranslatedVersion;
		    newTranslation.langCode = inputTranslatedLangCode;
		    newTranslation.save(function(saveErr) {
			if(!saveErr) {
			    res.status(201).json({
				message: "New Translation created."
			    });
			} else {
			    res.status(500).json({
				message: "Could not create new translation. " + saveErr
			    });
			}
		    });
		} else if (!bible) {
		    res.status(404).json({
			message: "Could not find source BibleId."
		    });
		}
	    });
	} else if (!err && translation) {
	    res.status(409).json({
		message: "Cannot create duplicate translation."
	    });
	} else if (err) {
	    res.status(500).json({
		message: "Could not create new translation. " + err
	    });
	}
    });
});



//    Bible.findOne({'bibleId':bibleId}, function(bibleErr, bible) { //Checking for valid bible_id.
//	if (!bible) {
//
//	    source = {"source":{"bibleId":bibleId, "version":"", "langCode":"", "error":"Source Bible not found."}}
//	} else {
//	    	console.log("when the value is" + bibleId)
//	    source = {"source":{"bibleId":bibleId, "version":bible.bibleId, "langCode":bible.langCode}}
//	}
//    });
//    console.log("it is now "+source);
//    req.body.translations.forEach(function(trans) {
//	var inputTranslatedBibleId = trans.bibleId;
//	var inputTranslatedVersion = trans.version;
//	var inputTranslatedLangCode = trans.langCode;
//	console.log(trans.bibleId);
//	console.log(trans.version);
//	console.log(trans.langCode);
//	TranslatedBible.findOne({
//	    bibleId: {$regex: new RegExp(inputTranslatedBibleId, "i")}
//	}, function(err, translation) {
//	    if(!err && !translation) {
//		var newTranslation = new TranslatedBible();
//		newTranslation.bibleId = inputTranslatedBibleId;
//		newTranslation.sourceBibleId = req.params.bible_id;
//		newTranslation.version = inputTranslatedVersion;
//		newTranslation.langCode = inputTranslatedLangCode;
//		newTranslation.save(function(saveErr) {
//		    if(!saveErr) {
//			targets.push({"bibleId":inputTranslatedBibleId, "version":inputTranslatedVersion, "langCode":inputTranslatedLangCode, "status":201, "message":"New Translation created."});
//		    } else {
//			targets.push({"bibleId":inputTranslatedBibleId, "version":inputTranslatedVersion, "langCode":inputTranslatedLangCode, "status":500, "message":"Could not create new translation. " + saveErr});
//			errorFlag = true;
//		    }
//		});
//	    } else if (!err && translation) {
//		targets.push({"bibleId":inputTranslatedBibleId, "version":inputTranslatedVersion, "langCode":inputTranslatedLangCode, "status":409, "message":"Cannot create duplicate translation."});
//		errorFlag = true;
//	    } else if (err) {
//		targets.push({"bibleId":inputTranslatedBibleId, "version":inputTranslatedVersion, "langCode":inputTranslatedLangCode, "status":500, "message":"Could not create new translation." + err});
//		errorFlag = true;
//	    }
//	});
//    });
//    if(errorFlag) {
//	res.status(400).json({"translations":{"source":source,"target":targets}});
//    } else {
//	res.status(201).json({"translations":{"source":source,"target":targets}});
//    }
// });



// LIST translations Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/translations').get(function(req, res) {
    bibleId = req.params.bible_id;
    bookId = req.params.book_id;
    chapterId = req.params.chapter_id;
    var json = {};

    json['bibleId'] = bibleId;
    json['bookId'] = bookId;
    json['chapter'] = chapterId;

    Bible
	.findOne({'bibleId':bibleId})
	.populate('books')
        .exec(function (err, selBible) {
	    if (err) {
		return res.send(err);
	    }
	    json['version'] = selBible.version;
	    json['langCode'] = selBible.langCode;
	    selBible.books.forEach(function (book) {
		if (book.bookName == bookId) {
		    Book.findById(book._id)
		    .populate('chapters')
		    .exec(function (bookErr, bookDoc) {
			bookDoc.chapters.forEach(function (chpts) {
			    if (chpts.chapter == chapterId) {
				var promise = Chapter.populate(chpts, [{path:'translations.bibleId'}]);
				promise.then(function(value){
				    json['translations'] = []
				    var transJson = {}
				    value.translations.forEach(function(transUnit){
					transJson = {}
					transJson['bibleId'] = transUnit.bibleId.bibleId;
					transJson['version'] = transUnit.bibleId.version;
					transJson['langCode'] = transUnit.bibleId.langCode;
					transJson['url'] = transUnit.url;
					json['translations'].push(transJson);
				    });
				    res.status(200).json(json);
				}).end();
			    }
			});
		    });
		}
	    });
	});
});
	    

// UPDATE Translation
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/translations/:translated_bible_id').put(function(req, res){

  Chapter.findById(req.params.chapter_id, function(err, chapter) {
           
    if (!err && chapter) {

     var length = chapter.translations.length;   
     for (var i = 0; i < length; i++) {
         
         console.log(chapter.translations[i]['bibleId']);
         
         if (chapter.translations[i]['bibleId'] == req.params.translated_bible_id) {
              chapter.translations[i]['url'] = req.body.url;
         }
     }
        
      chapter.save(function(err) {         
        
        if (!err) {
          res.status(201).json({
            message: "Translation for chapter Id: " + req.params.chapter_id + " updated."
          });
        } else {
          res.status(500).json({
            message: "Could not create chapter translation. Error: " + err
          });
        }
                          
      });
    } else if (!err) {
      res.status(404).json({
        message: "Could not find chapter with the chapterId."
      });
     }
  });
           
});


// Return router
module.exports = router;
