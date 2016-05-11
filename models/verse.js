// Dependencies
var mongoose = require('mongoose');

// Schema
var verseSchema = new mongoose.Schema({
    verseNumber: String,
    verse: String,
    chapterId: String,
    bookId: String,
    bibleId: String
});

// Return model
module.exports = mongoose.model('Verse', verseSchema);
