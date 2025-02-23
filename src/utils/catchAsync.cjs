const catchAsync = (asyncCb) => {
  return (req, res, next) => {
    asyncCb(req, res, next).catch((err) => {
      next(err);
    });
  };
};

module.exports = catchAsync;
