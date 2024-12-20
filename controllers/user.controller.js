const UserModel = require("../models/user.model");
const BaseController = require("./base.controller");
const CloudinaryService = require("../services/cloudinary.service");
const CloudinaryImageModel = require("../models/cloudinary_image.model");
const { CloudinaryFolder } = require("../enum/cloudinary.enum");
const FriendShipModel = require("../models/friend_ship.model");

const userModel = new UserModel();
const cloudinaryService = new CloudinaryService();
const cloudinaryImageModel = new CloudinaryImageModel();
const friendShipModel = new FriendShipModel();
class UserController extends BaseController {
  async currentUser() {
    const uid = await this.authUserId();
    const user = await userModel.getUserById(uid);
    const friendShip = await friendShipModel.findFriendshipByUserId(uid);
    const userWithFriends = {
      ...user,
      friends: friendShip,
    };
    return this.response(200, userWithFriends);
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

  async updateFCMToken() {
    const uid = await this.authUserId();
    const fcmToken = this.req.body.fcmToken;
    const user = await userModel.updateFCMToken(uid, fcmToken);
    return this.response(200, "Update FCM token success");
  }

  async updateUser() {
    const uid = await this.authUserId();
    const user = await userModel.updateUser(uid, this.req.body);
    return this.response(200, user);
  }
}

module.exports = UserController;
