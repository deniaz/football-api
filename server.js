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

app.use(express.static(__dirname + '/stylesheets'));
app.use(express.static(__dirname + '/javascript'));
app.use(express.static(__dirname + '/images'));

app.get('/', function(req, res) {
    res.render('index');
});
app.get('/teams', function(req, res) {
    request(cfg.services.team_base_uri, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var teams = [];

            $('#team-index .team').each(function() {
                var team = {};
                team.name = $(this).find('.team-name').text();
                team.link = $(this).find('a').attr('href');
                teams.push(team);
            });

            console.log(teams);

            var db = mongojs.connect(cfg.db.getUri(), ['teams']);

            teams.forEach(function(team) {
                db.teams.findAndModify({
                    query: {
                        name: team.name
                    },
                    update: team,
                    upsert: true
                });
            });

            res.send('Fetched teams: ' + teams.length);
        }
    });
});
app.get('/players', function(req, res) {
    var db = mongojs.connect(cfg.db.getUri()),
        teamCollection = db.collection('teams'),
        playerCollection = db.collection('players');

    teams = teamCollection.find({}, function(error, docs) {
        docs.forEach(function(team) {
            console.info('Going for team ' + team.name);
            var uri = cfg.services.base_uri + team.link;
            request(uri, function(error, response, html) {
                if (!error) {
                    var $ = cheerio.load(html);

                    $('#team tr').each(function() {

                        var player = {};
                        player.squadNumber = $($(this).find('td')[0]).text().trim();
                        player.fullName = $($(this).find('td')[1]).find('a').text().trim();
                        player.shirtName = $($(this).find('td')[1]).find('span').text().trim();
                        player.position = $($(this).find('td')[2]).find('span').text().trim();
                        player.birthdate = $($(this).find('td')[3]).text().trim();
                        player.nationality = $($(this).find('td')[4]).find('span').text().trim();
                        player.appeareances = $($(this).find('td')[5]).text().trim();
                        player.goals = $($(this).find('td')[6]).text().trim();
                        player.assists = $($(this).find('td')[7]).text().trim();
                        player.yellowCards = $($(this).find('td')[8]).text().trim();
                        player.redCards = $($(this).find('td')[9]).text().trim();

                        player.link = $($(this).find('td')[1]).find('a').attr('href');
                        player.team = team.name;

                        if (!!player.shirtName && !!player.position) {
                            playerCollection.findAndModify({
                                query: {
                                    squadNumber: player.squadNumber,
                                    fullName: player.fullName,
                                    team: player.team
                                },
                                update: player,
                                upsert: true
                            });
                        }
                    });

                    console.log('Stored all players.');
                } else {
                    console.error(error);
                }
            });
        });
    });

    res.send('Fetched players from: ' + teams.length);
});
//app.get('/matches', function(req, res) {});

app.listen('9999');
console.log('Scrape Server started');
exports = module.exports = app;