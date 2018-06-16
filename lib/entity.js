var _ = require('underscore');
var colors = require('colors');
var pi = require('p-iteration');

var path = require('path');

var common = require('./common');

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
  get_key_schema: (schema) => {
    return _(schema).filter((v, i) => v.key);
  },
  get_table_name: (name) => {
    var func = get_custom_func(name, 'get_table_name');
    if (func) {
      return func(name);
    }
    else {
      return 't_' + name;
    }
  },
  get_table_column_type: (column, name) => {
    var func = get_custom_func(name, 'get_table_column_type');
    if (func) {
      return func(column, name);
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
  get_table_column_name: (column, name) => {
    var func = get_custom_func(name, 'get_table_column_name');
    if (func) {
      return func(column, name);
    }
    else {
      return column.name;
    }
  },
  generate_create_sql: (entity) => {
    var n = entity.name;
    var s = entity.schema;
    var ks = obj.get_key_schema(s);

    var tname = obj.get_table_name(n);
    var columns = _(s).map((v) => `\n  ${obj.get_table_column_name(v, n)} ${obj.get_table_column_type(v, n)}` + (v.null ? '' : ' not null')).join(', ');
    var keys = _(ks).map((v) => obj.get_table_column_name(v, n)).join(', ');

    return `create table ${tname} (${columns}, \n\n  primary key (${keys})\n);\n`;
  }
});

module.exports = async (context) => {
  var files = await common.load_files_from_path(context.p_entity);
  for (var i = 0; i < files.length; i++) {
    var f = files[i];

    var ext = path.extname(f);
    var name = path.basename(f, ext);
    if (ext === '.json') {
      entities[name] = await common.load_json_from_path(f);
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
