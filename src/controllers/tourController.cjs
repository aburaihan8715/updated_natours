/*
const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel.cjs');
const AppError = require('../utils/appError.cjs');
const catchAsync = require('../utils/catchAsync.cjs');
const factory = require('./handlerFactory.cjs');

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

// NOTE:
// 1) upload.single() for single image
// 2) upload.array() for multiple images
// 3) upload.fields() for single mixed images

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  // NOTE: body came form factory.updateOne() function
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});

// CREATE
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

// GET TOP 5 TOURS
exports.aliasTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.createTour = factory.createOne(Tour);

// GET TOURS STATS
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

// GET MONTHLY PLAN
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

// /tours-distance?distance=233,center=-40,45&unit=mi
// /tours-within/233/center/34.124693, -118.113807/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }
  // console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }
  // console.log(distance, lat, lng, unit);

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { data: distances },
  });
});
*/

const { status: httpStatus } = require('http-status');
const Tour = require('../models/tourModel.cjs');

const catchAsync = require('../utils/catchAsync.cjs');

const sendResponse = require('../utils/sendResponse.cjs');
const APIFeatures = require('../builder/ApiFeatures.cjs');
const AppError = require('../errors/appError.cjs');

const searchAbleFields = [
  'name',
  'difficulty',
  'summary',
  'description',
  'slug',
];

// route specific middleware
exports.getAliasTours = (req, res, next) => {
  req.query.limit = '6';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// controllers
// NOTE: raw query
// exports.getAllTours = async (req, res) => {
//   try {
//     const queryObj = { ...req.query };
//     let modelQuery = Tour.find();

//     // search
//     if (queryObj.searchTerm) {
//       const searchTermValue = queryObj.searchTerm;
//       modelQuery = modelQuery.find({
//         $or: ['name', 'difficulty', 'summary', 'description', 'slug'].map(
//           (field) => ({
//             [field]: { $regex: searchTermValue, $options: 'i' },
//           }),
//         ),
//       });
//     }

//     // filter
//     // 1. basic filter
//     let filterObj = { ...queryObj };
//     const excludeFields = [
//       'searchTerm',
//       'page',
//       'limit',
//       'fields',
//       'sort',
//     ];
//     excludeFields.forEach((item) => delete filterObj[item]);
//     // 2. advanced filter
//     const filterObjString = JSON.stringify(filterObj).replace(
//       /\b(lt|lte|gt|gte)\b/g,
//       (match) => `$${match}`,
//     );

//     filterObj = JSON.parse(filterObjString);

//     modelQuery = modelQuery.find(filterObj);

//     // sort
//     if (queryObj.sort) {
//       const sortObj = queryObj.sort.split(',').join(' ') || '-createdAt';
//       modelQuery = modelQuery.sort(sortObj);
//     }

//     // fields
//     if (queryObj.fields) {
//       const fieldsObj = queryObj.fields.split(',').join(' ') || '-__v';
//       modelQuery = modelQuery.select(fieldsObj);
//     }

//     // paginate
//     const paginateObj = { ...queryObj };
//     // const page = paginateObj.page * 1 || 1;
//     // const limit = paginateObj.limit * 1 || 5;

//     // it ensure no negative values
//     const page = Math.max(1, parseInt(paginateObj.page) || 1);
//     const limit = Math.max(1, parseInt(paginateObj.limit) || 10);
//     const skip = (page - 1) * limit;
//     modelQuery = modelQuery.skip(skip).limit(limit);

//     // calculate paginate
//     const finalFilter = modelQuery.getFilter();
//     const totalDocs = await modelQuery.model.countDocuments(finalFilter);
//     const totalPage = Math.ceil(totalDocs / limit);

//     // execute the query
//     const tours = await modelQuery;

//     res.status(status.OK).json({
//       status: 'success',
//       result: tours?.length || null,
//       message: 'Data fetched successfully!!',
//       meta: { page, limit, totalDocs, totalPage },
//       data: tours,
//     });
//   } catch (error) {
//     res.status(status.INTERNAL_SERVER_ERROR).json({
//       status: 'fail',
//       message: error.message || 'server error',
//     });
//   }
// };

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  if (!stats) {
    return next(
      new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to calculate tour stats!!',
      ),
    );
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Data created successfully!!',
    data: stats,
  });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  if (!plan) {
    return next(
      new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to calculate monthly plan!!',
      ),
    );
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Data created successfully!!',
    data: plan,
  });
});

// /tours-distance?distance=233,center=-40,45&unit=mi
// /tours-within/233/center/34.124693, -118.113807/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }
  // console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }
  // console.log(distance, lat, lng, unit);

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { data: distances },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const TourFeatures = new APIFeatures(
    Tour.find({ secretTour: { $ne: true } }),
    req.query,
  )
    .search(searchAbleFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  // execute the query
  const { page, limit, totalDocs, totalPage } =
    await TourFeatures.calculatePaginate();
  const tours = await TourFeatures.modelQuery;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Tours fetched successfully!',
    meta: { page, limit, totalDocs, totalPage },
    data: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(
      new AppError(httpStatus.NOT_FOUND, 'Tour not found with this ID'),
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Tour fetched successfully!',
    data: tour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const imageCover = req.files.imageCover[0].path;
  const images = req.files.images.map((image) => image.path);

  if (imageCover) req.body.imageCover = imageCover;
  if (images) req.body.images = images;

  const updatedTour = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!updatedTour) {
    return next(
      new AppError(httpStatus.NOT_FOUND, 'Tour not found with this ID'),
    );
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Data updated successfully!!',
    data: null,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour) {
    return next(
      new AppError(httpStatus.NOT_FOUND, 'Tour not found with this ID'),
    );
  }
  res.status(status.OK).json({
    status: 'success',
    message: 'Data deleted successfully!!',
    data: deletedTour,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  if (!newTour) {
    return next(
      new AppError(httpStatus.BAD_REQUEST, 'Failed to create data!!'),
    );
  }

  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Data created successfully!!',
    data: newTour,
  });
});
