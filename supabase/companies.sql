-- ตาราง companies สำหรับเก็บข้อมูลบริษัท
CREATE TABLE IF NOT EXISTS companies (
  company_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on companies"
  ON companies
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;