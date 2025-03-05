/* eslint-disable no-undef */
const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.form = `Raihan <raihan@gmail.com>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      // NOTE: secure true or false depending on port (587 need false and 465 need true)
      // secure: config.NODE_ENV === 'production',
      auth: {
        user: 'aburaihan8715@gmail.com',
        pass: 'yfvbhverhvmxyhqn',
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    // 2) Define email options
    const mailOptions = {
      from: this.form,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for minutes)!',
    );
  }
};
