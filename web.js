var express = require("express");
var logfmt = require("logfmt");
var pmongo = require('promised-mongo');
var swig = require('swig');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');


var app = express();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
swig.setDefaults({ cache: false });

app.use(session({
    name: 'reorgbingo',
    secret: "opirf3fporf-3f-kfmcm43f-k[o2pmqcqpof-3o4fqpmrwbwnibnbwp34043pogrgpoe04",
}));


var connectionString = "morradi"

var db = pmongo(connectionString, ['games', 'guesses']);

var games = db.collection('games');
var guesses = db.collection('guesses');

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
    res.render('index', {});
});

app.get('/new', function(req, res) {
    res.render('new', {});
});

app.post('/new', function(req, res) {
    res.send('Hello World!, new games');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});
