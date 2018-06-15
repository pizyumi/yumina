var _ = require('underscore');
var colors = require('colors');
var pi = require('p-iteration');

var path = require('path');

var common = require('./common');

var entities = {};
var custom = {};

var obj = {};

obj = _.extend(obj, {
    get_entities: () => {
        return entities;
    }, 
    get_table_name: (name) => {
        if (custom[name] && custom[name].get_table_name) {
            return custom[name].get_table_name();
        }
        else {
            return 't_' + name;
        }
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
    var files = await common.load_files_from_path(context.p_entity);
    for (var i = 0; i < files.length; i++) {
        var ext = path.extname(files[i]);
        var name = path.basename(files[i], ext);
        if (ext === '.json') {
            entities[name] = await common.load_json_from_path(files[i]);
        }
        else if (ext === '.js') {
            custom[name] = await require(files[i])();
        }
        else {
            console.log(files[i].red);
        }
    }

    return obj;
};
