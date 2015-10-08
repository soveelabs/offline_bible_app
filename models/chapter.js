// Dependencies
var mongoose = require('mongoose');
var bible = require('./bible.js')

// Schema
var chapterSchema = new mongoose.Schema({
    bookId: String,
    chapter: String,
    url: String,
    translations: [{
	//The translated Bible ID
    	bibleId: {type: mongoose.Schema.Types.ObjectId, ref: 'bible'}, 

	//The URL of the Excel file.
    	url: String
    }]
});


// Return model
module.exports = mongoose.model('Chapter', chapterSchema);
