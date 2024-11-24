const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class RealtimePostModel {
  async realtimePost(realtimePost) {
    try {
      const uploadRealTimeCreated = await prisma.realtimePost.create({
        data: realtimePost,
      });
      return uploadRealTimeCreated;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteById(realtimePostId){
    return await prisma.realtimePost.deleteMany({
      where: {
        realtimePostId: realtimePostId,
      }
    });
  }

  async findAllByUserId(userId){
    return await prisma.realtimePost.findMany({
      where: {
        userId: userId,
      }
    });
  }

  async findAllByGroupId(groupId){
    return await prisma.realtimePost.findMany({
      where: {
        groupId: groupId,
      }
    });
  }

  async updateTitleById(realtimePostId, title){
    return await prisma.realtimePost.update({
      where: {
        realtimePostId: realtimePostId,
      },
      data: {
        title: title,
      }
    });
  }
}

module.exports = UploadRealTimeModel;
