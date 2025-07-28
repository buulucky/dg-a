-- ตาราง employee_status_types สำหรับประเภทสถานะพนักงาน
CREATE TABLE IF NOT EXISTS employee_status_types (
  status_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_code VARCHAR(5) NOT NULL,
  status_name VARCHAR(20) NOT NULL
);