const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const aiController = require("../controllers/aiController");

router.post(
  "/ask",
  authMiddleware.verifyToken,
  aiController.askAI
);

module.exports = router;