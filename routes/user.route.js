const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware")

const Auth = require("../controllers/AuthController");
const User = require("../controllers/UserController");


// User
router.get(
  "/current",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).currentUser()
);
router.get(
  "/:uid",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).findById(req.params.uid)
);
router.post(
  "/change-avatar",
  upload.single("file"),
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).changeAvatar()
);
router.post(
  "/email-verified",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).emailVerified()
);

module.exports = router;