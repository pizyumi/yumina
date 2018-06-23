var _ = require('underscore');
var pg = require('pg');

var path = require('path');

var common = require('./common');

var obj = {};

obj = _.extend(obj, {
  connect: async (context) => {
    var pbase = path.join(module.filename, '../../config');
    var pconfig = path.join(pbase, 'db.json');
    if ((_(await common.load_folders_from_path(pbase))).map((v) => path.basename(v)).includes(context.env)) {
      pconfig = path.join(pbase, context.env, 'db.json');
    }
    var config = await common.load_json_from_path(pconfig);
    return new pg.Pool(config);
  },
  disconnect: async (db) => {
    await db.end();
  }
});

module.exports = obj;
