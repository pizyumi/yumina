var _ = require('underscore');
var colors = require('colors');
var pi = require('p-iteration');

var path = require('path');

var common = require('./common');

var con = {};
var entities = {};
var custom = {};

function get_custom_func (ename, fname) {
  if (custom[ename] && custom[ename][fname]) {
    return custom[ename][fname];
  }
  else if (custom['_'] && custom['_'][fname]) {
    return custom['_'][fname];
  }
  else {
    return undefined;
  }
}

var obj = {};

obj = _.extend(obj, {
  get_entities: () => {
    return entities;
  },
  get_data: async (name) => {
    return common.load_json_from_path(path.join(con.p_data, name + '.json'));
  },
  get_key_schema: async (schema) => {
    return _(schema).filter((v, i) => v.key);
  },
  get_table_name: async (name) => {
    var func = get_custom_func(name, 'get_table_name');
    if (func) {
      return await func(name);
    }
    else {
      return 't_' + name;
    }
  },
  get_table_column_type: async (column, name) => {
    var func = get_custom_func(name, 'get_table_column_type');
    if (func) {
      return await func(column, name);
    }
    else {
      var t = column.type;

      if (t === 'integer') {
        return 'integer';
      }
      else if (t === 'string') {
        return 'character varying(' + _.result(column, 'max', 256) + ')';
      }
      else if (t === 'date') {
        return 'timestamp with time zone';
      }
      else {
        throw new Error('not supported type.');
      }
    }
  },
  get_table_column_name: async (column, name) => {
    var func = get_custom_func(name, 'get_table_column_name');
    if (func) {
      return await func(column, name);
    }
    else {
      return column.name;
    }
  },
  get_table_value_literal: async (column, value, name) => {
    var func = get_custom_func(name, 'get_table_value_literal');
    if (func) {
      return await func(column, value, name);
    }
    else {
      var t = column.type;

      if (value === null) {
        return 'null';
      }
      else if (t === 'integer') {
        return String(value);
      }
      else if (t === 'string') {
        return '\'' + value + '\'';
      }
      else if (t === 'date') {
        return '\'' + value + '\'';
      }
      else {
        throw new Error('not supported type.');
      }
    }
  },
  generate_create_sql: async (entity) => {
    var n = entity.name;
    var s = entity.schema;
    var ks = await obj.get_key_schema(s);

    var tname = await obj.get_table_name(n);
    var columns = (await pi.map(s, async (v) => '\n  ' + await obj.get_table_column_name(v, n) + ' ' + await obj.get_table_column_type(v, n) + (v.null ? '' : ' not null'))).join(', ');
    var keys = (await pi.map(ks, async (v) => await obj.get_table_column_name(v, n))).join(', ');

    return `create table ${tname} (${columns}, \n\n  primary key (${keys})\n);\n`;
  },
  generate_drop_sql: async (entity) => {
    var n = entity.name;

    var tname = await obj.get_table_name(n);

    return `drop table if exists ${tname};\n`;
  },
  generate_insert_sql: async (entity, records) => {
    var n = entity.name;
    var s = entity.schema;

    var tname = await obj.get_table_name(n);

    return (await pi.map(records, async (v) => {
      var values = (await pi.map(s, async (v2) => await obj.get_table_value_literal(v2, v[v2.name], n))).join(', ');

      return `insert into ${tname} values (${values});`;
    })).join('\n') + '\n';
  },
  generate_delete_sql:async (entity) => {
    var n = entity.name;

    var tname = await obj.get_table_name(n);

    return `delete from ${tname};\n`;
  }
});

module.exports = async (pcon) => {
  con = pcon;

  var files = await common.load_files_from_path(con.p_entity);
  for (var i = 0; i < files.length; i++) {
    var f = files[i];

    var ext = path.extname(f);
    var name = path.basename(f, ext);
    if (ext === '.json') {
      entities[name] = await common.load_json_from_path(f);
      entities[name]['name'] = name;
    }
    else if (ext === '.js') {
      custom[name] = await require(f)();
    }
    else {
      console.log(f.red);
    }
  }

  return obj;
};
