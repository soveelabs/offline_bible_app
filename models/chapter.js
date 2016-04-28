// Dependencies
var mongoose = require('mongoose');
var TranslatedBible = require('./translated_bible.js');

// Schema
var chapterSchema = new mongoose.Schema({
    bookId: String,
    chapter: String,
    url: String,
    checkout: {type: String, default: ''},
    translations: [{
	//The translated Bible ID
    	bibleId: {type: mongoose.Schema.Types.ObjectId, ref: 'TranslatedBible'}, 

	//The URL of the Excel file.
    	url: String
    }]
});


// Return model
module.exports = mongoose.model('Chapter', chapterSchema);
