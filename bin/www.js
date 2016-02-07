var app = require('../server');
 
var server = app.listen(process.env.PORT || '3000');
console.log('Offline Bible API is running');
