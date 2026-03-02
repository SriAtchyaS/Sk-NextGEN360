const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Admin only
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

// Manager only
router.get("/manager", verifyToken, authorizeRoles("manager"), (req, res) => {
  res.json({ message: "Welcome Manager Dashboard" });
});

// Fresher only
router.get("/fresher", verifyToken, authorizeRoles("fresher"), (req, res) => {
  res.json({ message: "Welcome Fresher Dashboard" });
});

module.exports = router;