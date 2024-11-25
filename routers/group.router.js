const express = require("express");
const router = express.Router();

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

router.patch(
  "/group-avatar/:uid",
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).setGroupAvatar(req.params.uid))
);

router.delete(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).leaveGroup(req.params.uid))
);

router.patch(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new Group(req, res).editGroup(req.params.uid))
);

module.exports = router;