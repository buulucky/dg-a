-- ตาราง position_courses สำหรับเชื่อมโยงตำแหน่งงานกับคอร์สอบรม
CREATE TABLE IF NOT EXISTS position_courses (
  job_position_id INT REFERENCES job_positions(job_position_id),
  course_id INT REFERENCES training_courses(course_id),
  PRIMARY KEY (job_position_id, course_id)
);