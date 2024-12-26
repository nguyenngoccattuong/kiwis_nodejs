const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
class GroupModel {
  async createGroupMember(data) {
    return await prisma.group.create({
      data: {
        ...data,
        members: {
          create: data.members.map((member) => ({
            userId: member.userId,
            role: member.role || "DEFAULT", // Vai trò mặc định
          })),
        },
      },
    });
  }

  async createGroup(data) {
    return await prisma.group.create({
      data: {
        ...data,
        members: {
          create: data.members.map((member) => ({
            userId: member,
            role: member.role || "DEFAULT", // Vai trò mặc định
          })),
        },
      },
    });
  }

  async findGroupById(groupId, userId) {
    return await prisma.group.findUnique({
      where: { groupId: groupId },
      omit: {
        avatarId: true,
      },
      include: {
        avatar: true,
        createdBy: true,
        members: {
          where: {
            userId: {
              not: userId,
            },
          },
          include: {
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
                avatar: true,
              },
            },
          },
        },
        messages: {
          include: {
            post:{
              include: {
                images: {
                  omit: {
                    cloudinaryImageId: true,
                    planId: true,
                  },
                  include: {
                    plan: true,
                  }
                },
              },
            },
            sender: {
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
                avatar: true,
              },
            },
          },
        },
        plans: true,
        realtimePosts: true,
      },
    });
  }

  async isCreator(groupId, userId) {
    return await prisma.group.findFirst({
      where: { groupId: groupId, createdById: userId },
    });
  }

  async findAllUsersByGroupId(groupId) {
    return await prisma.groupMember.findMany({
      where: { groupId: groupId },
      include: {
        members: true,
      },
    });
  }

  async findAllGroupsByCreateById(userId) {
    return await prisma.group.findMany({
      where: {
        createdById: userId,
      },
    });
  }

  async getAllGroupMembersByUserId(userId) {
    return await prisma.groupMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        group: true,
      },
    });
  }

  async updateGroup(groupId, data) {
    return await prisma.group.update({
      where: { groupId: groupId },
      data: data,
      omit: {
        avatarId: true,
      },
      include: {
        avatar: true,
        createdBy: true,
      },
    });
  }

  async setGroupAvatar(groupId, avatarId) {
    return await prisma.group.update({
      where: { groupId: groupId },
      data: { avatarId: avatarId },
    });
  }
}

module.exports = GroupModel;
