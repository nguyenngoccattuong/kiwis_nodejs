const bcrypt = require("bcryptjs");

const { PrismaClient } = require("@prisma/client");

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
    await mailerService.sendEmail(to, "OTP", otp);
  }

  async verifyOtp(otp, hashedOtp) {
    return this.otp.verify(otp, hashedOtp);
  }

  async createOtp(email) {
    const otp = this.generateOtp();
    await this.sendOtp(email, otp);
    const hashedOtp = await bcrypt.hashSync(otp, 10);
    const otpTime = Date.now() + 60000; // Hết hạn sau 1 phút
    return await prisma.oTP.create({
      data: { email, code: hashedOtp, exprire: new Date(otpTime) },
    });
  }

  async deleteOtp(userId) {
    await prisma.otp.deleteMany({
      where: { userId },
    });
    return true;
  }

  async getOtp(userId) {
    const otp = await prisma.otp.findUnique({
      where: { userId },
    });
    return otp;
  }
}

module.exports = OtpService;
