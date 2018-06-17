var _ = require('underscore');
var bluebird = require('bluebird');
var fsextra = bluebird.promisifyAll(require('fs-extra'));
var stripbom = require('strip-bom');

var fs = bluebird.promisifyAll(require('fs'));
var path = require('path');

var obj = {};

obj = _.extend(obj, {
  load_json_from_path: async (p) => {
    return JSON.parse(stripbom(await fs.readFileAsync(p, 'utf-8')));
  },
  load_files_from_path: async (p) => {
    var files = [];
    var ps = await fs.readdirAsync(p);
    for (var i = 0; i < ps.length; i++) {
      var p2 = path.join(p, ps[i]);
      if ((await fs.statAsync(p2)).isFile()) {
        files.push(p2);
      }
    }
    return files;
  },
  save_text_to_path: async (p, text) => {
    await fsextra.mkdirsAsync(path.dirname(p));
    await fs.writeFileAsync(p, text, 'utf-8');
  },
  create_folder_from_path: async (p) => {
    await fsextra.mkdirsAsync(p);
  }
});

module.exports = obj;
