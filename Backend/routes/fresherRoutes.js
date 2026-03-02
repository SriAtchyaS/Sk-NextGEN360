const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const fresherController = require("../controllers/fresherController");

// Only Fresher
router.get("/tasks", verifyToken, authorizeRoles("fresher"), fresherController.getMyTasks);

router.post("/start-topic", verifyToken, authorizeRoles("fresher"), fresherController.startTopic);

router.post("/complete-topic", verifyToken, authorizeRoles("fresher"), fresherController.completeTopic);

module.exports = router;

router.post(
  "/calculate-score",
  verifyToken,
  authorizeRoles("fresher"),
  fresherController.calculateScore
);

router.post(
  "/submit-simulation",
  verifyToken,
  authorizeRoles("fresher"),
  fresherController.submitSimulation
);