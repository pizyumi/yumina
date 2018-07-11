var _ = require('underscore');

module.exports = (common) => {
  return {
    auth_api: (req, res, next) => {
      next();
    },
    auth_web: (req, res, next) => {
      next();
    },
    list_id: async (req, entity, e, scommon) => {
      return {};
    },
    item_id: async (req, entity, e, scommon) => {
      var keys = await e.get_table_key_column_names(entity);

      return _.extend({}, _.object(keys, scommon.handle_ids_parameter(req)));
    },
    new_id: async (req, entity, e, scommon) => {
      return {};
    },
    update_id: async (req, entity, e, scommon) => {
      var keys = await e.get_table_key_column_names(entity);

      return _.extend({}, _.object(keys, scommon.handle_ids_parameter(req)));
    },
    delete_id: async (req, entity, e, scommon) => {
      var keys = await e.get_table_key_column_names(entity);

      return _.extend({}, _.object(keys, scommon.handle_ids_parameter(req)));
    },
    get_title: (con) => {
      return con.appname;
    }
  }
};
