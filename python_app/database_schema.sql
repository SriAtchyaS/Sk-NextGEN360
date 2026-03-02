-- Database Schema for SK NextGen 360

-- Tasks table (replaces learning_topics concept)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(500) NOT NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, completed
    mock_test_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL
);

-- Task subtopics (from Excel upload)
CREATE TABLE IF NOT EXISTS task_subtopics (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    subtopic VARCHAR(500) NOT NULL,
    sequence_order INTEGER NOT NULL
);

-- Mock tests table (updated)
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS generated_by_ai BOOLEAN DEFAULT false;

-- Mock test results (updated)
ALTER TABLE mock_test_results ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_task_subtopics_task_id ON task_subtopics(task_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_task_id ON mock_tests(task_id);
