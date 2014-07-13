var express = require('express');
var logfmt = require('logfmt');
var pmongo = require('promised-mongo');
var swig = require('swig');
var session = require('cookie-session');
var favicon = require('serve-favicon');
var validator = require('express-validator');
var uuid = require('uuid');
var bodyParser = require('body-parser')
var bluebird = require('bluebird');
var moment = require('moment');

var conf = require('./config.js');

var app = express();

app.locals.devmode = conf.get('env') == 'development';

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
swig.setDefaults({ cache: false });

app.use(bodyParser.urlencoded({extended:false}));
app.use(validator());

app.use(session({
    name: 'reorgno',
    secret: conf.get('secret'),
}));

app.use(logfmt.requestLogger());

var connectionString = process.env.MONGOSOUP_URL || 'mongodev';

var db = pmongo(connectionString, ['games', 'guesses']);

swig.setFilter('fromNow', function(then) {
    return moment(then).fromNow();
});

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
    return db.collection('guesses').find({game: gameId}).sort({date: -1}).toArray();
}

app.use(function(req, res, next) {
    if (!req.session.owned) { req.session.owned = []; }
    if (!req.session.guessed) { req.session.guessed = []; }
    next();
});

app.get('/', function(req, res) {
    res.render('index', {});
});

app.post('/', function(req, res) {
    req.checkBody('email').notEmpty().isEmail();
    req.checkBody('company').notEmpty();
    var errors = req.validationErrors(true)

    if (errors) {
        res.render('index', {
            editing: true,
            errors: errors,
            form: req.body
        });
    }
    else {
        createGame({
            company: req.body.company,
            description: req.body.description,
            ownerEmail: req.body.email,
            id: uuid.v4()
        }).
        then(function(game) {
            req.session.owned.push(game.id);
            var path = '/g/' + game.id;
            res.redirect(path)
        }).
        done();
    }
});

app.get('/g/:id', function(req, res) {
    getGuessViewData(req.params.id, req).then(function(props) {
        res.render('game', props);
    });
});

app.post('/g/:id', function(req, res) {
    if (req.body.email) {
        req.checkBody('email').isEmail();
    }
    req.checkBody('name').notEmpty();
    req.checkBody('date').isDate().isAfter(new Date());
    var errors = req.validationErrors(true)

    if (errors) {
        getGuessViewData(req.params.id, req).
        then(function(props) {
            props.errors = errors;
            props.form = req.body;
            props.editing = true;
            res.render('game', props);
        }).
        done();
    }
    else {
        createGuess({
            game: req.params.id,
            name: req.body.name,
            date: new Date(req.body.date),
            email: req.body.email
        }).
        then(function() {
            req.session.guessed.push(req.params.id);
        }).
        then(getGuessViewData.bind(null, req.params.id, req)).
        then(res.render.bind(res, 'game')).
        done();
    }
});

function getGuessViewData(gid, req) {
    return bluebird.props({
        game: getGame(gid),
        guesses: getGuesses(gid)
    }).tap(function(props) {
        props.guesses.forEach(addComputedTimes);
        props.hasGuessed = req.session.guessed.indexOf(props.game.id) != -1;
    });
}

function addComputedTimes(guess) {
    var now = new Date();
    var then = guess.date;

    guess.dayDelta = Math.ceil((then - now) / 86400000);
    guess.absDelta = Math.abs(guess.dayDelta);
    guess.inFuture = guess.dayDelta > 0;
    guess.today = guess.dayDelta == 0;
}

app.listen(conf.get('port'), function() {
    console.log('Listening on ' + conf.get('port'));
});
