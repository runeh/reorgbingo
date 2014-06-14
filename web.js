var express = require("express");
var logfmt = require("logfmt");
var mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('yay')
});

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	res.send('Hello World!');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});