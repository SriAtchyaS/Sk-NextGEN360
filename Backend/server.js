const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Backend + Database Connected",
      time: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

const protectedRoutes = require("./routes/protectedRoutes");
app.use("/api/dashboard", protectedRoutes);



const mockTestRoutes = require("./routes/mockTestRoutes");
app.use("/api/mock-test", mockTestRoutes);

const fresherRoutes = require("./routes/fresherRoutes");
app.use("/api/fresher", fresherRoutes);

const managerRoutes = require("./routes/managerRoutes");
app.use("/api/manager", managerRoutes);


const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

const runDailySummary = require("./services/dailySummaryJob");
runDailySummary();
const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/test", (req, res) => {
  res.send("Server is working");
});