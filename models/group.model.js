const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
class GroupModel {
  async createGroup(name, createdById) {
    return await prisma.group.create({
      data: {
        name,
        createdById,
      },
    });
  }

  async findGroupById(groupId) {
    return await prisma.group.findUnique({
      where: { groupId: groupId },
    });
  }

  async findAllGroupsByUserId(userId) {
    return await prisma.group.findMany({
      where: {
        createdById: userId,
      },
    });
  }
}

module.exports = GroupModel;
