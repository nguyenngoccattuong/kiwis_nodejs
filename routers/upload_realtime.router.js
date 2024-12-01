const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const UploadRealTimeController = require("../controllers/upload_realtime.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { tryCatch } = require("../utils/trycath.util");

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  tryCatch((req, res) =>
    new UploadRealTimeController(req, res).userUploadRealtime()
  )
);

router.get(
  "/",
  authMiddleware,
  tryCatch((req, res) => new UploadRealTimeController(req, res).userGetAllRealtime())
);

router.get(
  "/group-all",
  authMiddleware,
  tryCatch((req, res) => new UploadRealTimeController(req, res).groupGetAllRealtime())
);

router.delete(
  "/delete/:realtimePostId",
  authMiddleware,
  tryCatch((req, res) => new UploadRealTimeController(req, res).deleteUploadRealtime(req.params.realtimePostId))
);

module.exports = router;
