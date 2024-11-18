const express = require("express");
const router = express.Router();

const Auth = require("../controllers/auth.controller");
const { tryCatch } = require("../utils/trycath.util");
const authMiddleware = require("../middleware/auth.middleware");

// Auth
router.post(
  "/register",
  tryCatch((req, res) => new Auth(req, res).register())
);
router.post(
  "/login",
  tryCatch(async (req, res) => new Auth(req, res).login())
);
router.post(
  "/login-with-otp",
  tryCatch((req, res) => new Auth(req, res).loginWithOtp())
);
router.post(
  "/resend-otp",
  tryCatch((req, res) => new Auth(req, res).resendOtp())
);
router.post(
  "/logout",
  tryCatch((req, res) => new Auth(req, res).logout())
);
router.post(
  "/check-token",
  tryCatch((req, res) => new Auth(req, res).appCheckVerification())
);
router.post(
  "/test-login",
  tryCatch((req, res) => new Auth(req, res).testLogin())
);
router.post(
  "/revoke-token",
  tryCatch((req, res) => new Auth(req, res).revokeToken())
);
router.post(
  "/reset-password",
  tryCatch((req, res) => new Auth(req, res).resetPassword())
);
router.post(
  "/forgot-password",
  tryCatch((req, res) => new Auth(req, res).forgotPassword())
);
router.post(
  "/change-password",
  authMiddleware,
  tryCatch((req, res) => new Auth(req, res).changePassword())
);

module.exports = router;