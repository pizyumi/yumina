var _ = require('underscore');
var bluebird = require('bluebird');
var fsextra = bluebird.promisifyAll(require('fs-extra'));
var stripbom = require('strip-bom');
var pi = require('p-iteration');

var fs = bluebird.promisifyAll(require('fs'));
var path = require('path');

var obj = {};

obj = _.extend(obj, {
  load_text_from_path: async (p) => {
    return stripbom(await fs.readFileAsync(p, 'utf-8'));
  },
  load_json_from_path: async (p) => {
    return JSON.parse(await obj.load_text_from_path(p));
  },
  load_files_folders_from_path: async (p) => {
    return _(await fs.readdirAsync(p)).map((v) => path.join(p, v));
  },
  load_files_from_path: async (p) => {
    return pi.filter(await obj.load_files_folders_from_path(p), async (v) => (await fs.statAsync(v)).isFile());
  },
  load_folders_from_path: async (p) => {
    return pi.filter(await obj.load_files_folders_from_path(p), async (v) => (await fs.statAsync(v)).isDirectory());
  },
  save_text_to_path: async (p, text) => {
    await fsextra.mkdirsAsync(path.dirname(p));
    await fs.writeFileAsync(p, text, 'utf-8');
  },
  create_folder_from_path: async (p) => {
    await fsextra.mkdirsAsync(p);
  }
});

obj = _.extend(obj, {
  create_where_sql_clause: (wobj) => {
    return _(Object.keys(wobj)).map((v) => {
      if (wobj[v] === null) {
        return v + ' is ' + 'null';
      }
      else {
        return v + ' = ' + '@' + v;
      }
    }).join(' and ');
  },
  create_select_sql: (table, wobj) => {
    var where = obj.create_where_sql_clause(wobj);

    if (_.isEmpty(wobj)) {
      return `select * from ${table}`;
    }
    else {
      return `select * from ${table} where ${where}`;
    }
  },
  create_select_order_by_sql: (table, wobj, oobj) => {
    var where = obj.create_where_sql_clause(wobj);
    var order = _(Object.keys(oobj)).map((v) => v + ' ' +  (oobj[v] === 1 ? 'asc' : 'desc')).join(', ');

    if (_.isEmpty(wobj)) {
      if (_.isEmpty(oobj)) {
        return `select * from ${table}`;
      }
      else {
        return `select * from ${table} order by ${order}`;
      }
    }
    else {
      if (_.isEmpty(oobj)) {
        return `select * from ${table} where ${where}`;
      }
      else {
        return `select * from ${table} where ${where} order by ${order}`;
      }
    }
  },
  create_select_max_sql: (table, column, wobj) => {
    var where = obj.create_where_sql_clause(wobj);

    if (_.isEmpty(wobj)) {
      return `select max(${column}) as ${column} from ${table}`;
    }
    else {
      return `select max(${column}) as ${column} from ${table} where ${where}`;
    }
  },
  create_insert_sql: (table, obj) => {
    var columns = Object.keys(obj).join(', ');
    var values = _(Object.keys(obj)).map((v) => '@' + v).join(', ');

    return `insert into ${table} (${columns}) values (${values})`;
  },
  create_update_sql: (table, sobj, wobj) => {
    var set = _(Object.keys(sobj)).map((v) => v + ' = ' + '@' + v).join(', ');
    var where = obj.create_where_sql_clause(wobj);

    if (_.isEmpty(wobj)) {
      return `update ${table} set ${set}`;
    }
    else {
      return `update ${table} set ${set} where ${where}`;
    }
  }
});

obj = _.extend(obj, {
  execute_sql: async (db, sql) => {
    console.log(sql.yellow);

    await db.query(sql);
  },
  select_by_sql: async (db, sql, params) => {
    var { s, ps } = transform_params(sql, params);

    console.log(s.yellow);
    console.log(ps);

    return (await db.query(s, ps)).rows;
  },
  select_one_by_sql: async (db, sql, params) => {
    var rows = await obj.select_by_sql(db, sql, params);
    if (rows.length === 0) {
      return null;
    }
    else if (rows.length === 1) {
      return rows[0];
    }
    else {
      throw new Error('more than one records.');
    }
  },
  insert_by_sql: async (db, sql, params) => {
    var { s, ps } = transform_params(sql, params);

    console.log(s.yellow);
    console.log(ps);

    var n = (await db.query(s, ps)).rowCount;
    if (n === 0) {
      throw new Error('not inserted.');
    }
    else if (n === 1) {
      return n;
    }
    else {
      throw new Error('more than one inserted.');
    }
  },
  update_by_sql: async (db, sql, params) => {
    var { s, ps } = transform_params(sql, params);

    console.log(s.yellow);
    console.log(ps);

    var n = (await db.query(s, ps)).rowCount;
    if (n === 0) {
      throw new Error('not updated.');
    }
    else {
      return n;
    }
  },
  update_one_by_sql: async (db, sql, params) => {
    var n = await obj.update_by_sql(db, sql, params);

    if (n === 1) {
      return n;
    }
    else {
      throw new Error('more than one updated.');
    }
  }
});

function transform_params (sql, params) {
  var s = sql;
  var ps = [];
  var c = 0;

  _(Object.keys(params)).each((v) => {
    var p1 = '@' + v;
    var p2 = '$' + (c + 1);

    if (s.indexOf(p1) !== -1) {
      s = s.replace(p1, p2);
      ps.push(params[v]);
      c++;
    }
  });

  return { s, ps };
}

module.exports = obj;
