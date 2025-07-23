-- ตาราง position_courses สำหรับเชื่อมโยงตำแหน่งงานกับคอร์สอบรม
CREATE TABLE IF NOT EXISTS position_courses (
  job_position_id INT REFERENCES job_positions(job_position_id),
  course_id INT REFERENCES training_courses(course_id),
  PRIMARY KEY (job_position_id, course_id)
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on position_courses"
  ON position_courses
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE position_courses ENABLE ROW LEVEL SECURITY;