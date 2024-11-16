const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class UploadRealTimeService {
  async uploadRealTime(uploadRealTime) {
    try {
      const uploadRealTimeCreated = await prisma.uploadRealTime.create({
        data: uploadRealTime,
      });
      return uploadRealTimeCreated;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = UploadRealTimeService;
