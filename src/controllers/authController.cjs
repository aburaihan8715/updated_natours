/*
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel.cjs');
const catchAsync = require('../utils/catchAsync.cjs');
const AppError = require('../utils/appError.cjs');
const Email = require('../utils/email.cjs');

// create jwt token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// cookie options
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  ),
  httpOnly: true,
};

// create send token function
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // set secure for only production
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // call cookie for setting cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  // });

  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  // const correct = await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) if everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access',
        401,
      ),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401,
      ),
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please login again.',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors! (this for client side)
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to preform this action',
          403,
        ),
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with this email address.', 404),
    );
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Tyr again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

*/

const AppError = require('../errors/appError.cjs');
const User = require('../models/userModel.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const { status: httpStatus } = require('http-status');
const jwtUtils = require('../utils/jwtUtils.cjs');
const config = require('../config/index.cjs');
const sendEmail = require('../utils/email.cjs');
const crypto = require('crypto');

const createAndSendToken = (user, statusCode, res) => {
  const jwtPayload = {
    _id: user._id,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET,
    config.JWT_ACCESS_EXPIRES_IN,
  );

  res.cookie('accessToken', accessToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  res.status(statusCode).json({
    status: 'success',
    data: {
      accessToken,
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  if (!newUser) {
    next(
      new AppError(httpStatus.BAD_REQUEST, 'Failed to create a new user!'),
    );
  }

  createAndSendToken(newUser, httpStatus.CREATED, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError(
        httpStatus.BAD_REQUEST,
        'Please provide email and password',
      ),
    );
  }

  const user = await User.getUserByEmail(email);

  if (!user) {
    return next(
      new AppError(
        httpStatus.BAD_REQUEST,
        'User not found with this email!',
      ),
    );
  }

  const isPasswordCorrect = await User.isPasswordCorrect(
    password,
    user?.password,
  );

  if (!isPasswordCorrect) {
    return next(
      new AppError(httpStatus.BAD_REQUEST, 'Wrong credentials!!'),
    );
  }
  createAndSendToken(user, httpStatus.OK, res);
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.getUserByEmail(req.body.email);

  if (!user) {
    return next(
      new AppError(
        httpStatus.NOT_FOUND,
        'There is no user with this email address.',
      ),
    );
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/reset-password/${resetToken}`;

    await sendEmail(user.email, resetURL);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    console.log('Error during send email: ' + error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'There was an error sending the email. Tyr again later!',
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(
        httpStatus.NOT_FOUND,
        'Token is invalid or has expired.',
      ),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createAndSendToken(user, httpStatus.OK, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  const isPasswordCorrect = await User.isPasswordCorrect(
    req.body.passwordCurrent, // means old password
    user.password,
  );

  if (!isPasswordCorrect) {
    return next(
      new AppError(httpStatus.BAD_REQUEST, 'Wrong credentials!!'),
    );
  }

  user.password = req.body.password; // means new password
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, httpStatus.OK, res);
});
