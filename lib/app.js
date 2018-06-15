var _ = require('underscore');

var constant = require('./constant');
var common = require('./common');

var is_init = false;

var obj = {};

obj = _.extend(obj, {
    initialize: async () => {
        if (!is_init) {
            is_init = true;

            await common.create_folder_from_path(constant.p_sql);
            await common.create_folder_from_path(constant.p_create_sql);
            await common.create_folder_from_path(constant.p_drop_sql);
            await common.create_folder_from_path(constant.p_insert_sql);
            await common.create_folder_from_path(constant.p_delete_sql);
        }
    }
});

module.exports = obj;
