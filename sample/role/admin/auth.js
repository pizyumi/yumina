module.exports = (common) => {
  return {
    auth_api: (req, res, next) => {
      if (req.user === undefined) {
        throw { status: 401 };
      }
      else if (req.user.user_id !== 1) {
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
      else if (req.user.user_id !== 1) {
        throw { status: 401 };
      }
      else {
        next();
      }
    }
  }
};
