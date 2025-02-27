const AppError = require('../errors/appError.cjs');
const catchAsync = require('../utils/catchAsync.cjs');
const APIFeatures = require('./ApiFeatures.cjs');

const { status: httpStatus } = require('http-status');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          httpStatus.NOT_FOUND,
          'No document found with this ID!',
        ),
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(
          httpStatus.NOT_FOUND,
          'No document found with this ID',
        ),
      );
    }
    // console.log(doc);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let modelQuery = Model.findById(req.params.id);
    if (popOptions) modelQuery = modelQuery.populate(popOptions);
    const doc = await modelQuery;

    if (!doc) {
      return next(
        new AppError(
          httpStatus.NOT_FOUND,
          'No document found with this ID',
        ),
      );
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model, searchAbleFields = []) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour(hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const Features = new APIFeatures(Model.find(filter), req.query)
      .search(searchAbleFields) // we can add any field
      .filter()
      .sort()
      .fields()
      .paginate();
    // for checking index performance
    // const doc = await features.query.explain();
    const doc = await Features.modelQuery;
    const { page, limit, totalDocs, totalPage } =
      await Features.calculatePaginate();

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc?.length,
      meta: { page, limit, totalDocs, totalPage },
      data: doc,
    });
  });
