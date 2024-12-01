const UserModel = require("../models/user.model");
const BaseController = require("./base.controller");
const CloudinaryService = require("../services/cloudinary.service");
const CloudinaryImageModel = require("../models/cloudinary_image.model");
const { CloudinaryFolder } = require("../enum/cloudinary.enum");

const userModel = new UserModel();
const cloudinaryService = new CloudinaryService();
const cloudinaryImageModel = new CloudinaryImageModel();

class UserController extends BaseController {
  async currentUser() {
    const uid = await this.authUserId();
    const user = await userModel.getUserById(uid);
    return this.response(200, user);
  }

  async findById(uid) {
    const user = await userModel.getUserById(uid);
    return this.response(200, user);
  }

  async changeAvatar() {
    const file = this.req.file;

    if (!file) {
      return this.response(400, "File is required");
    }

    const uid = await this.authUserId();

    const userExists = await userModel.getUserById(uid);
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

    const cloudinaryImage = await cloudinaryImageModel.createCloudinaryImage({
      publicId: storageUpload.public_id,
      imageUrl: storageUpload.secure_url,
      type: "avatar",
      format: storageUpload.format,
      width: storageUpload.width,
      height: storageUpload.height,
    });

    await userModel.changeAvatar(uid, cloudinaryImage.cloudinaryImageId);
    const user = await userModel.getUserById(uid);
    return this.response(200, user);
  }

  async emailVerified() {
    const uid = await this.authUserId();
    const userInfo = await userModel.getUserById(uid);
    const user = await userModel.emailVerified(uid, userInfo.emailVerified);
    return this.response(200, user);
  }
}

module.exports = UserController;
