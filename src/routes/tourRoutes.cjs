/*
const express = require('express');

const tourController = require('../controllers/tourController.cjs');
const authController = require('../controllers/authController.cjs');
const reviewRouter = require('./reviewRoutes.cjs');

const router = express.Router();

// POST /tour/123/reviews
// GET /tour/123/reviews
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

// tours-within?distance=233,center=34.124693, -118.113807&unit=mi
// tours-within/233/center/34.124693, -118.113807/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
*/

const express = require('express');
const tourController = require('../controllers/tourController.cjs');
const auth = require('../middlewares/auth.cjs');
const { USER_ROLE } = require('../constants/index.cjs');

const tourRouter = express.Router();

tourRouter.get(
  '/top-six-tours',
  tourController.getAliasTours,
  tourController.getAllTours,
);

tourRouter.get('/tour-stats', tourController.tourStats);
tourRouter.get('/monthly-plan/:year', tourController.monthlyPlan);

tourRouter.get('/', auth(USER_ROLE.user), tourController.getAllTours);
tourRouter.post('/', tourController.createTour);
tourRouter.get('/:id', tourController.getTour);
tourRouter.patch('/:id', tourController.updateTour);
tourRouter.delete('/:id', tourController.deleteTour);

module.exports = tourRouter;
