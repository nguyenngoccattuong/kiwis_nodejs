require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const BaseController = require("./base.controller");

const AuthService = require("../services/auth.service");
const UserService = require("../services/user.service");
const OtpService = require("../services/otp.service");
const Validation = require("../helper/validation");

require("dotenv").config();

const userService = new UserService();
const authService = new AuthService();
const otpService = new OtpService();
const validation = new Validation();

class AuthController extends BaseController {
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
    const { phone, password, email, firstName, lastName } = this.req.body;

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

    if (!firstName || firstName === "") {
      throw Error("First name is required");
    }

    if (!lastName || lastName === "") {
      throw Error("Last name is required");
    }

    if (!email || email === "") {
      throw Error("Email is required");
    }

    if (!validation.validateEmail(email)) {
      throw Error("Email is not valid");
    }

    if (!phone || phone === "") {
      throw Error("Phone number is required");
    }

    if (!password || password === "") {
      throw Error("Password is required");
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
      firstName,
      lastName,
    });

    if (createUser) {
      return this.response(200, "Register successfully");
    }
    throw Error("Register failed");
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
    const token = this.getToken();

    const user = await authService.loginWithCustomToken(token);
    return this.response(200, user);
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
    const { email, password } = this.req.body;

    if (!email) {
      throw Error("Email is required");
    }

    if (!validation.validateEmail(email)) {
      throw Error("Email is not valid");
    }

    if (!password) {
      throw Error("Password is required");
    }

    const getUser = await userService.getUserByEmail(email);

    if (getUser === null || !getUser) {
      throw Error("Email is not registered");
    }

    if (!getUser.isActive) {
      throw Error("Account is not active, please contact us");
    }

    const oldPassword = getUser.password;
    const result = bcrypt.compareSync(password, oldPassword);

    if (!result) {
      throw Error("Password is incorrect");
    }

    if (getUser.isEmailVerified) {
      const otp = otpService.createOtp(getUser.email);
      if (otp) {
        return this.response(200, "OTP sent successfully");
      }
      throw Error("OTP sent failed");
    }
    // Custome token firebase
    const firebaseToken = await authService.createCustomToken(getUser.id);
    // Generate JWT token
    const token = this.generateToken(getUser.id);

    return this.response(200, {
      firebaseToken: firebaseToken,
      token: token,
    });
  }

  generateToken(id) {
    return jwt.sign({ id }, secret, { expiresIn: "7 days" });
  }

  async loginWithOtp() {
    const { email, otp } = this.req.body;

    if (!email) {
      throw Error("Email is required");
    }

    if (!validation.validateEmail(email)) {
      throw Error("Email is not valid");
    }

    if (!otp) {
      throw Error("OTP is required");
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw Error("Email is not registered");
    }

    const verifyOtp = await otpService.verifyOtp(otp, user.email);

    if (!verifyOtp) {
      throw Error("OTP is not valid");
    }

    const checkTimeOtp = await otpService.checkTimeOtp(user.email);
    if (!checkTimeOtp) {
      throw Error("OTP code has expired");
    }

    const token = await authService.createCustomToken(user.id);

    await otpService.deleteOtp(user.email);

    return this.response(200, token);
  }

  async resendOtp() {
    const { email } = this.req.body;

    const otp = otpService.createOtp(email);
    if (otp) {
      return this.response(200, "OTP sent successfully");
    }
    throw Error("OTP sent failed");
  }

  async authorization() {
    const token = this.getToken();

    if (!token) {
      return this.response(401, "Unauthorized: Token is not valid");
    }

    const decodedToken = await authService.verifyToken(token);
    if (decodedToken) {
      return this.next();
    }
    return this.response(401, "Unauthorized: Token is not valid");
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
    const uid = await this.authUserFirebaseUid();
    const decodedToken = await authService.revokeRefreshToken(uid);

    if (!decodedToken) {
      return this.response(403, "Unauthorized: Token is not valid");
    }
    return this.response(200, "Revoke token successfully");
  }

  async forgotPassword() {
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
  }

  async resetPassword() {
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
  }

  async changePassword() {
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
  }

  async refreshToken() {
    const id = await this.authUserId();
    const decodedToken = await authService.createCustomToken(id);
    return this.response(200, decodedToken);
  }
}

module.exports = AuthController;
