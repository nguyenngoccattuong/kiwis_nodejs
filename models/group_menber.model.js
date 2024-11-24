const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class GroupMemberModel {
  async exitUserFromGroup(userId, groupId) {
    return await prisma.groupMember.deleteMany({
      where: { userId: userId, groupId: groupId },
    });
  }
}

module.exports = GroupMemberModel;
