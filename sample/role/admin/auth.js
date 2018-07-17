var _ = require('underscore');

module.exports = (common) => {
  return {
    auth_api: (req, res, next) => {
      if (req.user === undefined) {
        throw { status: 401 };
      }
      else if (req.user.id !== 1) {
        throw { status: 401 };
      }
      else {
        next();
      }
    },
    auth_web: (req, res, next) => {
      if (req.user === undefined) {
        res.redirect('/login');
      }
      else if (req.user.id !== 1) {
        throw { status: 401 };
      }
      else {
        next();
      }
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
    get_title: (req, con) => {
      return con['appname_disp_' + req.getLocale()] + ' ' + req.__('back.admin');
    }
  }
};
