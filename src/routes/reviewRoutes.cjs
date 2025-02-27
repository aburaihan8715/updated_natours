/*
const express = require('express');

const reviewController = require('../controllers/reviewController.cjs');
const authController = require('../controllers/authController.cjs');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  );

module.exports = router;
*/

const express = require('express');

const reviewController = require('../controllers/reviewController.cjs');
const auth = require('../middlewares/auth.cjs');
const { USER_ROLE } = require('../constants/index.cjs');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(auth()); // bellow route are protected

reviewRouter.get('/', reviewController.getAllReviews);
reviewRouter.post(
  '/',
  auth(USER_ROLE.user),
  reviewController.setTourAndUserIds,
  reviewController.createReview,
);
reviewRouter.get('/:id', reviewController.getReview);
reviewRouter.patch(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  reviewController.updateReview,
);
reviewRouter.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  reviewController.deleteReview,
);

module.exports = reviewRouter;
