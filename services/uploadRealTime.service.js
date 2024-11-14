const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class UploadRealTimeService {
  async uploadRealTime(uploadRealTime) {
    try {
      const uploadRealTime = await prisma.uploadRealTime.create({
        data: uploadRealTime,
      });
      return uploadRealTime;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = UploadRealTimeService;
