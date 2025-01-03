const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const User = require("../controllers/user.controller");
const FriendShipController = require("../controllers/friend_ship.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { tryCatch } = require("../utils/trycath.util");

// User
router.get(
  "/current",
  authMiddleware,
  tryCatch((req, res) => new User(req, res).currentUser())
);
router.get(
  "/current/:uid",
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

router.put(
  "/update-user",
  authMiddleware,
  tryCatch((req, res) => new User(req, res).updateUser())
);

router.put(
  "/update-fcm-token",
  authMiddleware,
  tryCatch((req, res) => new User(req, res).updateFCMToken())
);

// Friend
router.post(
  "/friend",
  authMiddleware,
  tryCatch((req, res) => new FriendShipController(req, res).addFriend())
);

router.post(
  "/friend-accept",
  authMiddleware,
  tryCatch((req, res) => new FriendShipController(req, res).acceptFriend())
);

router.get(
  "/friend-pending",
  authMiddleware,
  tryCatch((req, res) => new FriendShipController(req, res).findPendingFriendshipByUserId())
);

router.get(
  "/friend",
  authMiddleware,
  tryCatch((req, res) => new FriendShipController(req, res).getFriendList())
);

router.delete(
  "/friend/:friendshipId",
  authMiddleware,
  tryCatch((req, res) => new FriendShipController(req, res).deleteFriendship())
);

module.exports = router;
