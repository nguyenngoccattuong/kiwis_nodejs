const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware");

const PlanController = require("../controllers/plan.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { tryCatch } = require("../utils/trycath.util");

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  tryCatch((req, res) => new PlanController(req, res).createPlan())
);

router.get(
  "/",
  authMiddleware,
  tryCatch((req, res) => new PlanController(req, res).findAllPlansByUserId())
);

router.get(
  "/group/:groupId",
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
  upload.single("file"),
  tryCatch((req, res) =>
    new PlanController(req, res).updatePlan(req.params.planId)
  )
);

router.put(
  "/plan-location/:planLocationId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).updateAllPlanLocation(req.params.planLocationId)
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
  "/completed/:planId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).setPlanCompleted(req.params.planId)
  )
);

router.put(
  "/start/:planId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).setPlanStart(req.params.planId)
  )
);

router.post(
  "/location/:planId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).addPlanLocation(req.params.planId)
  )
);

router.put(
  "/location/:planLocationId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).updatePlanLocation(req.params.planLocationId)
  )
);

router.delete(
  "/location/:planLocationId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).deletePlanLocation(req.params.planLocationId)
  )
);

router.post(
  "/post/:planId",
  authMiddleware,
  upload.single("file"),
  tryCatch((req, res) =>
    new PlanController(req, res).addRealtimeImageToPlan(req.params.planId)
  )
);

router.delete(
  "/post/:realtimePostId",
  authMiddleware,
  tryCatch((req, res) =>
    new PlanController(req, res).deleteRealtimeImageFromPlan(
      req.params.realtimePostId
    )
  )
);

module.exports = router;
