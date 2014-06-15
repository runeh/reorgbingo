var express = require('express');
var logfmt = require('logfmt');
var pmongo = require('promised-mongo');
var swig = require('swig');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var validator = require('express-validator');
var uuid = require('uuid');

var app = express();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
swig.setDefaults({ cache: false });

app.use(bodyParser());
app.use(validator());

app.use(session({
    name: 'reorgbingo',
    secret: 'opirf3fporf-3f-kfmcm43f-k[o2pmqcqpof-3o4fqpmrwbwnibnbwp34043pogrgpoe04',
}));

var connectionString = 'morradi'

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
    req.checkBody('email').notEmpty().isEmail();
    req.checkBody('title').notEmpty();

    var errors = req.validationErrors(true)

    if (errors) {
        res.render('new', {
            form: req.body,
            errors: req.validationErrors(true)
        });        
    }
    else {
        games.insert({
            title: req.body.title,
            description: req.body.body,
            ownerEmail: req.body.email,
            id: uuid.v4(),
            publicId: uuid.v4(),
            ownerId: uuid.v4()
        }).then(console.log).done();
    }    
});

app.get('/g/:id', function(req, res) {
    games.findOne({id: req.params.id}).then(function(game) {
        console.log(game);
        res.render('game', {
            game: game
        });
    });
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log('Listening on ' + port);
});
