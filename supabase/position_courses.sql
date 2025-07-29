-- ตาราง position_courses สำหรับเชื่อมโยงตำแหน่งงานกับคอร์สอบรม
CREATE TABLE IF NOT EXISTS position_courses (
  job_position_id INT REFERENCES job_positions(job_position_id),
  course_id INT REFERENCES training_courses(course_id),
  PRIMARY KEY (job_position_id, course_id)
);

-- Enable RLS
ALTER TABLE position_courses ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ admin สามารถทำทุกอย่างได้
CREATE POLICY "Admin can manage position_courses" ON position_courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- Policy สำหรับ user ทั่วไปสามารถดูได้อย่างเดียว
CREATE POLICY "Users can view position_courses" ON position_courses
FOR SELECT USING (true); 