const getEmailTemplate = require("../Helper/Email");
const EmailTypes = require("../enum/email.enum");

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
  async sendEmail(to, emailType, additionalData = {}) {
    const transporter = require("../configs/mailer.config");
    const { subject, text } = getEmailTemplate(emailType, additionalData);
    const mailOptions = {
      from: process.env.SENDING_EMAIL_USER,
      to,
      subject,
      text,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw Error("Sent email failed");
    }
  }

  /**
   * Send email with attachment
   * @param {*} to
   * @param {*} subject
   * @param {*} text
   * @param {*} attachment
   * @returns {Promise<void>}
   */
  async sendEmailWithAttachment(
    to,
    emailType,
    additionalData = {},
    attachment
  ) {
    const transporter = require("../configs/mailer.config");
    const { subject, text } = getEmailTemplate(emailType, additionalData);
    const mailOptions = {
      from: process.env.SENDING_EMAIL_USER,
      to,
      subject,
      text,
      attachment,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw Error("Sent email failed");
    }
  }
}

module.exports = MailerService;
