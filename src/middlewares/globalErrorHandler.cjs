const { status: httpStatus } = require('http-status');
const config = require('../config/index.cjs');
const handleDuplicateError = require('../errors/handleDuplicateError.cjs');
const handleCastError = require('../errors/handleCastError.cjs');
const handleValidationError = require('../errors/handleValidationError.cjs');
const handleJWTError = require('../errors/handleJwtError.cjs');
const handleJWTExpiredError = require('../errors/handleJwtExpiredError.cjs');

const globalErrorHandler = (err, req, res, next) => {
  if (err?.code === 11000) err = handleDuplicateError(err);
  if (err.name === 'CastError') err = handleCastError(err);
  if (err.name === 'ValidationError') err = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  // backend error(start with api)
  if (req.originalUrl.startsWith('/api')) {
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
  }

  // frontend error (not start with /api)
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  } else {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.',
    });
  }
};

module.exports = globalErrorHandler;
