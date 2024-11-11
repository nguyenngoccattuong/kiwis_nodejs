const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SENDING_EMAIL_HOST,
  port: process.env.SENDING_EMAIL_PORT,
  secure: process.env.SENDING_EMAIL_SMTP_SECURE,
  auth: {
    user: process.env.SENDING_EMAIL_USER,
    pass: process.env.SENDING_EMAIL_PASSWORD,
  },
  tls: {
    ciphers:'SSLv3'
}
});

module.exports = transporter;
