var _ = require('underscore');

var path = require('path');

var common = require('./common');

var obj = {};

obj = _.extend(obj, {
  get_context: async (env, p_work, p_yumina) => {
    var p_conf = path.join(p_work, 'config');
    var ddconf = {
      appname: 'yumina',
      appname_disp_en: 'yumina',
      appname_disp_ja: 'yumina',
      port: 3000,
      session_secret: 'yumekawaii',
      fname_user_by_name: 'user_by_name',
      fname_user_by_id: 'user',
      cname_id: 'id',
      cname_password: 'password',
      p_js: [],
      p_css: []
    };
    var dconf = await common.load_json_from_path_empty_object(path.join(p_conf, 'config.json'));
    var conf = _.extend(ddconf, dconf);

    var p_ylocales = path.join(p_yumina, 'locales');
    var p_yrole = path.join(p_yumina, 'role');
    var p_front = path.join(p_yumina, 'front');
    var p_yasset = path.join(p_yumina, 'asset');

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

    var appname = conf.appname;
    var appname_disp_en = conf.appname_disp_en;
    var appname_disp_ja = conf.appname_disp_ja;
    var port = conf.port;
    var session_secret = conf.session_secret;
    var p_public = conf.p_public;
    var fname_user_by_name = conf.fname_user_by_name;
    var fname_user_by_id = conf.fname_user_by_id;
    var cname_id = conf.cname_id;
    var cname_password = conf.cname_password;
    var p_js = conf.p_js;
    var p_css = conf.p_css;

    return {
      env,
      p_yumina,
      p_ylocales,
      p_yrole,
      p_front,
      p_yasset,
      p_work,
      p_conf,
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
      appname_disp_en,
      appname_disp_ja,
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
