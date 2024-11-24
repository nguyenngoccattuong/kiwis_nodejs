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
        status: "accepted",
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

  async updateFriendship(friendshipId, data) {
    return await prisma.friendship.update({
      where: {
        friendshipId: friendshipId,
      },
      data: data,
    });
  }
}

module.exports = FriendShipModel;