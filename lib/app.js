var _ = require('underscore');
var ejs = require('ejs');
var i18n = require('i18n');
var pi = require('p-iteration');

var path = require('path');

var common = require('./common');
var context = require('./context');

var obj = {};

obj = _.extend(obj, {
  initialize: async (env, p_work, p_yumina) => {
    var con = await context.get_context(env, p_work, p_yumina);

    await common.create_folder_from_path(con.p_locales);
    await common.create_folder_from_path(con.p_entity);
    await common.create_folder_from_path(con.p_data);
    await common.create_folder_from_path(con.p_role);
    await common.create_folder_from_path(con.p_asset);
    await common.create_folder_from_path(con.p_design);
    await common.create_folder_from_path(con.p_asset_js);
    await common.create_folder_from_path(con.p_asset_css);
    await common.create_folder_from_path(con.p_sql);
    await common.create_folder_from_path(con.p_create_sql);
    await common.create_folder_from_path(con.p_drop_sql);
    await common.create_folder_from_path(con.p_insert_sql);
    await common.create_folder_from_path(con.p_delete_sql);

    i18n.configure({
        directory: con.p_ylocales,
        updateFiles: false,
        objectNotation: true
    });

    var files = await common.load_files_from_path(con.p_locales);
    await pi.forEachSeries(files, async (v) => {
      var lang = path.basename(v, path.extname(v));
      var ldata = await common.load_json_from_path(v);

      var sdata = i18n.getCatalog(lang);
      sdata.back = _.extend({}, sdata.back, ldata.back);
      sdata.front = _.extend({}, sdata.front, ldata.front);
    });

    return con;
  },
  compile: async (con, e, r) => {
    await compile_libjs(con);
    await compile_libcss(con);

    var p = path.join(con.p_front, 'page');
    var folders = await common.load_folders_from_path(p);
    await pi.forEachSeries(folders, async (v) => {
      var pname = path.basename(v);

      await compile_page(con, e, r, p, pname);
    });

    await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
      var ename = v.name;
      var p_base =e.get_entity_path(ename);

      await compile_list(con, e, r, p_base, ename);
      await compile_item(con, e, r, p_base, ename);
    });
  }
});

module.exports = obj;

async function compile_libjs (con) {
  var p_js_sys = [
    'jquery-3.2.1\\jquery-3.2.1.min.js',
    'popper-1.0.1\\popper.min.js',
    'bootstrap-4.0.0\\js\\bootstrap.min.js',
    'vue-2.5.13\\vue.min.js',
    'axios-0.17.1\\axios.min.js',
    'underscore-1.8.3\\underscore-min.js',
    'moment-2.21.0\\moment.js'
  ];
  var p_in = _.union(_(p_js_sys).map((v) => path.join(con.p_yasset, v)), con.p_js);
  var p_out = path.join(con.p_asset_js, 'lib.js');

  await compile(p_in, p_out);
}

async function compile_libcss (con) {
  var p_css_sys = [
    'bootstrap-4.0.0\\css\\bootstrap.min.css'
  ];
  var p_css_yumina = [
    'main.css'
  ];
  var p_in = _.union(_(p_css_sys).map((v) => path.join(con.p_yasset, v)), _(p_css_yumina).map((v) => path.join(con.p_front, v)), con.p_css);
  var p_out = path.join(con.p_asset_css, 'lib.css');

  await compile(p_in, p_out);
}

async function create_menu (e, r, p_menu) {
  var menu = {};
  await pi.forEachSeries(_.values(r.get_roles()), async (v) => {
    var role = v;

    if (role.auto_generate_web) {
      var rname = role.name;
      var rurl = role.web;

      var items = [{
        name: 'home',
        disp_en: 'home',
        disp_ja: 'ホーム',
        url: rurl + 'index'
      }];
      await pi.forEachSeries(_.values(e.get_entities()), async (v) => {
        var entity = v;
        var name = entity.name;
        var pname = common.get_plural(name);
        var auth = entity.auth;

        if (auth.list.includes(rname)) {
          items.push({
            name: pname,
            disp_en: pname,
            disp_ja: pname,
            url: rurl + pname
          });
        }
      });

      menu[rname] = items;
    }
  });

  var js = ejs.render('var <%- vname %> = <%- JSON.stringify(value) %>;', { vname: 'menu', value: menu });

  await common.save_text_to_path(p_menu, js);
}

async function compile_page (con, e, r, p_base, pname) {
  var p_menu = path.join(con.p_design, 'menu.js');
  var p_main = path.join(con.p_front, 'main.js');
  var p_page = path.join(p_base, pname, 'page.js');

  if (!(await common.check_path(p_menu))) {
    p_menu = path.join(con.p_asset_js, 'menu.js');

    await create_menu(e, r, p_menu);
  }

  var p_in = [
    p_menu,
    p_main,
    p_page
  ];
  var p_out = path.join(con.p_asset_js, pname + '.js');

  await compile(p_in, p_out);
}

async function compile_list (con, e, r, p_base, ename) {
  var ptype = 'list';

  var p_menu = path.join(con.p_design, 'menu.js');
  var p_main = path.join(con.p_front, 'main.js');
  var p_list = path.join(con.p_front, 'component', 'list.js');
  var p_logic = path.join(p_base, 'logic.js');
  var p_page = path.join(p_base, ptype, 'page.js');

  if (!(await common.check_path(p_menu))) {
    p_menu = path.join(con.p_asset_js, 'menu.js');

    await create_menu(e, r, p_menu);
  }
  if (!(await common.check_path(p_page))) {
    p_page = path.join(con.p_front, 'type', ptype, 'page.js');
  }

  var p_in = [
    p_menu,
    p_main,
    p_list,
    p_logic,
    p_page
  ];
  var p_out = path.join(con.p_asset_js, ename + '-' + ptype + '.js');

  await compile(p_in, p_out);
}

async function compile_item (con, e, r, p_base, ename) {
  var ptype = 'item';

  var p_menu = path.join(con.p_design, 'menu.js');
  var p_main = path.join(con.p_front, 'main.js');
  var p_entity = path.join(con.p_front, 'component', 'entity.js');
  var p_form_item = path.join(con.p_front, 'component', 'form-item.js');
  var p_logic = path.join(p_base, 'logic.js');
  var p_page = path.join(p_base, ptype, 'page.js');

  if (!(await common.check_path(p_menu))) {
    p_menu = path.join(con.p_asset_js, 'menu.js');

    await create_menu(e, r, p_menu);
  }
  if (!(await common.check_path(p_page))) {
    p_page = path.join(con.p_front, 'type', ptype, 'page.js');
  }

  var logic = require(path.join(process.cwd(), p_logic));

  var p_component = _.uniq(_(logic.item_schema).map((v) => {
    if (v.type === 'text') {
      return path.join(con.p_front, 'component', 'input-text.js');
    }
    else {
      throw new Error('not supported type.');
    }
  }));

  var p_basic = [
    p_menu,
    p_main,
    p_entity,
    p_form_item,
    p_logic,
    p_page
  ];
  var p_in = _.union(p_component, p_basic);
  var p_out = path.join(con.p_asset_js, ename + '-' + ptype + '.js');

  await compile(p_in, p_out);
}

async function compile (p_in, p_out) {
  var compiled = (await pi.mapSeries(p_in, async (v) => await common.load_text_from_path(v))).join('\n');
  await common.save_text_to_path(p_out, compiled);
}
