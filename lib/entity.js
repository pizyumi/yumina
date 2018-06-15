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

            entities = await pi.map(await common.load_files_from_path(constant.p_entity), async (v) => await common.load_json_from_path(v));
        }
    }, 
    get_entities: () => {
        return entities;
    }
});

module.exports = obj;
