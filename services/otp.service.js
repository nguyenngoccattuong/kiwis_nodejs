const bcrypt = require("bcryptjs");

const { PrismaClient } = require("@prisma/client");
const EmailTypes = require("../enum/email.enum");

const prisma = new PrismaClient();
const MailerService = require("./mailer.service");
class OtpService {
  constructor() {
    this.otp = require("otp-generator");
  }

  generateOtp() {
    return this.otp.generate(6, { upperCase: false, specialChars: false });
  }

  async sendOtp(to, otp) {
    const mailerService = new MailerService();
    await mailerService.sendEmail(to, EmailTypes.FORGOT_PASSWORD, { otp });
  }

  async verifyOtp(otp, email) {
    try {
      const findOtp = await this.getOtpByEmail(email);
      if (!findOtp) {
        throw new Error("Email isn't have otp");
      }
      return await bcrypt.compare(otp, findOtp.otp);
    } catch (err) {
      throw new Error(err);
    }
  }

  async createOtp(email) {
    try {
      const otp = this.generateOtp();
      await this.sendOtp(email, otp);
      const hashedOtp = await bcrypt.hashSync(otp, 10);
      const otpTime = Date.now() + 3 * 60 * 1000; // Hết hạn sau 3 phút
      const otpCreated = await prisma.otp.create({
        data: { email, otp: hashedOtp, expire: new Date(otpTime) },
      });
      return otpCreated;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteOtp(email) {
    return await prisma.otp.deleteMany({
      where: {
        email: email,
      },
    });
  }

  /**
   * Function to get otp by email
   * @param {*} email
   * @returns {Promise<otp>}
   */
  async getOtpByEmail(email) {
    return await prisma.otp.findFirst({
      where: { email },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async checkTimeOtp(email) {
    const otp = await this.getOtpByEmail(email);
    return otp.expire > Date.now();
  }
}

module.exports = OtpService;
