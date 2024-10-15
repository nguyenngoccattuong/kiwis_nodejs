const express = require("express");
const router = express.Router();

const Auth = require("./controllers/AuthController");

// Auth
router.post("/auth/register", (req, res) => new Auth(req, res).register());
router.post("/auth/login", (req, res) => new Auth(req, res).login());
router.post("/auth/logout", (req, res) => new Auth(req, res).logout());
router.post("/auth/check-token", (req, res) => new Auth(req, res).appCheckVerification());
router.post("/auth/test-login", (req, res) => new Auth(req, res).testLogin());
module.exports = router;
