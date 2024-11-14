const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const UploadRealTimeController = require("../controllers/UploadRealTimeController");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/create", authMiddleware, upload.single("file"), (req, res) =>
  new UploadRealTimeController(req, res).uploadRealTime()
);
module.exports = router;
