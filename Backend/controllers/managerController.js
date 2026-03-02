const pool = require("../db");

// Manager uploads question
exports.addQuestion = async (req, res) => {
  try {
    const {
      department,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option
    } = req.body;

    await pool.query(
      `INSERT INTO mock_questions
       (department, question, option_a, option_b, option_c, option_d, correct_option, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        department,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        req.user.id
      ]
    );

    res.json({ message: "Question added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get random 10 questions
exports.getRandomQuestions = async (req, res) => {
  try {
    const { department } = req.query;

    const result = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d
       FROM mock_questions
       WHERE department = $1
       ORDER BY RANDOM()
       LIMIT 10`,
      [department]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Submit test
exports.submitMockTest = async (req, res) => {
  try {
    const { answers } = req.body;
    // answers = [{ question_id: 1, selected: "A" }, ...]

    let score = 0;

    for (let ans of answers) {
      const result = await pool.query(
        `SELECT correct_option FROM mock_questions WHERE id = $1`,
        [ans.question_id]
      );

      if (result.rows[0].correct_option === ans.selected) {
        score++;
      }
    }

    res.json({
      totalQuestions: answers.length,
      score,
      percentage: (score / answers.length) * 100
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get freshers assigned to this manager
exports.getMyFreshers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, department, manager_id
       FROM users
       WHERE role = 'fresher' AND manager_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get freshers assigned to logged-in manager
exports.getMyFreshers = async (req, res) => {
  try {
    const managerId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, email, department, manager_id
       FROM users
       WHERE role = 'fresher'
       AND manager_id = $1`,
      [managerId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};