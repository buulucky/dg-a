CREATE TABLE employee_course_records (
  employee_course_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES training_courses(course_id) ON DELETE CASCADE,
  date_completed DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- สร้าง Trigger สำหรับอัปเดต updated_at เมื่อมีการแก้ไขข้อมูล
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_employee_course_records
BEFORE UPDATE ON employee_course_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
