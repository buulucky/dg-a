-- ตาราง training_courses สำหรับเก็บข้อมูลหลักสูตรการฝึกอบรม
CREATE TABLE IF NOT EXISTS training_courses (
  course_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  validity_period_days INT NOT NULL DEFAULT 30
);