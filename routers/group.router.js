const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const Group = require("../controllers/group.controller");
const { tryCatch } = require("../utils/trycath.util");
const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).findAll())
);

router.post(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).createGroup())
);

router.put(
  "/group-avatar/:uid",
  upload.single("file"),
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).setGroupAvatar(req.params.uid))
);

router.delete(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).leaveGroup(req.params.uid))
);

router.put(
  "/:uid",
  upload.single("file"),
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).editGroup(req.params.uid))
);

module.exports = router;
