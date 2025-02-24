const AppError = require('./appError.cjs');
const { status: httpStatus } = require('http-status');
const handleJWTError = () => {
  return new AppError(
    httpStatus.UNAUTHORIZED,
    'Invalid token. Please log in again!',
  );
};

module.exports = handleJWTError;
