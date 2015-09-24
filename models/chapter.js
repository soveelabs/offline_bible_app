// Dependencies
var mongoose = require('mongoose');

// Schema
var chapterSchema = new mongoose.Schema({
	bookId: String,
    chapters: {
    	chapter: String,
    	url: String,
    	translations: {
    		bibleId: String,
    		url: String
    	}
    }
});


// Return model
module.exports = mongoose.model('Chapter', chapterSchema);;
