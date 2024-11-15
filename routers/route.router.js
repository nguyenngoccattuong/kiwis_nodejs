const express = require("express");
const router = express.Router();

const Route = require("../controllers/route.controller");
const { tryCatch } = require("../utils/trycath.util");
const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Route(req, res).findAll())
);

router.get(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new Route(req, res).findById(req.params.uid))
);

router.post(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Route(req, res).changeAvatar())
);

router.patch(
  "/",
  authMiddleware,
  tryCatch((req, res) => new Route(req, res).update())
);

router.delete(
  "/:uid",
  authMiddleware,
  tryCatch((req, res) => new Route(req, res).update(req.params.uid))
);

module.exports = router;