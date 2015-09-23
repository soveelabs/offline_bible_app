// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');


// Bible Chapter Routes


// LIST Bible Book Chapters
router.route('/bibles/:bible_id/books/:book_id/chapters').get(function(req, res) {
    bibleId = req.params.bible_id;
    bookId = req.params.book_id;
    Chapter.find({'bookId':bookId}, function(err, chapters) {
        if (err) {
            return res.send(err);
        }
        res.json(chapters);
    });
});



// Return router
module.exports = router;
