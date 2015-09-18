var app = require('./server-config.js');

var port = process.env.PORT || 4568;
var env = process.env;

app.listen(port);

console.log('Server now listening on port ' + port);
