// Dependencies
var mongoose = require('mongoose');

// Schema
var booksSchema = new Schema({
                                        bookName: String,
                                        
                                    });



var bibleSchema = new mongoose.Schema({
    bibleId: String,
    version: String,
    langCode: String,
    bibleUrl: String,
    books: [booksSchema],
});

// Return model
module.exports = mongoose.model('Bible', bibleSchema);
