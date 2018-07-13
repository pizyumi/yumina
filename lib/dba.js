var _ = require('underscore');
var pg = require('pg');

var path = require('path');

var common = require('./common');

var obj = {};

obj = _.extend(obj, {
  connect: async (con) => {
    var pconfig = path.join(con.p_conf, 'db.json');
    if ((_(await common.load_folders_from_path(con.p_conf))).map((v) => path.basename(v)).includes(con.env)) {
      pconfig = path.join(con.p_conf, con.env, 'db.json');
    }
    var config = await common.load_json_from_path(pconfig);
    var db = new pg.Pool(config);

    db.on('error', (err) => {
      console.error(err);
      process.exit(1);
    });

    return db;
  },
  disconnect: async (db) => {
    await db.end();
  }
});

module.exports = obj;
