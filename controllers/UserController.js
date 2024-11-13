const UserService = require("../services/user.service");
const Controller = require("./Controller");
const CloudinaryService = require("../services/cloudinary.service");
const {
  CloudinaryFolder,
  CloudinaryTypes,
} = require("../enum/cloudinary.enum");

const userService = new UserService();
const cloudinaryService = new CloudinaryService();

class UserController extends Controller {
  async currentUser() {
    const uid = await this.authUserId();
    const user = await userService.getUserById(uid);
    return this.response(200, user);
  }

  async findById(uid) {
    try {
      const user = await userService.getUserById(uid);
      return this.response(200, user);
    } catch (error) {
      return this.response(500, error);
    }
  }

  async changeAvatar() {
    try {
      const file  = this.req.file;

      if (!file) {
        return this.response(400, "File is required");
      }

      const uid = await this.authUserId();

      const userExists  = await userService.getUserById(uid);
      if(!userExists ){
        throw new Error("User not found");
      }

      const storageUpload = await cloudinaryService.uploadFile(
        file,
        CloudinaryFolder.avatar,
        "image",
        userExists.avatar.publicId,
        true,
      );
      
      await userService.changeAvatar(uid, storageUpload.id);
      const user  = await userService.getUserById(uid);
      return this.response(200, user);
    } catch (error) {
      console.log(error);
      return this.response(500, error);
    }
  }

  async emailVerified() {
    try {
      const uid = await this.authUserId();
      const user = await userService.emailVerified(uid);
      return this.response(200, user);
    } catch (error) {
      return this.response(500, {
        error: error.message,
      });
    }
  }

  
}

module.exports = UserController;
