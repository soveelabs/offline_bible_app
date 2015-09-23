// Dependencies
var mongoose = require('mongoose');
var Book = require('./book.js');

// Schema
var bibleSchema = new mongoose.Schema({
    bibleId: String,
    version: String,
    langCode: String,
    bibleUrl: String,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

// Return model
module.exports = mongoose.model('Bible', bibleSchema);
