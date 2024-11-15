const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware")

const Auth = require("../controllers/auth.controller");
const User = require("../controllers/user.controller");
const authMiddleware = require('../middleware/auth.middleware');

// User
router.get(
  "/current",
  authMiddleware,
  (req, res) => new User(req, res).currentUser()
);
router.get(
  "/:uid",
  authMiddleware,
  (req, res) => new User(req, res).findById(req.params.uid)
);
router.post(
  "/change-avatar",
  upload.single("file"),
  authMiddleware,
  (req, res) => new User(req, res).changeAvatar()
);
router.post(
  "/email-verified",
  authMiddleware,
  (req, res) => new User(req, res).emailVerified()
);

module.exports = router;