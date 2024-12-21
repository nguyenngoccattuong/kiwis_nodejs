const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const TaskController = require("../controllers/task.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { tryCatch } = require("../utils/trycath.util");

router.post(
  "/",
  authMiddleware,
  tryCatch((req, res) => new TaskController(req, res).createTask())
);

router.get(
  "/:taskId",
  authMiddleware,
  tryCatch((req, res) => new TaskController(req, res).getTaskById())
);

router.put(
  "/:taskId",
  authMiddleware,
  tryCatch((req, res) => new TaskController(req, res).updateTask())
);

router.delete(
  "/:taskId",
  authMiddleware,
  tryCatch((req, res) => new TaskController(req, res).deleteTask())
);

router.put(
  "/:taskId/plan-location",
  authMiddleware,
  tryCatch((req, res) => new TaskController(req, res).addPlanLocation())
);

router.get(
  "/plan/:planId",
  authMiddleware,
  tryCatch((req, res) => new TaskController(req, res).getTasksByPlanId())
);

module.exports = router;


