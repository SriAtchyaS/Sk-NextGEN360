const pool = require("../db");

exports.getMyTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, lt.title 
       FROM tasks t
       JOIN learning_topics lt ON t.topic_id = lt.id
       WHERE t.assigned_to = $1`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start Topic (Timer Start)
exports.startTopic = async (req, res) => {
  try {
    const { topic_id } = req.body;

    await pool.query(
      `INSERT INTO topic_progress (user_id, topic_id, start_time)
       VALUES ($1,$2,NOW())`,
      [req.user.id, topic_id]
    );

    res.json({ message: "Timer started" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete Topic (Timer End + Notes)
exports.completeTopic = async (req, res) => {
  try {
    const { topic_id, notes } = req.body;

    await pool.query(
      `UPDATE topic_progress
       SET end_time = NOW(), completed = true, notes = $1
       WHERE user_id = $2 AND topic_id = $3 AND completed = false`,
      [notes, req.user.id, topic_id]
    );

    res.json({ message: "Topic marked as completed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Calculate Score
exports.calculateScore = async (req, res) => {
  try {
    const userId = req.user.id;

    const progress = await pool.query(
      `SELECT start_time, end_time
       FROM topic_progress
       WHERE user_id = $1 AND completed = true
       ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (progress.rows.length === 0) {
      return res.status(400).json({ message: "No completed topic found" });
    }

    const { start_time, end_time } = progress.rows[0];

    const timeSpentHours =
      (new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60);

    let timeScore = timeSpentHours <= 5 ? 20 : 10;
    let completionScore = 20;
    let taskScore = 20;
    let clarityScore = 20;
    let simulationScore = 20;

    let totalScore =
      timeScore +
      completionScore +
      taskScore +
      clarityScore +
      simulationScore;

    await pool.query(
      `INSERT INTO scores
       (user_id, task_score, speed_score, time_score, clarity_score, simulation_score, total_score)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        userId,
        taskScore,
        20,
        timeScore,
        clarityScore,
        simulationScore,
        totalScore
      ]
    );

    res.json({
      message: "Score calculated successfully",
      totalScore
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit Simulation
exports.submitSimulation = async (req, res) => {
  try {
    const { simulation_id, submission_url } = req.body;

    await pool.query(
      `UPDATE simulations
       SET submission_url = $1, status = 'submitted'
       WHERE id = $2 AND assigned_to = $3`,
      [submission_url, simulation_id, req.user.id]
    );

    res.json({ message: "Simulation submitted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};