var _ = require('underscore');
var pi = require('p-iteration');

var path = require('path');

var common = require('./common');
var context = require('./context');

var obj = {};

obj = _.extend(obj, {
  initialize: async (conf, env, p_conf) => {
    var con = await context.get_context(conf, env, p_conf);

    await common.create_folder_from_path(con.p_entity);
    await common.create_folder_from_path(con.p_data);
    await common.create_folder_from_path(con.p_role);
    await common.create_folder_from_path(con.p_asset);
    await common.create_folder_from_path(con.p_asset_js);
    await common.create_folder_from_path(con.p_asset_css);
    await common.create_folder_from_path(con.p_sql);
    await common.create_folder_from_path(con.p_create_sql);
    await common.create_folder_from_path(con.p_drop_sql);
    await common.create_folder_from_path(con.p_insert_sql);
    await common.create_folder_from_path(con.p_delete_sql);

    await common.create_folder_from_path(con.p_public);

    var p_js_sys = [
      'asset\\lib\\jquery-3.2.1\\jquery-3.2.1.min.js',
      'asset\\lib\\popper-1.0.1\\popper.min.js',
      'asset\\lib\\bootstrap-4.0.0\\js\\bootstrap.min.js',
      'asset\\lib\\vue-2.5.13\\vue.min.js',
      'asset\\lib\\axios-0.17.1\\axios.min.js',
      'asset\\lib\\underscore-1.8.3\\underscore-min.js',
      'asset\\lib\\moment-2.21.0\\moment.js'
    ];
    var p_js = _.union(p_js_sys, con.p_js);
    var p_libjs = path.join(con.p_asset_js, 'lib.js');

    var libjs = (await pi.mapSeries(p_js, async (v) => await common.load_text_from_path(v))).join('\n');

    await common.save_text_to_path(p_libjs, libjs);

    var p_css_sys = [
      'asset\\lib\\bootstrap-4.0.0\\css\\bootstrap.min.css',
      'front\\main.css'
    ];
    var p_css = _.union(p_css_sys, con.p_css);
    var p_libcss = path.join(con.p_asset_css, 'lib.css');

    var libcss = (await pi.mapSeries(p_css, async (v) => await common.load_text_from_path(v))).join('\n');

    await common.save_text_to_path(p_libcss, libcss);

    return con;
  }
});

module.exports = obj;
