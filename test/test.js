var _ = require('underscore');
var chai = require('chai');
var colors = require('colors');
var moment = require("moment");
var pi = require('p-iteration');
var randomjs = require("random-js");

var path = require('path');

var app = require('../lib/app');
var common = require('../lib/common');
var dao = require('../lib/dao');
var dba = require('../lib/dba');
var entity = require('../lib/entity');

var r = randomjs();

var db = null;
var e = null;
var d = null;

module.exports = {
  before: async () => {
    var p_work = 'sample';
    var con = await app.initialize('test', p_work, path.dirname(__dirname));
    db = await dba.connect(con);
    e = await entity(con);
    d = await dao(db, e);

    await app.compile(con, e);

    await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
      var sdrop = await e.generate_drop_sql(v);
      var screate = await e.generate_create_sql(v);
      var sinsert = await e.generate_insert_sql(v, await e.get_data(v.name));

      await common.execute_sql(db, sdrop);
      await common.execute_sql(db, screate);
      await common.execute_sql(db, sinsert);
    });
  },
  'sql': async () => {
    await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
      await check_sql('create', v);
      await check_sql('drop', v);
      await check_sql('insert', v, await e.get_data(v.name));
      await check_sql('delete', v);
    });
  },
  'dao': async () => {
    await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
      var recs = await e.get_data(v.name);

      await check_dao_list(d, v, recs);
      await check_dao_item(d, v, recs);

      if (v.name === 'user') {
        await check_dao_user_by_name(d, v, recs);
      }

      await check_dao_update(d, v, recs);
      await check_dao_delete(d, v, recs);
      await check_dao_new(d, v, recs);
    });
  },
  after: async () => {
    await dba.disconnect(db);
  }
};

async function check_sql (type, entity, data) {
  var sql1 = await e[`generate_${type}_sql`](entity, data);
  var sql2 = await common.load_text_from_path(path.join(path.dirname(module.filename), 'sql', type, entity.name + '.sql'));

  console.log(sql1.yellow);
  console.log(sql2.yellow);

  chai.assert.equal(sql1, sql2);
}

async function check_dao_list (d, entity, recs) {
  var name = entity.name;

  var recs_exp = _.filter(recs, (v) => v.delete_date === null);
  var recs_act = await d[name + '_list']({});

  if (entity.debug) {
    console.log(recs_exp);
    console.log(recs_act);
  }

  chai.assert.deepEqual(recs_act, recs_exp);
}

async function check_dao_item (d, entity, recs) {
  var name = entity.name;
  var keys = await e.get_table_key_column_names(entity);

  await pi.forEachSeries(recs, async (v) => {
    var rec_exp = v;
    var rec_act = await d[name](_.pick(v, keys));

    if (entity.debug) {
      console.log(rec_exp);
      console.log(rec_act);
    }

    if (rec_exp.delete_date === null) {
      chai.assert.deepEqual(rec_act, rec_exp);
    }
    else {
      chai.assert.equal(rec_act, null);
    }
  });
}

var common_columns = [
  'delete_date'
];

async function check_dao_update (d, entity, recs) {
  var name = entity.name;
  var schema = entity.schema;
  var keys = await e.get_table_key_column_names(entity);

  await pi.forEachSeries(recs, async (v) => {
    var rec_old = v;
    var rec_new = _.clone(v);

    _(schema).each((v2) => {
      if (v2.type === 'integer') {
        rec_new[v2.name] = r.integer(0, 123456);
      }
      else if (v2.type === 'string') {
        rec_new[v2.name] = r.string(16);
      }
      else if (v2.type === 'date') {
        rec_new[v2.name] = moment(r.date(new Date('2001/01/01'), new Date('2020/12/31'))).utc().format();
      }
      else {
        throw new Error('not supported type.');
      }
    });

    var e = null;
    try {
      await d[name + '_update']({}, rec_new);
    }
    catch (err) {
      e = err;
    }

    chai.assert.isNotNull(e);

    await d[name + '_update'](_.pick(v, keys), rec_new);

    var rec_exp = _.extend({}, rec_new, _.pick(v, keys), { delete_date: null });
    var rec_act = await d[name](_.pick(v, keys));

    if (entity.debug) {
      console.log(rec_old);
      console.log(rec_new);
      console.log(rec_exp);
      console.log(rec_act);
    }

    chai.assert.deepEqual(rec_act, rec_exp);
  });
}

async function check_dao_delete (d, entity, recs) {
  var name = entity.name;
  var keys = await e.get_table_key_column_names(entity);

  await pi.forEachSeries(recs, async (v) => {
    var rec_old = v;

    var e = null;
    try {
      await d[name + '_delete']({});
    }
    catch (err) {
      e = err;
    }

    chai.assert.isNotNull(e);

    await d[name + '_delete'](_.pick(v, keys));

    var rec_act = await d[name](_.pick(v, keys));

    if (entity.debug) {
      console.log(rec_old);
      console.log(rec_act);
    }

    chai.assert.equal(rec_act, null);
  });
}

async function check_dao_new (d, entity, recs) {
  var name = entity.name;
  var keys = await e.get_table_key_column_names(entity);
  var nlkeys = _(keys).initial();
  var lkey = _(keys).last();

  await pi.forEachSeries(recs, async (v, i) => {
    var rec_new = v;

    if (keys.length > 1) {
      var e = null;
      try {
        await d[name + '_new']({}, rec_new);
      }
      catch (err) {
        e = err;
      }

      chai.assert.isNotNull(e);
    }

    var ids = _.pick(v, nlkeys);
    ids[lkey] = recs.length + i + 1;

    await d[name + '_new'](_.pick(v, keys), rec_new);

    var rec_exp = _.extend({}, rec_new, ids, { delete_date: null });
    var rec_act = await d[name](ids);

    if (entity.debug) {
      console.log(rec_new);
      console.log(rec_exp);
      console.log(rec_act);
    }

    chai.assert.deepEqual(rec_act, rec_exp);
  });
}

async function check_dao_user_by_name (d, entity, recs) {
  var name = entity.name;
  var keys = await e.get_table_key_column_names(entity);

  await pi.forEachSeries(recs, async (v) => {
    var rec_exp = v;
    var rec_act = await d.user_by_name(v.name);

    if (entity.debug) {
      console.log(rec_exp);
      console.log(rec_act);
    }

    if (rec_exp.delete_date === null) {
      chai.assert.deepEqual(rec_act, rec_exp);
    }
    else {
      chai.assert.equal(rec_act, null);
    }
  });
}
