const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

const Controller = require("./Controller");

const AuthService = require("../services/auth.service");
const UserService = require("../services/user.service");

require("dotenv").config();

const userService = new UserService();
const authService = new AuthService();
class AuthController extends Controller {
  constructor(req, res, next) {
    super(req, res, next);
  }

  /**
   * Register a new user
   * Request Body:
   * - phone: string
   * - password: string
   * - email: string
   * @returns {Promise<User>}
   */
  async register() {
    try {
      const { phone, password, email } = this.req.body;
      const getUser = await userService.checkUserExistByPhone(phone);
      if (getUser) {
        return this.response(422, "Số Điện Thoại đã tồn tại");
      }

      const getEmail = await userService.checkUserExistByEmail(email);
      if(getEmail) {
        return this.response(422, "Email đã tồn tại");
      }

      if(!email) {
        return this.response(422, "Email không được rỗng");
      }

      if(password.length < 6) {
        return this.response(422, "Mật Khẩu phải lớn hơn 6 ký tự");
      }

      // Decode password  
      const decodedPassword = bcrypt.hashSync(password, 10);

      const createUser = await userService.createUser({ phone, password: decodedPassword, email });
      return this.response(200, createUser);
    } catch (error) {
      console.log(error);
      return this.response(500, error);
    }
  }

  /**
   * Login with custom token
   * Request Body:
   * - phone: string
   * - password: string
   * - email: string
   * @returns {Promise<User>}
   */
  async testLogin() {
    try {
      const auth = this.req.header("authorization");
      const token = auth.split(" ")[1];

      const user = await authService.loginWithCustomToken(token);
      return this.response(200, user);
    } catch (error) {
      return this.response(500, error);
    }
  }

  /**
   * Login with phone and password
   * Request Body:
   * - phone: string
   * - password: string
   * - email: string
   * @returns {Promise<String>}
   */
  async login() {
    try {
      const { phone, email, password } = this.req.body;

      if (!phone) {
        return this.response(422, "Số Điện Thoại không được rỗng");
      }

      if(!email) {
        return this.response(422, "Email không được rỗng");
      }

      if (!password) {
        return this.response(422, "Mật Khẩu không được rỗng");
      }

      const getUser = await userService.getUserByPhone(phone);

      const oldPassword = getUser.password;
      const result = bcrypt.compareSync(password, oldPassword);

      if (!result) {
        return this.response(422, "Mật khẩu không đúng");
      }

      const token = await authService.createCustomToken(getUser.id);

      return this.response(200,  token );
    } catch (error) {
      return this.response(500, error);
    }
  }

  /**
   * Logout
   * Request Body:
   * - token: string
   * @returns {Promise<String>}
   */
  async logout() {
    try {
      const auth = this.req.header("authorization");
      if (!auth) {
        return this.response(401, "Vui lòng nhập Token");
      }

      const token = auth.split(" ")[1]; // Lấy token từ header
      const decoded = jwt.verify(token, secret);
      const userId = decoded.data.id;

      const tokenModel = new TokenModel();
      await tokenModel.updateStatus(token, 0);

      return this.response(200, "Đăng xuất thành công");
    } catch (err) {
      return this.response(401, "Token không hợp lệ hoặc đã hết hạn");
    }
  }

  async appCheckVerification() {
    const auth = this.req.header("authorization");
  
    if (!auth) {
      return this.response(401, "Vui lòng cung cấp token");
    }
  
    const token = auth.split(" ")[1];
  
    if (!token) {
      return this.response(401, "Token không hợp lệ");
    }
  
    try {
      const decodedToken = await authService.verifyToken(token, true);
  
      if (decodedToken) {
        return this.response(200, decodedToken);
      } else {
        return this.response(401, "Token không hợp lệ hoặc đã hết hạn");
      }
  
    } catch (error) {
      console.log("Error during token verification:", error);
      if (error.code === 'auth/id-token-revoked') {
        return this.response(401, "Token đã bị thu hồi");
      }
      // Generic token error
      return this.response(401, "Token không hợp lệ hoặc đã hết hạn");
    }
  }
  
  async checkToken() {
    try {
      const auth = this.req.headers.authorization;
      if (!auth || !authHeader.startsWith('Bearer ')) {
        return this.response(401, "Vui lòng nhập Token");
      }

      const token = auth.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      if (!decodedToken || decodedToken === 0) {
        return this.response(403, "Token không hợp lệ hoặc đã hết hạn.");
      }
      return this.next();
    } catch (error) {
      return this.response(401, "Token không hợp lệ hoặc đã hết hạn.");
    }
  }
}

module.exports = AuthController;
