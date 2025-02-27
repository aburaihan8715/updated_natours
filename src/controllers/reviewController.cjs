const Review = require('../models/reviewModel.cjs');
const Factory = require('../builder/Factory.cjs');

exports.setTourAndUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createReview = Factory.createOne(Review);
exports.getAllReviews = Factory.getAll(Review);
exports.getReview = Factory.getOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.deleteReview = Factory.deleteOne(Review);
