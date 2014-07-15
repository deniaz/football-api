var mongojs = require('mongojs'),
    cfg = require('./config.js').get();

var api = {
    getTeams: function(req, res) {
        var db = mongojs.connect(cfg.db.getUri());

        db.collection('teams').find().toArray(function(err, teams) {
            if (err) {
                res.send(500);
            }

            res.json(200, teams);
        });
    },
    getTeam: function(req, res) {
        var db = mongojs.connect(cfg.db.getUri());

        db.collection('teams').findOne({ slug: req.params.team }, function(err, team) {
            if (err) {
                res.send(500);
            }

            res.json(200, team);
        });
    },
    getPlayersByTeam: function(req, res) {
        var db = mongojs.connect(cfg.db.getUri());

        db.collection('teams').findOne({ slug: req.params.team }, function(err, team) {
            if (err || !team) {
                res.send(500);
            }

            db.collection('players').find({ team: team.name }).toArray(function(err, players) {
                if (err) {
                    res.send(500);
                }

                res.json(200, players);
            });
        });
    },
    getPlayer: function(req, res) {
        var db = mongojs.connect(cfg.db.getUri());

        db.collection('teams').findOne({ slug: req.params.team }, function(err, team) {
            if (err || !team) {
                res.send(500);
            }

            db.collection('players').findOne({ slug: req.params.player, team: team.name }, function(err, player) {
                if (err) {
                    res.send(500);
                }

                res.json(200, player);
            });
        });
    }
};

module.exports = api;