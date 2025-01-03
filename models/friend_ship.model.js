const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class FriendShipModel {
  async createFriendship(data) {
    return await prisma.friendship.create({
      data: data,
    });
  }

  async findFriendshipByUserId(userId) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId, status: "accepted" },
          { user2Id: userId, status: "accepted" },
        ],
      },
      include: {
        user1: {
          omit: {
            passwordHash: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
          include: {
            avatar: true,
          },
        },
        user2: {
          omit: {
            passwordHash: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
          include: {
            avatar: true,
          },
        },
      },
    });

    return friendships.map((friendship) => {
      if (friendship.user1Id === userId) {
        return {
          friendshipId: friendship.friendshipId,
          status: friendship.status,
          createdAt: friendship.createdAt,
          user: friendship.user2,
        };
      } else {
        return {
          friendshipId: friendship.friendshipId,
          status: friendship.status,
          createdAt: friendship.createdAt,
          user: friendship.user1,
        };
      }
    });
  }

  async findPendingFriendshipByUserId(userId) {
    const friendships = await prisma.friendship.findMany({
      where: {
        user2Id: userId,
        status: "pending",
      },
      include: {
        user1: {
          omit: {
            passwordHash: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
          include: {
            avatar: true,
          },
        },
        user2: {
          omit: {
            passwordHash: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
          include: {
            avatar: true,
          },
        },
      },
    });

    return friendships.map((friendship) => {
      if (friendship.user1Id === userId) {
        return {
          friendshipId: friendship.friendshipId,
          status: friendship.status,
          createdAt: friendship.createdAt,
          user: friendship.user2,
        };
      } else {
        return {
          friendshipId: friendship.friendshipId,
          status: friendship.status,
          createdAt: friendship.createdAt,
          user: friendship.user1,
        };
      }
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

  async findFriendshipById(friendshipId, userId) {
    const friendship = await prisma.friendship.findUnique({
      where: {
        friendshipId: friendshipId,
      },
      include: {
        user1: {
          omit: {
            passwordHash: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
          include: {
            avatar: true,
          },
        },
        user2: {
          omit: {
            passwordHash: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
          include: {
            avatar: true,
          },
        },
      },
    });

    if (friendship.user1.userId === userId) {
      return {
        friendshipId: friendship.friendshipId,
        status: friendship.status,
        createdAt: friendship.createdAt,
        user: friendship.user1,
        receiver: friendship.user2,
      };
    } else {
      return {
        friendshipId: friendship.friendshipId,
        status: friendship.status,
        createdAt: friendship.createdAt,
        user: friendship.user2,
        receiver: friendship.user1,
      };
    }
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
