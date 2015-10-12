// Dependencies
var mongoose = require('mongoose');

// Schema
var translatedBibleSchema = new mongoose.Schema({
    bibleId: String,
    version: String,
    langCode: String,
    sourceBibleId: String, //Foreign Key from Bible
    status: String
});

// Return model
module.exports = mongoose.model('TranslatedBible', translatedBibleSchema);
