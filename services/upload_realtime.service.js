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

  async deleteById(uid){
    return await prisma.uploadRealTime.deleteMany({
      where: {
        id: uid,
      }
    });
  }

  async findAllByUserId(uid){
    return await prisma.uploadRealTime.findMany({
      where: {
        userId: uid,
      }
    });
  }

  async findAllByGroupId(gid){
    return await prisma.uploadRealTime.findMany({
      where: {
        groupId: gid,
      }
    });
  }

  async updateTitleById(uid, title){
    return await prisma.uploadRealTime.update({
      where: {
        id: uid,
      },
      data: {
        title: title,
      }
    });
  }
}

module.exports = UploadRealTimeService;
