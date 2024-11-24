const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class FriendShipModel {
  async createFriendship(data) {
    return await prisma.friendship.create({
      data: data,
    });
  }

  async findFriendshipByUserId(userId) {
    return await prisma.friendship.findMany({
      where: {
        userId: userId,
        status: "accepted",
      },
    });
  }

  async exitsFriendship(userId, friendId) {
    return await prisma.friendship.findFirst({
      where: {
        user1Id: userId,
        user2Id: friendId,
      },
    });
  }

  async deleteFriendship(userId, friendId) {
    return await prisma.friendship.delete({
      where: {
        user1Id: userId,
        user2Id: friendId,
      },
    });
  }

  async updateFriendship(userId, friendId, data) {
    return await prisma.friendship.update({
      where: {
        user2Id: userId,
        user1Id: friendId,
      },
      data: data,
    });
  }
}

module.exports = FriendShipModel;
