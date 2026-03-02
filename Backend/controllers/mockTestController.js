const pool = require("../db");


// ============================================
// ✅ 1️⃣ MANAGER CREATES MOCK TEST (20 QUESTIONS)
// ============================================
const createMockTest = async (req, res) => {
  try {
    const { topic, questions } = req.body;

    if (!topic || !questions || questions.length !== 20) {
      return res.status(400).json({
        error: "Topic and exactly 20 questions are required"
      });
    }

    const managerId = req.user.id;

    // Insert mock test
    const test = await pool.query(
      "INSERT INTO mock_tests (topic, manager_id) VALUES ($1,$2) RETURNING id",
      [topic, managerId]
    );

    const testId = test.rows[0].id;

    // Insert questions
    for (let q of questions) {
      await pool.query(
        `INSERT INTO mock_test_questions
        (mock_test_id, question, option_a, option_b, option_c, option_d, correct_answer)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          testId,
          q.question,
          q.optionA,
          q.optionB,
          q.optionC,
          q.optionD,
          q.correctAnswer
        ]
      );
    }

    res.json({
      message: "Mock test created successfully",
      testId
    });

  } catch (err) {
    console.error("Create Mock Test Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ============================================
// ✅ 2️⃣ FRESHER STARTS MOCK TEST (RANDOM 10)
// ============================================
const startMockTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const questions = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d
       FROM mock_test_questions
       WHERE mock_test_id = $1
       ORDER BY RANDOM()
       LIMIT 10`,
      [testId]
    );

    res.json(questions.rows);

  } catch (err) {
    console.error("Start Mock Test Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ============================================
// ✅ 3️⃣ FRESHER SUBMITS MOCK TEST
// ============================================
const submitMockTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const fresherId = req.user.id;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ error: "Answers are required" });
    }

    let score = 0;

    for (let ans of answers) {
      const correct = await pool.query(
        "SELECT correct_answer FROM mock_test_questions WHERE id = $1",
        [ans.questionId]
      );

      if (
        correct.rows.length > 0 &&
        correct.rows[0].correct_answer === ans.selected
      ) {
        score++;
      }
    }

    const finalScore = (score / answers.length) * 100;

    // Store result
    await pool.query(
      `INSERT INTO mock_test_results (mock_test_id, fresher_id, score)
       VALUES ($1,$2,$3)`,
      [testId, fresherId, finalScore]
    );

    res.json({
      message: "Test submitted successfully",
      score: finalScore
    });

  } catch (err) {
    console.error("Submit Mock Test Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// ============================================
// ✅ EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  createMockTest,
  startMockTest,
  submitMockTest
};