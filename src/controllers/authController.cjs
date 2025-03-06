const AppError = require('../errors/appError.cjs');
const User = require('../models/userModel.cjs');
const catchAsync = require('../utils/catchAsync.cjs');

const { status: httpStatus } = require('http-status');
const jwtUtils = require('../utils/jwtUtils.cjs');
const config = require('../config/index.cjs');

const crypto = require('crypto');
const Email = require('../utils/emailV2.cjs');

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

  // NOTE: in cookies maxAge take number and expires take date we can use any one
  res.cookie('accessToken', accessToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    // maxAge: 1000 * 60 * 60 * 24 * 365,
    // sameSite: true,
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
    return next(
      new AppError(httpStatus.BAD_REQUEST, 'Failed to create a new user!'),
    );
  }

  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

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

exports.logout = (req, res) => {
  res.cookie('accessToken', null, {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

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

    await new Email(user, resetURL).sendPasswordReset();

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
