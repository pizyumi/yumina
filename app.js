var _ = require('underscore');
var co = require('co');
var yargs = require('yargs');

var path = require('path');

var app = require('./lib/app');
var dao = require('./lib/dao');
var dba = require('./lib/dba');
var entity = require('./lib/entity');
var role = require('./lib/role');
var server = require('./lib/server');

module.exports = async (env, p_work) => {
  var con = await app.initialize(env, p_work, __dirname);
  var db = await dba.connect(con);
  var e = await entity(con);
  var d = await dao(db, e);
  var r = await role(con);

  await app.compile(con, e, r);

  var svr = await server.start(con, e, d, r);

  var end_server_once = _.once(server.end);
  var disconnect_db_once = _.once(dba.disconnect);

  console.log('http server is running...press enter key to exit.');
  process.on('SIGTERM', () => {
    co(function* () {
      yield end_server_once(svr);
      yield disconnect_db_once(db);
      process.exit(0);
    });
  });
  process.stdin.on('data', (data) => {
    if (data.indexOf('\n') !== -1) {
      co(function* () {
        yield end_server_once(svr);
        yield disconnect_db_once(db);
        process.exit(0);
      });
    }
  });
};

async function main() {
  yargs.options({
    e: {
      alias: 'env',
      description: 'enviromnent',
      type: 'string',
      default: 'dev'
    },
    w: {
      alias: 'work',
      description: 'path to work folder',
      type: 'string',
      default: 'sample'
    }
  });

  var args = yargs.parse(process.argv);

  await module.exports(args.env, args.work);
}

if (module.parent === null) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
