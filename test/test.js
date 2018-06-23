var _ = require('underscore');
var chai = require('chai');
var colors = require('colors');
var pi = require('p-iteration');

var path = require('path');

var app = require('../lib/app');
var common = require('../lib/common');
var entity = require('../lib/entity');

var e = null;

module.exports = {
  before: async () => {
    var con = await app.initialize({});

    e = await entity(con);
  },
  'sql': async () => {
    await pi.forEach(_.values(e.get_entities()), async (v) => {
      await check_sql('create', v);
      await check_sql('drop', v);
      await check_sql('insert', v, await e.get_data(v.name));
      await check_sql('delete', v);
    });
  }
};

async function check_sql (type, entity, data) {
  var sql1 = await e[`generate_${type}_sql`](entity, data);
  var sql2 = await common.load_text_from_path(path.join(path.dirname(module.filename), 'sql', type, entity.name + '.sql'));

  console.log(sql1.yellow);
  console.log(sql2.yellow);

  chai.assert.equal(sql1, sql2);
}
