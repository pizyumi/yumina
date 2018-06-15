var _ = require('underscore');

var path = require('path');

var p_entity = 'entity';
var p_data = 'data';
var p_sql = 'sql';
var p_create_sql = path.join(p_sql, 'create');
var p_drop_sql = path.join(p_sql, 'drop');
var p_insert_sql = path.join(p_sql, 'insert');
var p_delete_sql = path.join(p_sql, 'delete');

var obj = {};

obj = _.extend(obj, {
    p_entity, 
    p_data, 
    p_sql, 
    p_create_sql, 
    p_drop_sql, 
    p_insert_sql, 
    p_delete_sql
});

module.exports = obj;
