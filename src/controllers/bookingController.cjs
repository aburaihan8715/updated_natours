/*
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel.cjs');
const Booking = require('../models/bookingModel.cjs');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync.cjs');
const factory = require('./handlerFactory.cjs');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  // NOTE: As it is protected route, so user email will come from protect() function
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // 1 dolors=100 cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  // console.log(
  //   `${req.protocol}://${req.get('host')}/img/tours/${tour?.imageCover}`,
  // );

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // NOTE: This is only temporary, because it is UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
*/

const Tour = require('../models/tourModel.cjs');
const config = require('../config/index.cjs');
const catchAsync = require('../utils/catchAsync.cjs');
const Booking = require('../models/bookingModel.cjs');
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);

const Factory = require('../builder/Factory.cjs');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  // NOTE: As it is protected route, so user email will come from protect() function
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // 1 dolors=100 cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://i.ibb.co/ssCTmq5/6-4g-DCfx-M.jpg`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // console.log(
  //   `${req.protocol}://${req.get('host')}/img/tours/${tour?.imageCover}`,
  // );

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // NOTE: This is only temporary, because it is UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = Factory.createOne(Booking);
exports.getBooking = Factory.getOne(Booking);
exports.getAllBookings = Factory.getAll(Booking);
exports.updateBooking = Factory.updateOne(Booking);
exports.deleteBooking = Factory.deleteOne(Booking);
