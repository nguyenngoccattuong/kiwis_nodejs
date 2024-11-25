const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
class GroupModel {
  async createGroup(data) {
    return await prisma.group.create({
      data: data,
    });
  }

  async findGroupById(groupId) {
    return await prisma.group.findUnique({
      where: { groupId: groupId },
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
    });
  }

  async updateGroup(groupId, data) {
    return await prisma.group.update({
      where: { groupId: groupId },
      data: data,
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
