const express = require('express');
const bookingController = require('../controllers/bookingController.cjs');
const auth = require('../middlewares/auth.cjs');

const bookingRouter = express.Router();

// All routes are protected after this middleware
bookingRouter.use(auth());

bookingRouter.get(
  '/checkout-session/:tourId',
  auth(),
  bookingController.getCheckoutSession,
);

// All routes are restricted to (admin and lead-guide) after this middleware
bookingRouter.use(auth('admin', 'lead-guide'));

bookingRouter
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

bookingRouter
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = bookingRouter;
