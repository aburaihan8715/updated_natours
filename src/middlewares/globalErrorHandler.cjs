const { status: httpStatus } = require('http-status');
const config = require('../config/index.cjs');
const AppError = require('../errors/AppError.cjs');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(httpStatus.BAD_REQUEST, message);
};

const handleDuplicateError = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(httpStatus.BAD_REQUEST, message);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(httpStatus.BAD_REQUEST, message);
};

// const handleJWTError = () => {
//   console.log('jwt error');
// };

// const handleJWTExpiredError = () => {
//   console.log('jwt expired error');
// };

const globalErrorHandler = (err, req, res, next) => {
  if (err?.code === 11000) err = handleDuplicateError(err);
  if (err.name === 'CastError') err = handleCastError(err);
  if (err.name === 'ValidationError') err = handleValidationError(err);

  if (err.isOperational) {
    console.error('ERROR 💥', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: config.NODE_ENV === 'development' ? err : null,
      stack: config.NODE_ENV === 'development' ? err.stack : null,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went wrong!!',
      err: config.NODE_ENV === 'development' ? err : null,
      stack: config.NODE_ENV === 'development' ? err.stack : null,
    });
  }
};

module.exports = globalErrorHandler;
