const express = require("express");
const router = express.Router();

const Notification = require("../controllers/notification.controller");
const { tryCatch } = require("../utils/trycath.util");
const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Notification(req, res).findAll())
);

router.get(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new Notification(req, res).findById(req.params.uid))
);

router.post(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Notification(req, res).changeAvatar())
);

router.patch(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Notification(req, res).update())
);

router.delete(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new Notification(req, res).update(req.params.uid))
);

module.exports = router;