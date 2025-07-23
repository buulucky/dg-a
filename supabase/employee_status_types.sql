-- ตาราง employee_status_types สำหรับประเภทสถานะพนักงาน
CREATE TABLE IF NOT EXISTS employee_status_types (
  status_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_code VARCHAR(5) NOT NULL,
  status_name VARCHAR(20) NOT NULL
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on employee_status_types"
  ON employee_status_types
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE employee_status_types ENABLE ROW LEVEL SECURITY;