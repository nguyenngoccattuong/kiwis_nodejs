const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class UserModel {
  /**
   * Function to get user by id
   * @param {*} id
   * @returns {Promise<User>}
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      omit: {
        passwordHash: true,
        avatarId: true,
        fcmToken: true,
      },
      include: {
        avatar: true,
        groups: true,
        plans: true,
        postFeeds: true,
      },
      where: {
        userId: userId,
      },
    });

    return user;
  }

  async updateFCMToken(userId, fcmToken) {
    return await prisma.user.update({
      where: { userId },
      data: { fcmToken },
    });
  }

  async getUserFCMToken(userId) {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { fcmToken: true }
    });
    return user?.fcmToken;
  }

  async getInfoUserById(userId) {
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    return user;
  }

  /**
   * Check user is exist by phone
   * @param {*} phone
   * @returns {Promise<boolean>}
   */
  async checkUserExistByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }

  /**
   * Check user is exist by email
   * @param {*} email
   * @returns {Promise<boolean>}
   */
  async checkUserExistByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Function to get user by email
   * @param {*} email
   * @returns {Promise<User>}
   */
  async getUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Function to get user by phone
   * @param {*} phone
   * @returns {Promise<User>}
   */
  async getUserByPhone(phone) {
    const user = await prisma.user.findUnique({
      where: { phone },
    });
    return user;
  }

  /**
   * Function to create a new user
   * @param {*} user
   * @returns {Promise<User>}
   */
  async createUser(user) {
    const newUser = await prisma.user.create({
      data: user,
    });
    // Remove the password field before returning
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Function to update a user
   * @param {*} id
   * @param {*} user
   * @returns {Promise<User>}
   */
  async updateUser(userId, user) {
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: user,
    });
    return updatedUser;
  }

  /**
   * Function to delete a user
   * @param {*} id
   * @returns {Promise<User>}
   */
  async deleteUser(userId) {
    const deletedUser = await prisma.user.update({
      where: { userId },
      data: { deletedAt: new Date() },
    });
    return deletedUser;
  }

  async changeAvatar(id, cloudStorageId) {
    const userUpdated = await prisma.user.update({
      where: { userId: id },
      data: { avatarId: cloudStorageId },
    });
    return userUpdated;
  }

  async emailVerified(id, emailVerified) {
    const updatedUser = await prisma.user.update({
      where: { userId: id },
      data: { emailVerified: !emailVerified },
    });
    return updatedUser;
  }
}

module.exports = UserModel;
