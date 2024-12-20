const { adminAuth } = require("../configs/firebase_admin.config");
const UserModel = require("../models/user.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
class BaseController {
  req;
  res;
  next;

  constructor(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.userModel = new UserModel();
  }

  success(statusCode = 200, data = []) {
    return {
      statusCode: statusCode,
      success: true,
      message: "Success",
      data: data,
    };
  }

  error(statusCode = 422, error = []) {
    return {
      statusCode: statusCode,
      success: false,
      message: "Error",
      error: error,
    };
  }

  response(statusCode, data = []) {
    return this.res.send(
      statusCode == 200
        ? this.success(statusCode, data)
        : this.error(statusCode, data)
    );
  }

  // Firebase
  async verifyIdTokenFirebase() {
    const token = this.getToken();
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  }

  async authUserFirebaseUid() {
    const decodedToken = await this.verifyIdTokenFirebase();
    return decodedToken.uid;
  }

  // Backend
  async verifyIdToken() {
    const token = this.getToken();
    return jwt.verify(token, secret);
  }

  getToken() {
    const authorization = this.req.headers.authorization;
    if (!authorization) {
      throw new Error("Unauthorized: Token is not valid");
    }
    this.checkAuthHeader(authorization);
    const token = authorization.split(" ")[1];
    return token;
  }

  async authUserId() {
    const decodedToken = await this.verifyIdToken();
    const user = await this.userModel.getUserById(decodedToken.id);
    if (!user) {
      throw new Error("Unauthorized: User not found");
    }
    return user.userId;
  }

  checkAuthHeader(auth) {
    if (!auth || !auth.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Please provide token");
    }
  }
}

module.exports = BaseController;
