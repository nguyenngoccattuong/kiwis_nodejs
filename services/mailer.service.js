class MailerService {
  constructor() {
    this.nodemailer = require("nodemailer");
  }

  /**
   * Send email
   * @param {*} to
   * @param {*} subject
   * @param {*} text
   * @returns {Promise<void>}
   */
  async sendEmail(to, subject, text) {
    const transporter = require("../configs/mailer.config");
    const mailOptions = {
      from: process.env.SENDING_EMAIL_USER,
      to,
      subject,
      text,
    };
  }

  /**
   * Send email with attachment
   * @param {*} to
   * @param {*} subject
   * @param {*} text
   * @param {*} attachment
   * @returns {Promise<void>}
   */
  async sendEmailWithAttachment(to, subject, text, attachment) {
    const transporter = require("../configs/mailer.config");
    const mailOptions = {
      from: process.env.SENDING_EMAIL_USER,
      to,
      subject,
      text,
      attachment,
    };
  }
}

module.exports = MailerService;
