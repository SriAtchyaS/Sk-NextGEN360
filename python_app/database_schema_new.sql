-- New tables for task assignment feature (won't conflict with existing tasks table)

-- Task assignments table (new)
CREATE TABLE IF NOT EXISTS task_assignments (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(500) NOT NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    mock_test_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL
);

-- Task subtopics (from Excel upload)
CREATE TABLE IF NOT EXISTS task_assignment_subtopics (
    id SERIAL PRIMARY KEY,
    task_assignment_id INTEGER REFERENCES task_assignments(id) ON DELETE CASCADE,
    subtopic VARCHAR(500) NOT NULL,
    sequence_order INTEGER NOT NULL
);

-- Update mock_tests to support task assignments
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS task_assignment_id INTEGER REFERENCES task_assignments(id) ON DELETE CASCADE;
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS generated_by_ai BOOLEAN DEFAULT false;
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS topic VARCHAR(500);
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id);

-- Mock test results
ALTER TABLE mock_test_results ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by ON task_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_task_assignment_subtopics_task_id ON task_assignment_subtopics(task_assignment_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_task_assignment_id ON mock_tests(task_assignment_id);
