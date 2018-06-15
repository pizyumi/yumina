var _ = require('underscore');
var pi = require('p-iteration');

var constant = require('./constant');
var common = require('./common');

var is_init = false;

var entities = null;

var obj = {};

obj = _.extend(obj, {
    initialize: async () => {
        if (!is_init) {
            is_init = true;

            entities = _.object(await pi.map(await common.load_files_from_path(constant.p_entity), async (v) => {
                var json = await common.load_json_from_path(v);

                return [json.name, json];
            }));
        }
    }, 
    get_entities: () => {
        return entities;
    }
});

module.exports = obj;
