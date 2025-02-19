/* eslint-disable no-undef */
const mongoose = require('mongoose');

// UNCAUGHT EXCEPTION
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const config = require('./config/index.cjs');
const app = require('./app.cjs');

mongoose
  .connect(config.DATABASE_URL, {})
  .then(() => console.log(`DB connected successful!`));

const server = app.listen(config.PORT, () => {
  console.log(`Server is running at http://localhost:${config.PORT}`);
});

// UNHANDLED REJECTIONS
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
