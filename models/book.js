// Dependencies
var mongoose = require('mongoose');
var chapter = require('./chapter.js');

// Schema
var bookSchema = new mongoose.Schema({
    bookName: String,
    chapters: [chapter]
});

// Return model
module.exports = mongoose.model('Book', bookSchema);
