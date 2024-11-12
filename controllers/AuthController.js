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
      const validationMessage = validation.checkStrength(password);

      // Check if the password is strong enough
      if (
        validationMessage.includes("too short") ||
        validationMessage.includes("too lengthy") ||
        validationMessage.includes("Weak")
      ) {
        // Respond with an error message
        throw Error(validationMessage);
      }

      if (!email) {
        throw Error("Email is required");
      }

      if (!validation.validateEmail(email)) {
        throw Error("Email is not valid");
      }

      if (!phone) {
        throw Error("Phone number is required");
      }

      if (!password) {
        throw Error("Password is required");
      }

      if (password.length < 6) {
        throw Error("Password must be greater than 6 characters");
      }

      const getUser = await userService.checkUserExistByPhone(phone);
      if (getUser) {
        throw Error("Phone number is already exists");
      }

      const getEmail = await userService.checkUserExistByEmail(email);
      if (getEmail) {
        throw Error("Email is already exists");
      }

      const createUser = await userService.createUser({
        phone,
        password: await bcrypt.hashSync(password, 10),
        email,
      });

      if (createUser) {
        return this.response(200, "Register successfully");
      }
      throw Error("Register failed");
    } catch (error) {
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
        throw Error("Phone number is required");
      }

      if (!email) {
        throw Error("Email is required");
      }

      if (!password) {
        throw Error("Password is required");
      }

      const getUser = await userService.getUserByPhone(phone);

      if (getUser === null || !getUser) {
        throw Error("Phone number is not registered");
      }

      const oldPassword = getUser.password;
      const result = bcrypt.compareSync(password, oldPassword);

      if (!result) {
        throw Error("Password is incorrect");
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
        throw Error("Email is required");
      }

      if (!validation.validateEmail(email)) {
        throw Error("Email is not valid");
      }

      const user = await userService.getUserByEmail(email);

      if (!user) {
        throw Error("Email is not registered");
      }

      const checkTimeOtp = await otpService.checkTimeOtp(user.email);
      if (checkTimeOtp) {
        throw Error("OTP is expired");
      } else {
        await otpService.deleteOtp(user.email);
      }

      const otp = otpService.createOtp(user.email);
      if (otp) {
        return this.response(200, "Email sent successfully");
      }
      return this.response(500, "Email sent failed");
    } catch (error) {
      return this.response(500, error.message);
    }
  }
  // async forgotPassword() {
  //   try {
  //     const { email } = this.req.body;

  //     if (!email) {
  //       throw new Error("Email is required");
  //     }

  //     if (!validation.validateEmail(email)) {
  //       throw new Error("Email is not valid");
  //     }

  //     const user = await userService.getUserByEmail(email);
  //     if (!user) {
  //       throw new Error("Email is not registered");
  //     }

  //     // Kiểm tra OTP đã tồn tại
  //     const existingOtp = await otpService.getOtpByEmail(user.email);
  //     if (existingOtp) {
  //       // Kiểm tra thời gian của OTP
  //       const checkTimeOtp = await otpService.checkTimeOtp(user.email);
  //       if (!checkTimeOtp) {
  //         await otpService.deleteOtp(user.email); // Xóa OTP đã hết hạn
  //       }
  //     }

  //     // Tạo OTP mới
  //     const otp = await otpService.createOtp(user.email);
  //     if (otp) {
  //       // Gửi email với OTP (giả sử bạn có một phương thức gửi email)
  //       await emailService.sendOtpEmail(user.email, otp);
  //       return this.response(200, "Email sent successfully");
  //     }
  //     return this.response(500, "Email sending failed");
  //   } catch (error) {
  //     return this.response(
  //       500,
  //       error.message || "An error occurred while processing your request"
  //     );
  //   }
  // }

  async resetPassword() {
    try {
      const { email, otp, password, confirmPassword } = this.req.body;

      /// Validation password
      if (!password) {
        return this.response(442, "Password is required");
      }
      if (!confirmPassword) {
        return this.response(442, "Confirm password is required");
      }
      if (password !== confirmPassword) {
        throw Error("Password and confirm password do not match");
      }
      /// Validation strenght password
      const validationMessage = validation.checkStrength(password);
      if (
        validationMessage.includes("too short") ||
        validationMessage.includes("too lengthy") ||
        validationMessage.includes("Weak")
      ) {
        throw Error(validationMessage);
      }

      /// Validation email
      const user = await userService.getUserByEmail(email);

      if (!user) {
        throw Error("Email is not registered");
      }

      /// Valation otp
      if (!otp) {
        return this.response(442, "OTP is required");
      }

      const verifyOtp = await otpService.verifyOtp(otp, user.email);

      if (!verifyOtp) {
        throw Error("OTP is not valid");
      }

      const checkTimeOtp = await otpService.checkTimeOtp(user.email);
      if (!checkTimeOtp) {
        throw Error("OTP code has expired");
      }

      const updatePassword = await userService.updateUser(user.id, {
        password: await bcrypt.hashSync(password, 10),
      });

      await otpService.deleteOtp(user.email);

      return this.response(200, "Password reset successfully");
    } catch (error) {
      return this.response(500, error.message);
    }
  }

  async changePassword() {
    try {
      const { oldPassword, newPassword, confirmPassword } = this.req.body;

      if (!oldPassword) {
        return this.response(442, "Old password is required");
      }

      if (!newPassword) {
        return this.response(442, "New password is required");
      }

      if (!confirmPassword) {
        return this.response(442, "Confirm password is required");
      }

      if (newPassword !== confirmPassword) {
        throw Error("Password and confirm password do not match");
      }

      // Validate the password strength
      const validationMessage = validation.checkStrength(newPassword);

      // Check if the password is strong enough
      if (
        validationMessage.includes("too short") ||
        validationMessage.includes("too lengthy") ||
        validationMessage.includes("Weak")
      ) {
        // Respond with an error message
        throw Error(validationMessage);
      }

      const user = await userService.getInfoUserById(await this.authUserId());
      const result = bcrypt.compareSync(oldPassword, user.password);

      if (!result) {
        throw Error("Old password is incorrect");
      }

      const updatePassword = await userService.updateUser(user.id, {
        password: await bcrypt.hashSync(newPassword, 10),
      });

      if (!updatePassword) {
        throw Error("Update password fail");
      }
      return this.response(200, "Password changed successfully");
    } catch (error) {
      return this.response(500, error.message);
    }
  }
}

module.exports = AuthController;
