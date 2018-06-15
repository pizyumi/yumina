var _ = require('underscore');

var common = require('./common');

var obj = {};

obj = _.extend(obj, {
    initialize: async (context) => {
        await common.create_folder_from_path(context.p_sql);
        await common.create_folder_from_path(context.p_create_sql);
        await common.create_folder_from_path(context.p_drop_sql);
        await common.create_folder_from_path(context.p_insert_sql);
        await common.create_folder_from_path(context.p_delete_sql);
    }
});

module.exports = obj;
