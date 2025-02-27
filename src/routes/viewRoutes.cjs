// const express = require('express');
// const viewsController = require('../controllers/viewsController.cjs');
// const authController = require('../controllers/authController.cjs');
// const bookingController = require('../controllers/bookingController.cjs');

// const router = express.Router();

// router.get(
//   '/',
//   bookingController.createBookingCheckout,
//   authController.isLoggedIn,
//   viewsController.getOverview,
// );
// router.get(
//   '/tour/:slug',
//   authController.isLoggedIn,
//   viewsController.getTour,
// );
// router.get(
//   '/login',
//   authController.isLoggedIn,
//   viewsController.getLoginForm,
// );
// router.get('/me', authController.protect, viewsController.getAccount);
// router.get(
//   '/my-tours',
//   authController.protect,
//   viewsController.getMyTours,
// );

// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData,
// );

// module.exports = router;

const express = require('express');

const viewRouter = express.Router();
const viewController = require('../controllers/viewsController.cjs');

viewRouter.get('/', viewController.getOverview);
viewRouter.get('/tour/:slug', viewController.getTour);

module.exports = viewRouter;
