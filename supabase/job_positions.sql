-- ตาราง job_positions สำหรับเก็บข้อมูลตำแหน่งงาน
CREATE TABLE IF NOT EXISTS job_positions (
  job_position_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_position_name VARCHAR(100) NOT NULL
);