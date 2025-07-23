-- ตาราง training_courses สำหรับเก็บข้อมูลหลักสูตรการฝึกอบรม
CREATE TABLE IF NOT EXISTS training_courses (
  course_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  validity_period_days INT NOT NULL DEFAULT 30
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on training_courses"
  ON training_courses
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;