const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const mockTestController = require("../controllers/mockTestController");

router.post("/create", verifyToken, mockTestController.createMockTest);
router.get("/start/:testId", verifyToken, mockTestController.startMockTest);
router.post("/submit", verifyToken, mockTestController.submitMockTest);

module.exports = router;