-- ตาราง employee_course_records สำหรับเก็บข้อมูลการอบรมพนักงาน
CREATE TABLE employee_course_records (
  employee_course_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES training_courses(course_id) ON DELETE CASCADE,
  date_completed DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);