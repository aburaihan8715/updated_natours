// /* eslint-disable no-undef */
// const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');

// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(' ')[0];
//     this.url = url;
//     this.form = `Raihan <${process.env.EMAIL_FROM}>`;
//   }

//   newTransport() {
//     if (process.env.NODE_ENV === 'production') {
//       // Sendgrid
//       // NOTE: sendgrid does not support in bangladesh so try another service
//       return 1;
//     }

//     return nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });
//   }

//   // Send the actual email
//   async send(template, subject) {
//     // 1) Render HTML based on the pug template
//     const html = pug.renderFile(
//       `${__dirname}/../views/email/${template}.pug`,
//       {
//         firstName: this.firstName,
//         url: this.url,
//         subject,
//       },
//     );

//     // 2) Define email options
//     const mailOptions = {
//       from: this.form,
//       to: this.to,
//       subject,
//       html,
//       text: htmlToText.fromString(html),
//     };

//     // 3) Create a transport and send email
//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendWelcome() {
//     await this.send('Welcome', 'Welcome to the Natours Family!');
//   }

//   async sendPasswordReset() {
//     await this.send(
//       'passwordReset',
//       'Your password reset token (valid for minutes)!',
//     );
//   }
// };

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
