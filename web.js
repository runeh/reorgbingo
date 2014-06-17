var express = require('express');
var logfmt = require('logfmt');
var pmongo = require('promised-mongo');
var swig = require('swig');
var session = require('cookie-session');
var favicon = require('serve-favicon');
var validator = require('express-validator');
var uuid = require('uuid');
var multer = require('multer');
var bluebird = require('bluebird');


var app = express();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
swig.setDefaults({ cache: false });

app.use(multer());
app.use(validator());

app.use(session({
    name: 'reorgbingo',
    secret: 'opirf3fporf-3f-kfmcm43f-k[o2pmqcqpof-3o4fqpmrwbwnibnbwp34043pogrgpoe04',
}));

app.use(logfmt.requestLogger());

var connectionString = process.env.MONGOSOUP_URL || 'mongodev';

var db = pmongo(connectionString, ['games', 'guesses']);

function getGame(id) {
    return db.collection('games').findOne({id: id});
}

function createGame(game) {
    return db.collection('games').insert(game);
}

function createGuess(guess) {
    return db.collection('guesses').insert(guess);
}

function getGuesses(gameId) {
    return db.collection('guesses').find({game: gameId});
}

function touchSession(req) {
    console.log("watwat", req.session)
    if (!req.session.owned) { req.session.owned = []; }
    if (!req.session.guessed) { req.session.guessed = []; }
}

app.get('/', function(req, res) {
    res.render('index', {});
});

app.post('/json/newgame', function(req, res) {
    req.checkBody('email').notEmpty().isEmail();
    req.checkBody('company').notEmpty();
    var errors = req.validationErrors(true)

    if (errors) {
        res.json(406, { errors: errors });
    }
    else {
        createGame({
            company: req.body.company,
            description: req.body.description,
            ownerEmail: req.body.email,
            id: uuid.v4(),
        }).
        then(function(game) {
            touchSession(req);
            req.session.owned.push(game.id);
            var path = '/g/' + game.id;
            res.header('Location', path);
            res.send(201);
        }).
        done();
    }
});

app.post('/json/newguess', function(req, res) {
    if (req.body.email) {
        req.checkBody('email').isEmail();
    }
    req.checkBody('name').notEmpty();
    req.checkBody('date').isDate().isAfter(new Date());

    var errors = req.validationErrors(true)
    if (errors) {
        res.send(406);
    }
    else {
        createGuess({
            game: req.body.game,
            name: req.body.name,
            date: new Date(req.body.date),
            email: req.body.email
        }).
        then(function(guess) {
            touchSession(req);
            req.session.guessed.push(guess.game);
            res.json(201, guess);
        }).
        done();
    }
});

app.get('/g/:id', function(req, res) {
    var gid = req.params.id;
    bluebird.join(getGame(gid), getGuesses(gid).toArray()).spread(function(game, guesses) {
        touchSession(req);
        res.render('game', {
            game: game,
            guesses: guesses,
            hasGuessed: req.session.guessed.indexOf(game.id) != -1
        });
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log('Listening on ' + port);
});
