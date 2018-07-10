var _ = require('underscore');
var co = require('co');
var yargs = require('yargs');

var app = require('./lib/app');
var dao = require('./dao/dao');
var dba = require('./lib/dba');
var entity = require('./lib/entity');
var role = require('./lib/role');
var server = require('./lib/server');

async function main() {
  yargs.options({
    e: {
      alias: 'env',
      description: 'enviromnent',
      type: 'string',
      default: 'dev'
    }
  });

  var args = yargs.parse(process.argv);

  var con = await app.initialize({}, args.env);
  var db = await dba.connect(con);
  var e = await entity(con);
  var d = await dao(db, e);
  var r = await role(con);
  var svr = await server.start(con, d, r);

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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
