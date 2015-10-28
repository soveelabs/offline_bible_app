var defer = require('config/defer').deferConfig;

exports = module.exports = {
  mongo: {
    host: 'localhost',
    database: 'bible-api',
    username: null,
    password: null,
    replica_set: null,
    uri: defer(function(cfg) {
      var uri = '';
      if (cfg.mongo.username) { uri = uri + cfg.mongo.username; }
      if (cfg.mongo.password) { uri = uri + ":" + cfg.mongo.password; }
      if (uri.length > 0) { uri = uri + '@'; }
      uri = uri + cfg.mongo.host;
      uri = uri + '/' + cfg.mongo.database;
      if (cfg.mongo.replica_set) { uri = uri + '?replicaSet=' + cfg.mongo.replica_set; }

      return 'mongodb://' + uri;
    })
  }
}
