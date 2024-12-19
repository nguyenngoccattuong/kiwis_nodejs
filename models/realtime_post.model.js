const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class RealTimePostModel {
  async createRealtimePost(data) {
    try {
      const uploadRealTimeCreated = await prisma.realtimePost.create({
        data: data,
        include: {
          user: true,
          images: true,
        },
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
        deletedAt: null,
        isOnlyUser: true,
      },
      include: {
        images: true,
        reupPosts: {
          where: {
            userId: userId,
          }
        }
      },
    });
  }

  async findById(realtimePostId){
    return await prisma.realtimePost.findUnique({
      where: {
        realtimePostId: realtimePostId,
      },
      include: {
        user: true,
        images: true,
      },
    });
  }

  async findAllByGroupId(groupId){
    return await prisma.realtimePost.findMany({
      where: {
        groupId: groupId,
        deletedAt: null,
      },
      include: {
        images: true,
      },
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

module.exports = RealTimePostModel;
