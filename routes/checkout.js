 // Dependencies
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');

// Models
var Bible = require('../models/bible');
var Book =  require('../models/book');
var Chapter =  require('../models/chapter');


// CREATE toggel entry for chapter checkout
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapterId/checkout').put(function(req, res){
	
    var chapterId = req.params.chapterId;
	console.log(chapterId);

	  Chapter.findOne({'_id':chapterId}, function(err, chapter) {
	  	console.log(chapter);
	    if (!err && chapter) {

	    	console.log(req.body.checkout);
	      if(req.body.checkout == true) {
	      	chapter.checkout = req.userId;
	      } else {
	      	chapter.checkout = null;
	      }
	      	
	      
	      chapter.save(function(err) {
	        if (!err) {
	          res.status(200).json({
	            message: "Chapter status updated: " + chapterId
	          });
	        } else {
	          res.status(500).json({
	            message: "Could not update chapter. " + err
	          });
	        }
	      });
	    } else if (!err) {
	      res.status(404).json({
	        message: "Could not find chapter."
	      });
	    } else {
	      res.status(500).json({
	        message: "Could not update chapter." + err
	      });
	    }
	  });



});


// Return router
module.exports = router;