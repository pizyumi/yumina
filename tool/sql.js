var _ = require('underscore');
var pi = require('p-iteration');
var yargs = require('yargs');

var path = require('path');

var app = require('../lib/app');
var common = require('../lib/common');
var dba = require('../lib/dba');
var entity = require('../lib/entity');

async function main() {
  yargs.options({
    c: {
      alias: 'conf',
      description: 'path to config file',
      type: 'string',
      default: 'sample\\config'
    }
  });

  var args = yargs.parse(process.argv);

  var con = await app.initialize({}, 'dev', args.conf);
  var db = await dba.connect(con, args.conf);
  var e = await entity(con);

  await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
    var screate = await e.generate_create_sql(v);
    var sdrop = await e.generate_drop_sql(v);
    var sinsert = await e.generate_insert_sql(v, await e.get_data(v.name));
    var sdelete = await e.generate_delete_sql(v);

    await common.save_text_to_path(path.join(con.p_create_sql, v.name + '.sql'), screate);
    await common.save_text_to_path(path.join(con.p_drop_sql, v.name + '.sql'), sdrop);
    await common.save_text_to_path(path.join(con.p_insert_sql, v.name + '.sql'), sinsert);
    await common.save_text_to_path(path.join(con.p_delete_sql, v.name + '.sql'), sdelete);

    await common.execute_sql(db, sdrop);
    await common.execute_sql(db, screate);
    await common.execute_sql(db, sinsert);
  });

  await dba.disconnect(db);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
