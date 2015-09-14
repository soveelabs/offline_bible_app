// Dependencies
var mongoose = require('mongoose');

// Schema
var chapterSchema = new mongoose.Schema({
    chapter: String    
});

// Return model
module.exports = mongoose.model('Chapter', chapterSchema);;
