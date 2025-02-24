const AppError = require('./appError.cjs');
const { status: httpStatus } = require('http-status');

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(httpStatus.BAD_REQUEST, message);
};

module.exports = handleValidationError;
