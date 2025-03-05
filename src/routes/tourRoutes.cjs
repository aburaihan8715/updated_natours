const express = require('express');
const tourController = require('../controllers/tourController.cjs');
const reviewRouter = require('./reviewRoutes.cjs');
const auth = require('../middlewares/auth.cjs');
const tourFileUpload = require('../middlewares/tourFileUpload.cjs');
const parseFormString = require('../middlewares/parseFormString.cjs');

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.get(
  '/top-six-tours',
  tourController.getAliasTours,
  tourController.getAllTours,
);

tourRouter.get('/tour-stats', tourController.tourStats);
tourRouter.get('/monthly-plan/:year', tourController.monthlyPlan);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

tourRouter.get('/', tourController.getAllTours);
tourRouter.post('/', tourController.createTour);
tourRouter.get('/:id', tourController.getTour);
tourRouter.patch(
  '/:id',
  auth(),
  tourFileUpload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]),
  parseFormString(),
  tourController.updateTour,
);
tourRouter.delete('/:id', tourController.deleteTour);

module.exports = tourRouter;
