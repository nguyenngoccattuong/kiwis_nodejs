const express = require("express");
const router = express.Router();

const Auth = require("./controllers/AuthController");
const User = require("./controllers/UserController");

// Auth
router.post("/auth/register", (req, res) => new Auth(req, res).register());
router.post("/auth/login", (req, res) => new Auth(req, res).login());
router.post("/auth/logout", (req, res) => new Auth(req, res).logout());
router.post("/auth/check-token", (req, res) =>
  new Auth(req, res).appCheckVerification()
);
router.post("/auth/test-login", (req, res) => new Auth(req, res).testLogin());
router.post("/auth/revoke-token", (req, res) =>
  new Auth(req, res).revokeToken()
);
router.post("/auth/reset-password", (req, res) =>
  new Auth(req, res).resetPassword()
);
router.post("/auth/forgot-password", (req, res) =>
  new Auth(req, res).forgotPassword()
);
router.post("/auth/change-password", (req, res) =>
  new Auth(req, res).changePassword()
);

// User
router.get(
  "/user/current",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).currentUser()
);
router.get(
  "/user/:uid",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).findById(req.params.uid)
);

module.exports = router;
