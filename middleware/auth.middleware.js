require("dotenv").config();
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const secret = process.env.JWT_SECRET;
const userModel = new UserModel();

const authMiddleware = async (req, res, next) =>  {
  try {
    const auth = req.header("authorization");
    if (!auth) {
      return res.send(401, "Vui lòng nhập Token");
    }
    const split_auth = auth.split(" "); // chuyển chuỗi => mảng
    const token = split_auth[1];
    const decodedToken = jwt.verify(token, secret);
    const user = await userModel.getInfoUserById(decodedToken.id);
    if (user.isDeleted) {
      return res.send(401, "User is deleted");
    }
    return next();
  } catch (error) {
    return res.send(401, "Unauthorized: Token is not valid");
  }
}

module.exports = authMiddleware;