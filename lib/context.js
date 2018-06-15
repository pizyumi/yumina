var _ = require('underscore');

var path = require('path');

var common = require('./common');

var obj = {};

obj = _.extend(obj, {
    get_context: async (pconfig) => {
        var dconfig = await common.load_json_from_path(path.join(module.filename, '../../config/config.json'));
        var config = _.extend({}, dconfig, pconfig);

        var p_work = config.p_work;
        var p_entity = path.join(p_work, 'entity');
        var p_data = path.join(p_work, 'data');
        var p_sql = path.join(p_work, 'sql');
        var p_create_sql = path.join(p_sql, 'create');
        var p_drop_sql = path.join(p_sql, 'drop');
        var p_insert_sql = path.join(p_sql, 'insert');
        var p_delete_sql = path.join(p_sql, 'delete');

        return {
            p_work, 
            p_entity, 
            p_data, 
            p_sql, 
            p_create_sql, 
            p_drop_sql, 
            p_insert_sql, 
            p_delete_sql
        };
    }
});

module.exports = obj;
