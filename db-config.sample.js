var dbConfig = {
    parts: {
        schema: 'mongodb',
        user: 'user',
        pass: 'pass',
        host: 'localhost',
        port: '12345',
        path: '/db'
    },
    getUri: function() {
        return this.parts.schema + '://' + this.parts.user + ':' + this.parts.pass + '@' + this.parts.host + ':' + this.parts.port + this.parts.path;
    }
};

module.exports = {
    get: function() {
        return dbConfig;
    }
};