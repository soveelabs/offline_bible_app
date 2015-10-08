// Dependencies
var mongoose = require('mongoose');

// Schema
var versesSchema = new mongoose.Schema({
    verse: String,
    chapterId: String,
    bookId: String
});

// Return model
module.exports = mongoose.model('Verses', versesSchema);
