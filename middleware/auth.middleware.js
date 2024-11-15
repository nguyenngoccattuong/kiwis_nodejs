const AuthService = require("../services/auth.service");
const Controller = require("../controllers/base.controller");
const authService = new AuthService();
const controller = new Controller();

const authMiddleware = async (req, res, next) =>  {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      throw new Error("Unauthorized: Token is not valid");
    }
    controller.checkAuthHeader(authorization);
    const token = authorization.split(" ")[1];

    if (!token) {
      return res.send(401, "Unauthorized: Token is not valid");
    }

    const decodedToken = await authService.verifyToken(token);
    if (decodedToken) {
      return next();
    }
    return res.send(401, "Unauthorized: Token is not valid");
  } catch (error) {
    return res.send(500, error.message);
  }
}

module.exports = authMiddleware;