-- ตาราง functions สำหรับเก็บข้อมูลแผนก
CREATE TABLE functions (
  function_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  function_name VARCHAR(100) NOT NULL
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on functions"
  ON functions
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE functions ENABLE ROW LEVEL SECURITY;