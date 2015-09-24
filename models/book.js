// Dependencies
var mongoose = require('mongoose');
var chapter = require('./chapter.js');

// Schema
var bookSchema = new mongoose.Schema({
    bookName: String,
    bibleId: String,
    chapters: {
    	chapter: String,
    	url: String
    }
    
});

// Return model
module.exports = mongoose.model('Book', bookSchema);
