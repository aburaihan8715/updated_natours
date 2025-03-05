const nodemailer = require('nodemailer');
const config = require('../config/index.cjs');

const sendEmail = async (to, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      user: 'aburaihan8715@gmail.com',
      pass: 'yfvbhverhvmxyhqn',
    },
  });

  await transporter.sendMail({
    from: 'raihan@gmail.com', // sender address
    to, // list of receivers
    subject: 'Reset your password within ten mins!', // Subject line
    text: '', // plain text body
    html, // html body
  });
};

module.exports = sendEmail;
