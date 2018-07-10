module.exports = (common) => {
  return {
    auth_api: (req, res, next) => {
      next();
    },
    auth_web: (req, res, next) => {
      next();
    }
  }
};
