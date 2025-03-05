const parseFormString = () => {
  return async (req, res, next) => {
    try {
      if (req.body?.data) {
        req.body = await JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = parseFormString;
