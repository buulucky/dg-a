-- ตาราง job_positions สำหรับเก็บข้อมูลตำแหน่งงาน
CREATE TABLE IF NOT EXISTS job_positions (
  job_position_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_position_name VARCHAR(100) NOT NULL
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on job_positions"
  ON job_positions
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;