const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// Only Admin can access
router.post("/create-user", verifyToken, authorizeRoles("admin"), adminController.createUser);
router.get("/users", verifyToken, authorizeRoles("admin"), adminController.getAllUsers);

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("admin"),
  adminController.getAdminDashboard
);
module.exports = router;

