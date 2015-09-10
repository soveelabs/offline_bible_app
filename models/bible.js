// Dependencies
var mongoose = require('mongoose');

// Schema
var bibleSchema = new mongoose.Schema({
    bibleId: String,
    version: String,
    langCode: String,
    bibleUrl: String
});

// Return model
module.exports = mongoose.model('Bibles', bibleSchema);
