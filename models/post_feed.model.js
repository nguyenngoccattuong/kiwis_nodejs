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
    const result = await prisma.postFeed.findMany({
      where: { userId },
      omit: { 
        postId: true, 
        userId: true 
      },
      include: {
        post: {
          omit: {
            userId: true,
          },
          include: {
            images: {
              omit: {
                cloudinaryImageId: true,
                planId: true,
              },
              include: {
                plan: true,
                planLocation: true,
              }
            },
            user: {
              omit: {
                avatarId: true,
                passwordHash: true,
                isActive: true,
                deletedAt: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
              },
              include: {
                avatar: {
                  omit: {
                    cloudinaryImageId: true,
                    createdAt: true,
                    planId: true,
                  },
                },
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return result.map((item) => item.post);
  }

  async deletePostFeed(userId, postId) {
    return await prisma.postFeed.delete({
      where: { userId_postId: { userId, postId } },
    });
  }
}

module.exports = PostFeedModel;
