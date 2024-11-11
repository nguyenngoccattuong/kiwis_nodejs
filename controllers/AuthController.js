const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

const Controller = require("./Controller");

const AuthService = require("../services/auth.service");
const UserService = require("../services/user.service");
const OtpService = require("../services/otp.service");
const Validation = require("../helper/Validation");

require("dotenv").config();

const userService = new UserService();
const authService = new AuthService();
const otpService = new OtpService();
const validation = new Validation();

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

      // Validate the password strength
      const validationMessage = checkStrength(password);

      // Check if the password is strong enough
      if (
        validationMessage.includes("too short") ||
        validationMessage.includes("too lengthy") ||
        validationMessage.includes("Weak")
      ) {
        // Respond with an error message
        return this.response(422, validationMessage);
      }

      if (!email) {
        return this.response(422, "Email is required");
      }

      if (!Validation.validateEmail(email)) {
        return this.response(422, "Email is not valid");
      }

      if (!phone) {
        return this.response(422, "Phone number is required");
      }

      if (!password) {
        return this.response(422, "Password is required");
      }

      if (password.length < 6) {
        return this.response(422, "Password must be greater than 6 characters");
      }

      const getUser = await userService.checkUserExistByPhone(phone);
      if (getUser) {
        return this.response(422, "Phone number is already exists");
      }

      const getEmail = await userService.checkUserExistByEmail(email);
      if (getEmail) {
        return this.response(422, "Email is already exists");
      }

      const createUser = await userService.createUser({
        phone,
        password: await bcrypt.hashSync(password, 10),
        email,
      });

      if (createUser) {
        return this.response(200, "Register successfully");
      }
      return this.response(422, "Register failed");
    } catch (error) {
      console.log(error);
      return this.response(500, error.message);
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
      const token = this.getToken();

      const user = await authService.loginWithCustomToken(token);
      return this.response(200, user);
    } catch (error) {
      return this.response(500, error.message);
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
        return this.response(422, "Phone number is required");
      }

      if (!email) {
        return this.response(422, "Email is required");
      }

      if (!password) {
        return this.response(422, "Password is required");
      }

      const getUser = await userService.getUserByPhone(phone);

      if (getUser === null || !getUser) {
        return this.response(422, "Phone number is not registered");
      }

      const oldPassword = getUser.password;
      const result = bcrypt.compareSync(password, oldPassword);

      if (!result) {
        return this.response(422, "Password is incorrect");
      }

      const token = await authService.createCustomToken(getUser.id);

      return this.response(200, token);
    } catch (error) {
      return this.response(500, error.message);
    }
  }

  async authorization() {
    try {
      const token = this.getToken();

      if (!token) {
        return this.response(401, "Unauthorized: Token is not valid");
      }

      const decodedToken = await authService.verifyToken(token);
      if (decodedToken) {
        return this.next();
      }
      return this.response(401, "Unauthorized: Token is not valid");
    } catch (error) {
      return this.response(500, error.message);
    }
  }

  /**
   * App Check Verification
   * Request Body:
   * - token: string
   * @returns {Promise<String>}
   */
  async appCheckVerification() {
    const token = this.getToken();

    if (!token) {
      return this.response(401, "Unauthorized: Token is not valid");
    }

    try {
      const decodedToken = await this.verifyIdToken();

      if (decodedToken) {
        return this.response(200, decodedToken);
      } else {
        return this.response(401, "Unauthorized: Token is expired");
      }
    } catch (error) {
      console.log("Error during token verification:", error);
      if (error.code === "auth/id-token-revoked") {
        return this.response(401, "Unauthorized: Token is revoked");
      }
      return this.response(401, "Unauthorized: Token is not valid");
    }
  }

  /**
   * Revoke Token
   * Request Body:
   * - token: string
   * @returns {Promise<String>}
   */
  async revokeToken() {
    try {
      const token = this.getToken();
      const decodedToken = await authService.revokeRefreshToken(token);

      if (!decodedToken) {
        return this.response(403, "Unauthorized: Token is not valid");
      }
      return this.response(200, "Revoke token successfully");
    } catch (error) {
      return this.response(500, error.message);
    }
  }

  async forgotPassword() {
    try {
      const { email } = this.req.body;

      if (!email) {
        return this.response(422, "Email is required");
      }

      if (!validation.validateEmail(email)) {
        return this.response(422, "Email is not valid");
      }

      const user = await userService.getUserByEmail(email);

      if (!user) {
        return this.response(422, "Email is not registered");
      }
      const otp = otpService.createOtp(user.email);

      return this.response(200, "Email sent successfully");
    } catch (error) {
      return this.response(500, error.message);
    }
  }

  async resetPassword() {
    try {
      const { email, otp, password, confirmPassword } = this.req.body;

      if (password !== confirmPassword) {
        return this.response(422, "Password and confirm password do not match");
      }

      // Validate the password strength
      const validationMessage = checkStrength(password);

      // Check if the password is strong enough
      if (
        validationMessage.includes("too short") ||
        validationMessage.includes("too lengthy") ||
        validationMessage.includes("Weak")
      ) {
        // Respond with an error message
        return this.response(422, validationMessage);
      }

      const user = await userService.getUserByEmail(email);

      if (!user) {
        return this.response(422, "Email is not registered");
      }

      const verifyOtp = otpService.verifyOtp(otp, user.otp.code);

      if (!verifyOtp) {
        return this.response(422, "OTP is not valid");
      }

      const updatePassword = await userService.updateUser(user.id, {
        password: await bcrypt.hashSync(password, 10),
      });

      await otpService.deleteOtp(user.id);

      return this.response(200, "Password reset successfully");
    } catch (error) {
      return this.response(500, error.message);
    }
  }

  async changePassword() {
    try {
      const { oldPassword, newPassword, confirmPassword } = this.req.body;

      if (newPassword !== confirmPassword) {
        return this.response(422, "Password and confirm password do not match");
      }

      // Validate the password strength
      const validationMessage = checkStrength(password);

      // Check if the password is strong enough
      if (
        validationMessage.includes("too short") ||
        validationMessage.includes("too lengthy") ||
        validationMessage.includes("Weak")
      ) {
        // Respond with an error message
        return this.response(422, validationMessage);
      }

      const user = await userService.getUserById(this.req.user.uid);

      const userPassword = user.password;
      const result = bcrypt.compareSync(oldPassword, userPassword);

      if (!result) {
        return this.response(422, "Old password is incorrect");
      }

      const updatePassword = await userService.updateUser(user.id, {
        password: await bcrypt.hashSync(newPassword, 10),
      });

      return this.response(200, "Password changed successfully");
    } catch (error) {
      return this.response(500, error.message);
    }
  }
}

module.exports = AuthController;
