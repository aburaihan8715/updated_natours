const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const config = require('../config/index.cjs');
const User = require('../models/userModel.cjs');

// Only for rendered pages, no errors! (this for client side)
const checkLogin = async (req, res, next) => {
  if (req.cookies.accessToken) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.accessToken,
        config.JWT_ACCESS_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded._id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.isPasswordChangedAfterJwtIssued(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      console.error('Error while checking isLogged in!:', error);
      return next();
    }
  }
  next();
};

module.exports = checkLogin;
