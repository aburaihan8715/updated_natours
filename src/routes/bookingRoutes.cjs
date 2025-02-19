const express = require('express');
const bookingController = require('../controllers/bookingController.cjs');
const authController = require('../controllers/authController.cjs');

const router = express.Router();

// All routes are protected after this middleware
router.use(authController.protect);

router.get(
  '/checkout-session/:tourId',
  bookingController.getCheckoutSession,
);

// All routes are restricted to (admin and lead-guide) after this middleware
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
