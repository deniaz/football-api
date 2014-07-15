var express = require('express'),
    mongojs = require('mongojs'),
    cfg = require('./config.js').get(),
    hbs = require('hbs'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcrypt'),
    bodyParser = require('body-parser'),
    hat = require('hat'),
    api = require('./api.js'),
    app = express();

app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done) {
        var db = mongojs.connect(cfg.db.getUri(), ['users']);
        db.users.findOne({ email: username }, function(err, user) {
            if (err) {
                console.log(err);
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            console.log('Found user by email');
            bcrypt.compare(password, user.hash, function(err, doesMatch){
                if (err) {
                    return done(err);
                }

                if (doesMatch) {
                    return done(null, user);
                }

                return done(null, false);
            });

            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
   done(null, user.email);
});

passport.deserializeUser(function(username, done) {
    var db = mongojs.connect(cfg.db.getUri(), ['users']);
    var user = db.users.findOne({email: username}, function(err, user) {
        if (err) {
            done(err);
        }

        done(null, user);
    });
});

app.post('/register', function(req, res) {
    var email = req.body.email,
        pass = req.body.password;

    //validate email
    bcrypt.hash(pass, 8, function(err, hash) {
        var db = mongojs.connect(cfg.db.getUri(), ['users']);
        db.users.insert({
            email: email,
            hash: hash,
            apikey: hat(),
            create: Date.now()
        });
    });

    res.redirect('/user');
});

app.get('/login', function(req, res) {
    res.send(501);
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/login',
    failureFlash: false
}));

app.get('/', function(req, res) {
    res.render('index');
});

app.get(
    '/user',
    passport.authenticate('local'),
    function(req, res) {
        var user = req.user;
        console.log(user);
        res.send(418);
    }
);

app.get('/teams', api.getTeams);
app.get('/teams/:team', api.getTeam);
app.get('/teams/:team/players', api.getPlayersByTeam);
app.get('/teams/:team/players/:player', api.getPlayer);

app.listen('9999');
exports = module.exports = app;