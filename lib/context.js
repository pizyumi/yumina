var _ = require('underscore');

var path = require('path');

var common = require('./common');

var obj = {};

obj = _.extend(obj, {
  get_context: async (pconf, env, p_conf) => {
    var ddconf = {
      p_work: '',
      appname: 'yumina',
      port: 3000,
      session_secret: 'yumekawaii',
      p_public: '',
      fname_user_by_name: 'user_by_name',
      fname_user_by_id: 'user',
      cname_id: 'id',
      cname_password: 'password',
      p_js: [],
      p_css: []
    };
    var dconf = await common.load_json_from_path(path.join(p_conf, 'config.json'));
    var config = _.extend(ddconf, dconf, pconf);

    var p_work = config.p_work;
    var p_locales = path.join(p_work, 'locales');
    var p_entity = path.join(p_work, 'entity');
    var p_data = path.join(p_work, 'data');
    var p_role = path.join(p_work, 'role');
    var p_design = path.join(p_work, 'design');
    var p_asset = path.join(p_work, 'asset');
    var p_asset_js = path.join(p_asset, 'js');
    var p_asset_css = path.join(p_asset, 'css');
    var p_sql = path.join(p_work, 'sql');
    var p_create_sql = path.join(p_sql, 'create');
    var p_drop_sql = path.join(p_sql, 'drop');
    var p_insert_sql = path.join(p_sql, 'insert');
    var p_delete_sql = path.join(p_sql, 'delete');

    var appname = config.appname;
    var port = config.port;
    var session_secret = config.session_secret;
    var p_public = config.p_public;
    var fname_user_by_name = config.fname_user_by_name;
    var fname_user_by_id = config.fname_user_by_id;
    var cname_id = config.cname_id;
    var cname_password = config.cname_password;
    var p_js = config.p_js;
    var p_css = config.p_css;

    return {
      env,
      p_work,
      p_locales, 
      p_entity,
      p_data,
      p_role,
      p_design,
      p_asset,
      p_asset_js,
      p_asset_css,
      p_sql,
      p_create_sql,
      p_drop_sql,
      p_insert_sql,
      p_delete_sql,
      appname,
      port,
      session_secret,
      p_public,
      fname_user_by_name,
      fname_user_by_id,
      cname_id,
      cname_password,
      p_js,
      p_css
    };
  }
});

module.exports = obj;
