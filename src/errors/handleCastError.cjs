const AppError = require('./appError.cjs');
const { status: httpStatus } = require('http-status');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(httpStatus.BAD_REQUEST, message);
};

module.exports = handleCastError;
