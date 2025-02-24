const AppError = require('./appError.cjs');
const { status: httpStatus } = require('http-status');
const handleJWTExpiredError = () => {
  return new AppError(
    httpStatus.UNAUTHORIZED,
    'Your token has expired. Please log in again!',
  );
};

module.exports = handleJWTExpiredError;
