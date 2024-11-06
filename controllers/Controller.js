const { adminAuth } = require("../configs/firebase_admin.config");

class Controller {
  req;
  res;
  next;

  constructor(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
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
      success: true,
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

  async verifyIdToken() {
    const token = this.getToken();
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
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
    return decodedToken.uid;
  }

  checkAuthHeader(auth) {
    if (!auth || !auth.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Please provide token");
    }
  }
}

module.exports = Controller;
