const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class GroupMemberModel {
  async existUserFromGroup(userId, groupId) {
    return await prisma.groupMember.findFirst({
      where: { userId: userId, groupId: groupId },
    });
  }

  async getGroupMemberByGroupId(groupId) {
    return await prisma.groupMember.findMany({
      where: { groupId: groupId },
    });
  }

  async deleteGroupMember(userId, groupId) {
    return await prisma.groupMember.delete({
      where: { userId: userId, groupId: groupId },
    });
  }

  async checkIsMenberInGroup(userId, groupId) {
    return await prisma.groupMember.findFirst({
      where: { userId: userId, groupId: groupId },
    });
  }

  async createGroupMembers(data) {
    return await prisma.groupMember.createMany({
      data: data,
    });
  }
}

module.exports = GroupMemberModel;
