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
        createGame({
            title: req.body.title,
            description: req.body.body,
            ownerEmail: req.body.email,
            id: uuid.v4(),
            publicId: uuid.v4(),
            ownerId: uuid.v4()
        }).
        then(function(game) {
            // fixme: set user ownership session
            res.redirect("/g/" + game.id);            
        }).done();
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
        res.render('game', {
            game: game
        });
    });
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log('Listening on ' + port);
});
