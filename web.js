var express = require('express');
var logfmt = require('logfmt');
var pmongo = require('promised-mongo');
var swig = require('swig');
var session = require('cookie-session');
var favicon = require('serve-favicon');
var validator = require('express-validator');
var uuid = require('uuid');
var multer = require('multer');

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

app.get('/', function(req, res) {
        console.log(JSON.stringify(req.session));
    res.render('index', {});
});

app.post('/json/newgame', function(req, res) {
    req.checkBody('email').notEmpty().isEmail();
    req.checkBody('title').notEmpty();
    var errors = req.validationErrors(true)

    if (errors) {
        res.json(406, { errors: errors });
    }
    else {
        createGame({
            title: req.body.title,
            description: req.body.body,
            ownerEmail: req.body.email,
            id: uuid.v4(),
        }).
        then(function(game) {
            if (!req.session.owned) {
                req.session.owned = [];
            }
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
            name: req.body.name,
            date: new Date(req.body.date),
            email: req.body.email
        }).
        then(function(guess) {
            console.log('created', guess);
            res.json(201, guess);
        }).
        done()
    }


});

app.get('/guess/:id', function(req, res) {
    getGame(req.params.id).then(function(game) {
        res.render('guess', {
            game: game
        });
    });
});

app.post('/guess/:id', function(req, res) {
    if (req.body.email) {
        req.checkBody('email').isEmail();
    }
    req.checkBody('name').notEmpty();
    req.checkBody('date').isDate().isAfter(new Date());

    getGame(req.params.id).then(function(game) {
        var errors = req.validationErrors(true)
        if (errors) {
            res.render('guess', {
                form: req.body,
                game: game,
                errors: errors
            });
        }
        else {

            console.log("KWKWKWKW", new Date(req.body.date))
        }
    });
});

app.get('/g/:id', function(req, res) {
    getGame(req.params.id).then(function(game) {
        console.log(JSON.stringify(req.session));

        res.render('game', {
            game: game
        });
    });
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log('Listening on ' + port);
});
