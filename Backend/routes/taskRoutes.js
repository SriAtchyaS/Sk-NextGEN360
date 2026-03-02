const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { verifyToken } = require("../middleware/authMiddleware");

router.put(
  "/complete/:taskId",
  verifyToken,
  taskController.markTaskCompleted
);

module.exports = router;