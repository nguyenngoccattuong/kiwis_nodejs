const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const User = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { tryCatch } = require("../utils/trycath.util");

// User
router.get(
  "/current",
  authMiddleware,
  tryCatch((req, res) => new User(req, res).currentUser())
);
router.get(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new User(req, res).findById(req.params.uid))
);
router.post(
  "/change-avatar",
  upload.single("file"),
  authMiddleware,
  tryCatch((req, res) => new User(req, res).changeAvatar())
);
router.post(
  "/email-verified",
  authMiddleware,
  tryCatch((req, res) => new User(req, res).emailVerified())
);

module.exports = router;
