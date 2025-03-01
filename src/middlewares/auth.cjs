const catchAsync = require('../utils/catchAsync.cjs');
const AppError = require('../errors/appError.cjs');
const { status: httpStatus } = require('http-status');
const jwtUtils = require('../utils/jwtUtils.cjs');
const config = require('../config/index.cjs');
const User = require('../models/userModel.cjs');
const auth = (...roles) => {
  return catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(
        new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!'),
      );
    }
    const decoded = await jwtUtils.verifyToken(
      token,
      config.JWT_ACCESS_SECRET,
    );

    const { role, _id, iat } = decoded;

    // checking if the user is exist
    const user = await User.findById(_id);
    if (!user) {
      return next(
        new AppError(
          httpStatus.NOT_FOUND,
          'The user belonging to this token does no longer exist !',
        ),
      );
    }

    const isPasswordChangedAfterJwtIssued =
      user.isPasswordChangedAfterJwtIssued(iat);
    if (isPasswordChangedAfterJwtIssued) {
      return next(
        new AppError(
          httpStatus.UNAUTHORIZED,
          'User recently changed password! Please login again!',
        ),
      );
    }

    if (roles.length > 0 && !roles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You have no permission to access this route!',
      );
    }

    req.user = decoded;
    next();
  });
};

module.exports = auth;
