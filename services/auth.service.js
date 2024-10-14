const admin = require("../configs/firebase.config");

/**
 *  Function to verify the token
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.log("Error in verifyToken", error);
    return null; // Token is invalid or expired
  }
};

/**
 *  Function to revoke refresh token for user
 * @param {*} uid
 * @returns {Promise<void>}
 */
const revokeRefreshToken = async (uid) => {
  try {
    await admin.auth().revokeRefreshTokens(uid);
  } catch (error) {
    console.log("Error in revokeRefreshToken", error);
  }
};

/**
 * Function to create a custom token
 * @param {*} uid
 * @returns {Promise<void>}
 */
const createCustomToken = async (uid) => {
  try {
    const token = await admin.auth().createCustomToken(uid);
    return token;
  } catch (error) {
    console.log("Error in createCustomToken", error);
    throw new Error("Fail to create a custom token");
  }
};

/**
 * Function to send a notification to a specific FCM user
 * @param {*} token
 * @param {*} title
 * @param {*} body
 * @returns {Promise<void>}
 */
const sendNotification = async (token, title, body) => {
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
};

module.exports = { verifyToken, revokeRefreshToken, createCustomToken, sendNotification };
