/*
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel.cjs');
const catchAsync = require('../utils/catchAsync.cjs');
const AppError = require('../utils/appError.cjs');
const factory = require('./handlerFactory.cjs');

// NOTE: This for diskStorage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an image! Please upload only images.', 400),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

// NOTE: It is only for memory storage
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  //NOTE: Because of using memory storage we need to redefined filename here
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
*/

const { status: httpStatus } = require('http-status');

exports.getAllUsers = async (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Data fetched successfully!!',
    data: null,
  });
};

exports.getUser = async (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Data fetched successfully!!',
    data: null,
  });
};

exports.updateUser = async (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Data updated successfully!!',
    data: null,
  });
};

exports.deleteUser = async (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Data deleted successfully!!',
    data: null,
  });
};

exports.createUser = async (req, res) => {
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Data created successfully!!',
    data: null,
  });
};
