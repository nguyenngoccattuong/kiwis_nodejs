// utils/emailTemplates.js
const EmailTypes = require("../enum/email.enum");

function getEmailTemplate(type, additionalData = {}) {
  switch (type) {
    case EmailTypes.FORGOT_PASSWORD:
      return {
        subject: "Password Reset Request",
        text: `Hello, \n\nYou requested a password reset. Use the following OTP to reset your password: ${additionalData.otp}\n\nIf you did not request a password reset, please ignore this email.`,
      };

    case EmailTypes.RESET_PASSWORD_SUCCESS:
      return {
        subject: "Password Reset Successfully",
        text: "Your password has been reset successfully.",
      };

    case EmailTypes.CHANGE_PASSWORD_SUCCESS:
      return {
        subject: "Password Changed Successfully",
        text: "Your password has been changed successfully.",
      };

    default:
      return {
        subject: "Notification",
        text: "You have a new notification.",
      };
  }
}

module.exports = getEmailTemplate;
