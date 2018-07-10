var _ = require('underscore');

var common = require('./common');
var context = require('./context');

var obj = {};

obj = _.extend(obj, {
  initialize: async (conf, env) => {
    var con = await context.get_context(conf, env);

    await common.create_folder_from_path(con.p_entity);
    await common.create_folder_from_path(con.p_data);
    await common.create_folder_from_path(con.p_sql);
    await common.create_folder_from_path(con.p_create_sql);
    await common.create_folder_from_path(con.p_drop_sql);
    await common.create_folder_from_path(con.p_insert_sql);
    await common.create_folder_from_path(con.p_delete_sql);

    await common.create_folder_from_path(con.p_public);

    return con;
  }
});

module.exports = obj;
