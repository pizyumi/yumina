var _ = require('underscore');
var pi = require('p-iteration');

var common = require('./common');

var entities = null;

var obj = {};

obj = _.extend(obj, {
    get_entities: () => {
        return entities;
    }, 
    get_table_name: (name) => {
        return 't_' + name;
    }, 
    generate_create_sql: (entity) => {
        var tname = obj.get_table_name(entity.name);

        var columns = _(entity.schema).map((v) => {
            var cname = v.name;
            var type = '';


            `\n  ${v.name} ${v.type}` + (v.null ? '' : ' not null')
        }).join(', ');
    }
});

module.exports = async (context) => {
    entities = _.object(await pi.map(await common.load_files_from_path(context.p_entity), async (v) => {
        var json = await common.load_json_from_path(v);

        return [json.name, json];
    }));

    return obj;
};
