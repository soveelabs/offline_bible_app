// Dependencies
var mongoose = require('mongoose');

// Schema
var chapterSchema = new mongoose.Schema({
	bookId: String,
    chapter: String,
    url: String,
    translations: [{
    	bibleId: String,
    	url: String,
    	langCode: String,
    	version: String
    }]
    
});


// Return model
module.exports = mongoose.model('Chapter', chapterSchema);;
