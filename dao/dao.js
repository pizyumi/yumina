var _ = require('underscore');
var pi = require('p-iteration');

var path = require('path');

var common = require('../lib/common');

var common_columns = [
  'delete_date'
];

module.exports = async (db, e) => {
  var d = {};

  await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
    var name = v.name;
    var table = await e.get_table_name(name);
    var keys = await e.get_table_key_column_names(v);
    var normals = await e.get_table_not_key_column_names(v);
    var uniques = _(normals).filter((v) => !common_columns.includes(v));

    d[name + '_list'] = async (ids) => {
      var orders = {};
      _(keys).each((v) => orders[v] = 1);

      return await get_list(db, table, _.pick(ids, keys), orders);
    };
    d[name] = async (ids) => {
      if (_(keys).all((v) => ids[v] !== undefined)) {
        return await get_item(db, table, _.pick(ids, keys));
      }
      else {
        throw new Error('insufficient ids.');
      }
    };
    d[name + '_new'] = async (ids, pobj) => {
      var nlkeys = _(keys).initial();
      var lkey = _(keys).last();

      if (_(nlkeys).all((v) => ids[v] !== undefined)) {
        return await new_item(db, table, lkey, _.pick(ids, nlkeys), _.pick(pobj, uniques));
      }
      else {
        throw new Error('insufficient ids.');
      }
    };
    d[name + '_update'] = async (ids, pobj) => {
      if (_(keys).all((v) => ids[v] !== undefined)) {
        return await update_item(db, table, _.pick(ids, keys), _.pick(pobj, uniques));
      }
      else {
        throw new Error('insufficient ids.');
      }
    };
    d[name + '_delete'] = async (ids) => {
      if (_(keys).all((v) => ids[v] !== undefined)) {
        return await delete_item(db, table, _.pick(ids, keys));
      }
      else {
        throw new Error('insufficient ids.');
      }
    };

    try {
      d = _.extend({}, d, require(path.join(process.cwd(), e.get_entity_path(name), 'dao.js'))(d, db, common));
    }
    catch (err) {
      console.log(err.message.magenta);
    }
  });

  return d;
};

async function get_list (db, table, ids, orders) {
  var wobj = _.extend({}, ids, { delete_date: null });
  var oobj =  _.extend({}, orders);
  var sql = common.create_select_order_by_sql(table, wobj, oobj);
  return await common.select_by_sql(db, sql, ids);
}

async function get_item (db, table, ids) {
  var wobj = _.extend({}, ids, { delete_date: null });
  var sql = common.create_select_sql(table, wobj);
  return await common.select_one_by_sql(db, sql, ids);
}

async function new_item (db, table, lkey, ids, pobj) {
  var csql = common.create_select_max_sql(table, lkey, ids);
  var max = (await common.select_one_by_sql(db, csql, ids))[lkey];
  var lid = 1;
  if (max !== null) {
    lid = max + 1;
  }
  ids[lkey] = lid;

  var obj = _.extend(pobj, ids, { delete_date: null });
  var sql = common.create_insert_sql(table, obj);
  await common.insert_one_by_sql(db, sql, obj);

  return lid;
}

async function update_item (db, table, ids, pobj) {
  var sobj = _.extend(pobj, { delete_date: null });
  var wobj = _.extend({}, ids);
  var obj = _.extend({}, sobj, wobj);
  var sql = common.create_update_sql(table, sobj, wobj);
  await common.update_one_by_sql(db, sql, obj);
}

async function delete_item (db, table, ids) {
  var sobj = { delete_date: new Date() };
  var wobj = _.extend({}, ids);
  var obj = _.extend({}, sobj, wobj);
  var sql = common.create_update_sql(table, sobj, wobj);
  await common.update_one_by_sql(db, sql, obj);
}
