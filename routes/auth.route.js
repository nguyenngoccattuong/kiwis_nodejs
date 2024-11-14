const express = require("express");
const router = express.Router();

const Auth = require("../controllers/AuthController");

// Auth
router.post("/register", (req, res) => new Auth(req, res).register());
router.post("/login", (req, res) => new Auth(req, res).login());
router.post("/login-with-otp", (req, res) =>
  new Auth(req, res).loginWithOtp()
);
router.post("/resend-otp", (req, res) => new Auth(req, res).resendOtp());
router.post("/logout", (req, res) => new Auth(req, res).logout());
router.post("/check-token", (req, res) =>
  new Auth(req, res).appCheckVerification()
);
router.post("/test-login", (req, res) => new Auth(req, res).testLogin());
router.post("/revoke-token", (req, res) =>
  new Auth(req, res).revokeToken()
);
router.post("/reset-password", (req, res) =>
  new Auth(req, res).resetPassword()
);
router.post("/forgot-password", (req, res) =>
  new Auth(req, res).forgotPassword()
);
router.post(
  "/change-password",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new Auth(req, res).changePassword()
);

module.exports = router;