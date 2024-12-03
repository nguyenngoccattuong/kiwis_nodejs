const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
class MessageModel {
  async getAllMessageByUserId(userId) {
    return await prisma.message.findMany({
      where: { userId: userId },
    });
  }
}

module.exports = MessageModel;
