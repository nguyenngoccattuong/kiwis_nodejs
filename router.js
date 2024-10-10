const express = require("express");
const router = express.Router();

const Auth = require("./controllers/AuthController");
const User = require("./controllers/UserController");

router.post("/auth/login", (req, res) => new Auth(req, res).login());

router.post("/auth/logout", (req, res) => new Auth(req, res).logout());

router.get(
  "/user/findAll",
  (req, res, next) => new Auth(req, res, next).checkToken(),
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).findAll()
);
router.get(
  "/user/findOne/:id",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).findOne(req.params.id)
);
router.post(
  "/user/create",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).create()
);
router.put(
  "/user/update/:id",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).update(req.params.id)
);
router.delete(
  "/user/delete/:id",
  (req, res, next) => new Auth(req, res, next).authorization(),
  (req, res) => new User(req, res).delete(req.params.id)
);

module.exports = router;
