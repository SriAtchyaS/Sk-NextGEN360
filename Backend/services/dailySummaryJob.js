const cron = require("node-cron");
const pool = require("../db");
const { sendManagerReport } = require("./notificationService");

const runDailySummary = () => {
  // Runs every day at 6 PM
  cron.schedule("0 18 * * *", async () => {
    console.log("Running Daily Summary Job...");

    try {
      const freshers = await pool.query(
        "SELECT id, name, manager_id FROM users WHERE role = 'fresher'"
      );

      for (let fresher of freshers.rows) {
        const todayScore = await pool.query(
          `SELECT total_score FROM scores
           WHERE user_id = $1
           ORDER BY created_at DESC LIMIT 1`,
          [fresher.id]
        );

        const aiLog = await pool.query(
          `SELECT response FROM ai_logs
           WHERE user_id = $1
           ORDER BY created_at DESC LIMIT 1`,
          [fresher.id]
        );

        const manager = await pool.query(
          "SELECT email FROM users WHERE id = $1",
          [fresher.manager_id]
        );

        if (manager.rows.length > 0) {
          const emailText = `
Daily Report for ${fresher.name}

Score: ${todayScore.rows[0]?.total_score || "N/A"}

AI Summary:
${aiLog.rows[0]?.response || "No summary available"}
`;

          await sendManagerReport(
            manager.rows[0].email,
            "Daily Fresher Learning Report",
            emailText
          );
        }
      }

    } catch (err) {
      console.error("Daily Job Error:", err);
    }
  });
};

module.exports = runDailySummary;