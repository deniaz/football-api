var localConfig = require('./db-config.js').get();

var projectConfig = {
    services: {
        base_uri: 'http://www.sfl.ch',
        team_base_uri: 'http://www.sfl.ch/superleague/klubs/',
        gameplan_uri: 'http://www.sfl.ch/superleague/spielplan/saison-201415/'
    },
    db: localConfig
};

module.exports = {
    get: function() {
        return projectConfig;
    }
};