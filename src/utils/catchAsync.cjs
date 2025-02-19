module.exports = (asyncCb) => {
  return (req, res, next) => {
    asyncCb(req, res, next).catch((err) => {
      // console.log('========from catchAsync==========', err);
      next(err);
    });
    // asyncCb(req, res, next).catch(next);
  };
};
