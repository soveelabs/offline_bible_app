// Dependencies
var mongoose = require('mongoose');
var chapter = require('./chapter.js');

// Schema
var bookSchema = new mongoose.Schema({
    bookName: String,
    bibleId: String,
    bookId: String,
    url: String,
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chapter' }]
    
});

// Return model
module.exports = mongoose.model('Book', bookSchema);
