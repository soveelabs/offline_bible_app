// Dependencies
var mongoose = require('mongoose');
var TranslatedBible = require('./translated_bible.js');
var Verse = require('./verse.js');

// Schema
var chapterSchema = new mongoose.Schema({
    bookId: String,
    chapter: String,
    bibleId: String,
    url: String,
    checkout: String,
    translations: [{
	//The translated Bible ID
    	bibleId: {type: mongoose.Schema.Types.ObjectId, ref: 'TranslatedBible'},

	//The URL of the Excel file.
    	url: String
    }],
    verses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Verse' }]
});


// Return model
module.exports = mongoose.model('Chapter', chapterSchema);
