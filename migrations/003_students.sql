-- Quizzes Week — students, and attributing each submission to one

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  student_code VARCHAR(50) NOT NULL UNIQUE,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_group ON students(group_id);

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
