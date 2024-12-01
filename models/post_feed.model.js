const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class PostFeedModel {

  async createManyPostFeed(data) {
    return await prisma.postFeed.createMany({
      data,
    });
  }

  async createPostFeed(userId, postId) {
    return await prisma.postFeed.create({
      data: { userId, postId },
    });
  }
  
  async getPostFeedByUserId(userId) {
    return await prisma.postFeed.findMany({
      where: { userId },
      include: {
        post: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async deletePostFeed(userId, postId) {
    return await prisma.postFeed.delete({
      where: { userId_postId: { userId, postId } },
    });
  }
}

module.exports = PostFeedModel;
