const jwt = require("jsonwebtoken");

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

  auth_user() {
    const auth = this.req.header("authorization");
    const split_auth = auth.split(" ");
    const token = split_auth[1];
    const decoded = jwt.verify(token, process.env.SECRET);
    return decoded["data"];
  }

  auth_user_id() {
    return this.auth_user().id;
  }
}

module.exports = Controller;
