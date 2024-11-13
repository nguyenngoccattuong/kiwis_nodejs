const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class UserService {
  /**
   * Function to get user by id
   * @param {*} id
   * @returns {Promise<User>}
   */
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      omit: {
        email: true,
        password: true,
      },
      include: {
        avatar:  {
          omit: {
            firebaseSettingId: true,
          },
        },
      },
      where: {
        id: id,
      },
    });
    return user;
  }

  async getInfoUserById(id) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
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
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Function to update a user
   * @param {*} id
   * @param {*} user
   * @returns {Promise<User>}
   */
  async updateUser(id, user) {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: user,
    });
    return updatedUser;
  }

  /**
   * Function to delete a user
   * @param {*} id
   * @returns {Promise<User>}
   */
  async deleteUser(id) {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  }

  async changeAvatar(id, cloudStorageId) {
    const userUpdated = await prisma.user.update({
      where: { id },
      data: { avatarId: cloudStorageId },
    });
    return userUpdated;
  }

  async emailVerified(id) {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isEmailVerified: true },
    });
    return updatedUser;
  }
}

module.exports = UserService;
