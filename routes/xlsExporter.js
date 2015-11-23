var express = require('express');
var router = express.Router();

var request = require('request');

// Models
models = require('../models/exporter');

// Export xls
router.route('/bibles/:bible_id/books/:book_id/chapters/:chapter_id/xlsx').post(function(req, res){
console.log("inside routr");
      models.Exporter.execute(req.body, function(executeErr, exportData) {
        if (executeErr && executeErr.name == 'ValidationError') { return res.status(400).json(executeErr); }
        else if (executeErr) { return res.status(500).json(executeErr); }
        return res.status(200).json({ url: exportData.url });
      });


});

// Return router
module.exports = router;
