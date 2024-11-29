const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const PlanController = require("../controllers/plan.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { tryCatch } = require("../utils/trycath.util");

router.post(
  "/create",
  authMiddleware,
  tryCatch((req, res) => new PlanController(req, res).createPlan())
);

router.get(
  "/user-all",
  authMiddleware,
  tryCatch((req, res) => new PlanController(req, res).findAllPlansByUserId())
);

router.get(
  "/group-all/:groupId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).findAllPlansByGroupId(req.params.groupId)
  )
);

router.get(
  "/:planId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).findPlanById(req.params.planId)
  )
);

router.put(
  "/:planId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).updatePlan(req.params.planId)
  )
);

router.delete(
  "/:planId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).deletePlan(req.params.planId)
  )
);

router.put(
  "/:planId/set-completed",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).setPlanCompleted(req.params.planId)
  )
);

router.post(
  "/:planId/add-location",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).addPlanLocation(req.params.planId)
  )
);

router.put(
  "/:planId/update-location/:planLocationId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).updatePlanLocation(req.params.planLocationId)
  )
);

router.delete(
  "/:planId/delete-location/:planLocationId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).deletePlanLocation(req.params.planLocationId)
  )
);

router.post(
  "/:planId/add-realtime-image",
  authMiddleware,
  upload.single("file"),
  tryCatch((req, res) =>
    new PlanController(req, res).addRealtimeImageToPlan(req.params.planId)
  )
);

router.delete(
  "/:planId/delete-realtime-image/:realtimePostId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).deleteRealtimeImageFromPlan(
      req.params.realtimePostId
    )
  )
);

module.exports = router;
