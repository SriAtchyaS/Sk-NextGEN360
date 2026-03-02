const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const managerController = require("../controllers/managerController");

// Manager adds question
router.post(
  "/add-question",
  verifyToken,
  authorizeRoles("manager"),
  managerController.addQuestion
);

// Get 10 random questions
router.get(
  "/random-questions",
  verifyToken,
  authorizeRoles("manager"),
  managerController.getRandomQuestions
);

// Submit test
router.post(
  "/submit-test",
  verifyToken,
  authorizeRoles("manager"),
  managerController.submitMockTest
);

module.exports = router;

// Get freshers assigned to this manager
router.get(
  "/my-freshers",
  verifyToken,
  authorizeRoles("manager"),
  managerController.getMyFreshers
);

