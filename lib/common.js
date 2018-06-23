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
  execute_sql: async (db, sql) => {
    console.log(sql.yellow);

    await db.query(sql);
  }
});

module.exports = obj;
