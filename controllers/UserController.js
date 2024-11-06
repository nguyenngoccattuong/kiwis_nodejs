const UserService = require("../services/user.service");
const Controller = require("./Controller");
const userService = new UserService();

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
}

module.exports = UserController;
