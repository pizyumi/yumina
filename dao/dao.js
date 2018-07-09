var _ = require('underscore');
var pi = require('p-iteration');

var path = require('path');

var common = require('../lib/common');

var db = null;

var common_columns = [
  'delete_date'
];

module.exports = async (pdb, e) => {
  db = pdb;

  var dao = {};

  var fs = await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
    var name = v.name;
    var table = await e.get_table_name(name);
    var keys = await e.get_table_key_column_names(v);
    var normals = await e.get_table_not_key_column_names(v);
    var uniques = _(normals).filter((v) => !common_columns.includes(v));

    var funcs = {};

    funcs[name + '_list'] = async (ids) => {
      var orders = {};
      _(keys).each((v) => orders[v] = 1);

      return await get_list(table, _.pick(ids, keys), orders);
    };
    funcs[name] = async (ids) => {
      if (_(keys).all((v) => ids[v] !== undefined)) {
        return await get_item(table, _.pick(ids, keys));
      }
      else {
        throw new Error('insufficient ids.');
      }
    };
    funcs[name + '_new'] = async (ids, pobj) => {
      var nlkeys = _(keys).initial();
      var lkey = _(keys).last();

      if (_(nlkeys).all((v) => ids[v] !== undefined)) {
        return await new_item(table, lkey, _.pick(ids, nlkeys), pobj, uniques);
      }
      else {
        throw new Error('insufficient ids.');
      }
    };
    funcs[name + '_update'] = async (ids, pobj) => {
      if (_(keys).all((v) => ids[v] !== undefined)) {
        return await update_item(table, _.pick(ids, keys), pobj, uniques);
      }
      else {
        throw new Error('insufficient ids.');
      }
    };
    funcs[name + '_delete'] = async (ids) => {
      if (_(keys).all((v) => ids[v] !== undefined)) {
        return await delete_item(table, _.pick(ids, keys));
      }
      else {
        throw new Error('insufficient ids.');
      }
    };

    try {
      funcs = _.extend({}, funcs, require(path.join(process.cwd(), e.get_entity_path(name), 'dao.js'))(funcs, dao, db));
    }
    catch (err) {
      console.log(err.message.magenta);
    }

    dao = _.extend(dao, funcs);
  });

  return dao;
};

async function get_list (table, ids, orders) {
  var wobj = _.extend({}, ids, { delete_date: null });
  var oobj =  _.extend({}, orders);
  var sql = common.create_select_order_by_sql(table, wobj, oobj);
  return await common.select_by_sql(db, sql, ids);
}

async function get_item (table, ids) {
  var wobj = _.extend({}, ids, { delete_date: null });
  var sql = common.create_select_sql(table, wobj);
  return await common.select_one_by_sql(db, sql, ids);
}

async function new_item (table, lkey, ids, pobj, unique_columns) {
  var csql = common.create_select_max_sql(table, lkey, ids);
  var max = (await common.select_one_by_sql(db, csql, ids))[lkey];
  var lid = 1;
  if (max !== null) {
    lid = max + 1;
  }
  ids[lkey] = lid;

  var obj = _.extend(_.pick(pobj, unique_columns), ids, { delete_date: null });
  var sql = common.create_insert_sql(table, obj);
  await common.insert_one_by_sql(db, sql, obj);

  return lid;
}

async function update_item (table, ids, pobj, unique_columns) {
  var sobj = _.extend(_.pick(pobj, unique_columns), { delete_date: null });
  var wobj = _.extend({}, ids);
  var obj = _.extend({}, sobj, wobj);
  var sql = common.create_update_sql(table, sobj, wobj);
  await common.update_one_by_sql(db, sql, obj);
}

async function delete_item (table, ids) {
  var sobj = { delete_date: new Date() };
  var wobj = _.extend({}, ids);
  var obj = _.extend({}, sobj, wobj);
  var sql = common.create_update_sql(table, sobj, wobj);
  await common.update_one_by_sql(db, sql, obj);
}
