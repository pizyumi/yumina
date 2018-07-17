var _ = require('underscore');
var colors = require('colors');
var pi = require('p-iteration');

var path = require('path');

var common = require('./common');

var con = {};
var roles = {};
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
  get_roles: () => {
    return roles;
  },
  get_role_path: (name) => {
    return path.join(con.p_role, name);
  }
});

module.exports = async (pcon) => {
  con = pcon;

  var folders = await common.load_folders_from_path(con.p_role);
  if (folders.length === 0) {
    folders = await common.load_folders_from_path(con.p_yrole);
  }
  for (var i = 0; i < folders.length; i++) {
    var f = folders[i];

    var name = path.basename(f);
    var pjson = path.join(f, 'definition.json');
    var pjs = path.join(f, 'custom.json');
    var pauth = path.join(path.isAbsolute(f) ? '' : process.cwd(), f, 'auth.js');

    try {
      var json = await common.load_json_from_path(pjson);
      json['name'] = name;
      json['level_api'] = json['api'].match(/\//gm).length;
      json['level_web'] = json['web'].match(/\//gm).length;

      json = _.extend(json, require(pauth)(common));

      roles[name] = json;
    }
    catch (err) {
      console.log(pjson.magenta);
    }

    try {
      custom[name] = await require(pjs)();
    }
    catch (err) {
      console.log(pjs.magenta);
    }
  }

  return obj;
};
