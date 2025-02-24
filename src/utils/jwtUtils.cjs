const jwt = require('jsonwebtoken');

const { promisify } = require('util');

exports.createToken = (jwtPayload, secret, expiresIn) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

// exports.verifyToken = async (token, secret) => {
//   try {
//     return await promisify(jwt.verify)(token, secret);
//   } catch (error) {
//     console.log('Error during verify token: ' + error);
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token!');
//   }
// };

// NOTE: If we want to handle jwt errors globally, we should not use try/catch here
exports.verifyToken = async (token, secret) => {
  return promisify(jwt.verify)(token, secret);
};
