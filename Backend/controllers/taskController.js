exports.markTaskCompleted = async (req, res) => {
  try {
    const { taskId } = req.params;

    // 1️⃣ Mark task completed
    await pool.query(
      "UPDATE tasks SET completed = true WHERE id = $1",
      [taskId]
    );

    // 2️⃣ Get fresher & manager details
    const taskInfo = await pool.query(
      "SELECT assigned_to FROM tasks WHERE id = $1",
      [taskId]
    );

    const fresherId = taskInfo.rows[0].assigned_to;

    const fresher = await pool.query(
      "SELECT manager_id FROM users WHERE id = $1",
      [fresherId]
    );

    const managerId = fresher.rows[0].manager_id;

    // 3️⃣ ADD YOUR WEEKEND LOGIC HERE 👇
    const today = new Date();
    const day = today.getDay();

    if (day === 0 || day === 6) {

      const pendingTasks = await pool.query(
        `SELECT COUNT(*) FROM tasks
         WHERE assigned_to = $1 AND completed = false`,
        [fresherId]
      );

      if (pendingTasks.rows[0].count == 0) {

        const existingReview = await pool.query(
          `SELECT * FROM review_sessions
           WHERE fresher_id = $1 AND status = 'scheduled'`,
          [fresherId]
        );

        if (existingReview.rows.length === 0) {

          await pool.query(
            `INSERT INTO review_sessions
             (fresher_id, manager_id, scheduled_date, status)
             VALUES ($1,$2,CURRENT_DATE,'scheduled')`,
            [fresherId, managerId]
          );

          // calendar + email logic here
        }
      }
    }

    // 4️⃣ Finally send response
    res.json({ message: "Task marked as completed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};