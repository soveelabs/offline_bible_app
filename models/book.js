// Dependencies
var mongoose = require('mongoose');
var Chapter = require('./chapter.js');

// Schema
var bookSchema = new mongoose.Schema({
    bookName: String,
    bibleId: String,
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }]
    
});

// Return model
module.exports = mongoose.model('Book', bookSchema);
