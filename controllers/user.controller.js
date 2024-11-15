const UserService = require("../services/user.service");
const BaseController = require("./base.controller");
const CloudinaryService = require("../services/cloudinary.service");
const {
  CloudinaryFolder,
  CloudinaryTypes,
} = require("../enum/cloudinary.enum");

const userService = new UserService();
const cloudinaryService = new CloudinaryService();

class UserController extends BaseController {
  async currentUser() {
    const uid = await this.authUserId();
    const user = await userService.getUserById(uid);
    return this.response(200, user);
  }

  async findById(uid) {
    const user = await userService.getUserById(uid);
    return this.response(200, user);
  }

  async changeAvatar() {
    const file = this.req.file;

    if (!file) {
      return this.response(400, "File is required");
    }

    const uid = await this.authUserId();

    const userExists = await userService.getUserById(uid);
    if (!userExists) {
      throw new Error("User not found");
    }

    const storageUpload = await cloudinaryService.uploadFile(
      file,
      CloudinaryFolder.avatar,
      "image",
      userExists.avatarId != null ? userExists.avatar.publicId : null,
      userExists.avatarId != null ? true : false
    );

    await userService.changeAvatar(uid, storageUpload.id);
    const user = await userService.getUserById(uid);
    return this.response(200, user);
  }

  async emailVerified() {
    const uid = await this.authUserId();
    const userInfo = await userService.getUserById(uid);
    const user = await userService.emailVerified(uid, userInfo.isEmailVerified);
    return this.response(200, user);
  }
}

module.exports = UserController;
