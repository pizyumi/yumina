var _ = require('underscore');
var pi = require('p-iteration');
var yargs = require('yargs');

var path = require('path');

var app = require('../lib/app');
var common = require('../lib/common');
var dba = require('../lib/dba');
var entity = require('../lib/entity');

module.exports = async (p_work) => {
  var con = await app.initialize('dev', p_work, path.dirname(__dirname));
  var db = await dba.connect(con);
  var e = await entity(con);

  await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
    var screate = await e.generate_create_sql(v);
    var sdrop = await e.generate_drop_sql(v);
    var sinsert = await e.generate_insert_sql(v, await e.get_data(v.name));
    var sdelete = await e.generate_delete_sql(v);

    var pcreate = path.join(con.p_create_sql, v.name + '.sql');
    var pdrop = path.join(con.p_drop_sql, v.name + '.sql');
    var pinsert = path.join(con.p_insert_sql, v.name + '.sql');
    var pdelete = path.join(con.p_delete_sql, v.name + '.sql');

    await common.save_text_to_path(pcreate, screate);
    await common.save_text_to_path(pdrop, sdrop);
    await common.save_text_to_path(pinsert, sinsert);
    await common.save_text_to_path(pdelete, sdelete);

    await common.execute_sql(db, sdrop);
    await common.execute_sql(db, screate);
    await common.execute_sql(db, sinsert);
  });

  await common.copy_folder_from_path_to_path(con.p_public, con.p_fspublic);

  await dba.disconnect(db);
};

async function main() {
  yargs.options({
    w: {
      alias: 'work',
      description: 'path to work folder',
      type: 'string',
      default: 'sample'
    }
  });

  var args = yargs.parse(process.argv);

  await module.exports(args.work);
}

if (module.parent === null) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
