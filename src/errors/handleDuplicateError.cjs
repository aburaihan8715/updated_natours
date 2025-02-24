const AppError = require('./appError.cjs');
const { status: httpStatus } = require('http-status');

const handleDuplicateError = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(httpStatus.BAD_REQUEST, message);
};

module.exports = handleDuplicateError;
