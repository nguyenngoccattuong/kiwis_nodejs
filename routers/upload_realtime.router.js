const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const UploadRealTimeController = require("../controllers/upload_realtime.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { tryCatch } = require("../utils/trycath.util");

router.post(
  "/create",
  authMiddleware,
  upload.single("file"),
  tryCatch((req, res) =>
    new UploadRealTimeController(req, res).uploadRealTime()
  )
);

module.exports = router;
