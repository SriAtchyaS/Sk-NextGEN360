const cron = require("node-cron");
const pool = require("../db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const runMockTestDailyMail = () => {

  cron.schedule("0 18 * * *", async () => {
    console.log("Sending Mock Test Results...");

    const results = await pool.query(`
      SELECT r.score, u.name AS fresher_name, m.email AS manager_email
      FROM mock_test_results r
      JOIN users u ON r.fresher_id = u.id
      JOIN mock_tests t ON r.mock_test_id = t.id
      JOIN users m ON t.manager_id = m.id
      WHERE DATE(r.created_at) = CURRENT_DATE
    `);

    for (let row of results.rows) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: row.manager_email,
        subject: "Daily Mock Test Result",
        text: `
Fresher: ${row.fresher_name}
Score: ${row.score}%
        `
      });
    }
  });

};

module.exports = runMockTestDailyMail;