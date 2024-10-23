const { admin, adminAuth } = require("../configs/firebase_admin.config");
const { client, clientAuth } = require("../configs/firebase.config");
const { signInWithCustomToken } = require('firebase/auth');

class AuthService {
  /**
   *  Function to verify the token
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async verifyToken(token, checkRevoked) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token, checkRevoked);
      return decodedToken;
    } catch (error) {
      console.log("Error in verifyToken", error);
      return null; // Token is invalid or expired
    }
  }

  /**
   *  Function to revoke refresh token for user
   * @param {*} uid
   * @returns {Promise<void>}
   */
  async revokeRefreshToken(uid) {
    try {
      await adminAuth.revokeRefreshTokens(uid);
      return true;
    } catch (error) {
      console.log("Error in revokeRefreshToken", error);
      throw new Error("Fail to revoke refresh token");
    }
  }

  /**
   * Function to create a custom token
   * @param {*} uid
   * @returns {Promise<String>}
   */
  async createCustomToken(uid) {
    try {
      const token = await adminAuth.createCustomToken(uid);
      return token;
    } catch (error) {
      console.log("Error in createCustomToken", error);
      throw new Error("Fail to create a custom token");
    }
  }

  /**
   * Login with custom token
   * @param {*} token
   * @returns {Promise<void>}
   */
  async loginWithCustomToken(token) {
    try {
      const user = await signInWithCustomToken(clientAuth, token);
      return user;
    } catch (error) {
      console.log("Error in loginWithCustomToken", error);
      throw new Error("Fail to login with custom token");
    }
  }

  /**
   * Function to send a notification to a specific FCM user
   * @param {*} token
   * @param {*} title
   * @param {*} body
   * @returns {Promise<void>}
   */
  async sendNotification(token, title, body) {
    try {
      const response = await admin.messaging().send({
        token,
        title,
        body,
      });
      return response;
    } catch (error) {
      console.log("Error in sendNotification", error);
      throw new Error("Fail to send a notification");
    }
  }
}

module.exports = AuthService;
