/* eslint-disable no-undef */

/*
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController.cjs');
const tourRouter = require('./routes/tourRoutes.cjs');
const userRouter = require('./routes/userRoutes.cjs');
const reviewRouter = require('./routes/reviewRoutes.cjs');
const bookingRouter = require('./routes/bookingRoutes.cjs');
const viewRouter = require('./routes/viewRoutes.cjs');
const AppError = require('./utils/appError.cjs');

// Start express app
const app = express();

// app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

app.use(cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

*/
const express = require('express');
const { status: httpStatus } = require('http-status');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');

const userRouter = require('./routes/userRoutes.cjs');
const bookingRouter = require('./routes/bookingRoutes.cjs');
const reviewRouter = require('./routes/reviewRoutes.cjs');
const tourRouter = require('./routes/tourRoutes.cjs');
const globalErrorHandler = require('./middlewares/globalErrorHandler.cjs');
const AppError = require('./errors/appError.cjs');
const viewRouter = require('./routes/viewRoutes.cjs');
const cookieParser = require('cookie-parser');

const app = express();

// set view engine and view path
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// add some headers properties for security
app.use(helmet());

// parse req.body for access body data to the express server
app.use(express.json());
// cookie parser
app.use(cookieParser());

// allow access to static files
app.use(express.static(path.join(__dirname, '../public')));

// limit requests
app.use(
  ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later!',
  }),
);

// development logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// NOTE: this is middleware position matter
// prevent nosql query injection
app.use(mongoSanitize());

// unformat html code
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://unpkg.com https://cdnjs.cloudflare.com",
  );
  next();
});
// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// test route
app.get('/test', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Hello, From server!!',
  });
});

// view route
app.use('/', viewRouter);

// api routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/tours', tourRouter);

// not found route
app.use('*', (req, res, next) => {
  next(
    new AppError(
      httpStatus.NOT_FOUND,
      `Can't find ${req.originalUrl} on this server!`,
    ),
  );
});

// catch all errors
app.use(globalErrorHandler);

module.exports = app;
