const pool = require("../db");

// Create Manager or Fresher
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, manager_id } = req.body;

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, department, manager_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, role, department`,
      [name, email, hashedPassword, role, department, manager_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, department, manager_id FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin Dashboard Overview
exports.getAdminDashboard = async (req, res) => {
  try {

    // Total Users by Role
    const users = await pool.query(`
      SELECT role, COUNT(*) 
      FROM users 
      GROUP BY role
    `);

    // Department-wise Average Score
    const departmentScores = await pool.query(`
      SELECT u.department, AVG(s.total_score) as avg_score
      FROM users u
      JOIN scores s ON u.id = s.user_id
      WHERE u.role = 'fresher'
      GROUP BY u.department
    `);

    // Total Simulations
    const simulations = await pool.query(`
      SELECT COUNT(*) FROM simulations
    `);

    // AI Usage Count
    const aiUsage = await pool.query(`
      SELECT COUNT(*) FROM ai_logs
    `);

    res.json({
      usersByRole: users.rows,
      departmentPerformance: departmentScores.rows,
      totalSimulations: simulations.rows[0].count,
      totalAIInteractions: aiUsage.rows[0].count
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};