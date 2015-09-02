
// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var bibleSchema = new mongoose.Schema({
    bibleId: String,
    version: String,
    langCode: String,
    bibleUrl: String
});

// Return model
module.exports = restful.model('Bibles', bibleSchema);