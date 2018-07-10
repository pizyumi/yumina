var _ = require('underscore');

module.exports = (common) => {
  return {
    auth_api: (req, res, next) => {
      if (req.user === undefined) {
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
      else {
        next();
      }
    },
    list_id: async (req, entity, e, scommon) => {
      if (entity.name === 'user') {
        return { id: req.user.id };
      }
      else {
        return { user_id: req.user.id };
      }
    },
    item_id: async (req, entity, e, scommon) => {
      var keys = await e.get_table_key_column_names(entity);

      if (entity.name === 'user') {
        return _.extend({ id: req.user.id }, _.object(_(keys).rest(1), scommon.handle_ids_parameter(req)));
      }
      else {
        return _.extend({ user_id: req.user.id }, _.object(_(keys).rest(1), scommon.handle_ids_parameter(req)));
      }
    },
    new_id: async (req, entity, e, scommon) => {
      if (entity.name === 'user') {
        return { id: req.user.id };
      }
      else {
        return { user_id: req.user.id };
      }
    },
    update_id: async (req, entity, e, scommon) => {
      var keys = await e.get_table_key_column_names(entity);

      if (entity.name === 'user') {
        return _.extend({ id: req.user.id }, _.object(_(keys).rest(1), scommon.handle_ids_parameter(req)));
      }
      else {
        return _.extend({ user_id: req.user.id }, _.object(_(keys).rest(1), scommon.handle_ids_parameter(req)));
      }
    },
    delete_id: async (req, entity, e, scommon) => {
      var keys = await e.get_table_key_column_names(entity);

      if (entity.name === 'user') {
        return _.extend({ id: req.user.id }, _.object(_(keys).rest(1), scommon.handle_ids_parameter(req)));
      }
      else {
        return _.extend({ user_id: req.user.id }, _.object(_(keys).rest(1), scommon.handle_ids_parameter(req)));
      }
    }
  }
};
