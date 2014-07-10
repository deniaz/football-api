var express = require('express'),
    fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio'),
    mongojs = require('mongojs'),
    cfg = require('./config.js').get(),
    hbs = require('hbs'),
    app = express();

app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/teams', function(req, res) {
    var db = mongojs.connect(cfg.db.getUri(), ['teams']);

    db.teams.find({}).toArray(function(err, teams) {
        if (err) {
            res.send(500);
        }

        res.json(200, teams);
    });
});

app.get('/teams/:team', function(req, res) {
    var db = mongojs.connect(cfg.db.getUri(), ['teams']);

    db.teams.findOne({ slug: req.params.team }, function(err, team) {
        if (err) {
            res.send(500);
        }

        res.json(200, team);
    });
});

app.get('/teams/:team/players', function(req, res) {
    var db = mongojs.connect(cfg.db.getUri(), ['teams', 'players']);

    db.teams.findOne({ slug: req.params.team }, function(err, team) {
        if (err) {
            res.send(500);
        }

        db.players.find({ team: team.name }).toArray(function(err, players) {
            if (err) {
                res.send(500);
            }

            res.json(200, players);
        });
    });
});

app.get('/teams/:team/players/:player', function(req, res) {
    var db = mongojs.connect(cfg.db.getUri(), ['teams', 'players']);

    db.teams.findOne({ slug: req.params.team }, function(err, team) {
        if (err) {
            res.send(500);
        }

        db.players.findOne({ slug: req.params.player, team: team.name }, function(err, player) {
            if (err) {
                res.send(500);
            }

            res.json(200, player);
        });
    });
});

app.listen('9999');
exports = module.exports = app;