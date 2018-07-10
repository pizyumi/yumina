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
    }
  }
};
