require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) =>  {
  try {
    const auth = req.header("authorization");
    if (!auth) {
      return res.send(401, "Vui lòng nhập Token");
    }
    const split_auth = auth.split(" "); // chuyển chuỗi => mảng
    const token = split_auth[1];
    jwt.verify(token, secret);
    return next();
  } catch (error) {
    return res.send(401, "Unauthorized: Token is not valid");
  }
}

module.exports = authMiddleware;