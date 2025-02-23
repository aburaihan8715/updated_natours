const jwt = require('jsonwebtoken');
const AppError = require('../errors/appError.cjs');
const { status: httpStatus } = require('http-status');

exports.createToken = (jwtPayload, secret, expiresIn) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

exports.verifyToken = async (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.log('Error during verify token: ' + error);
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorize');
  }
};
