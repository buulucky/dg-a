-- ตาราง po สำหรับเก็บข้อมูลต PO
CREATE TABLE po (
  po_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  po_number VARCHAR,
  company_id INT NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  function_id INT NOT NULL REFERENCES functions(function_id) ON DELETE RESTRICT,
  job_position_id INT NOT NULL REFERENCES job_positions(job_position_id) ON DELETE RESTRICT,
  employee_count INT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- เปิด RLS ก่อน
ALTER TABLE po ENABLE ROW LEVEL SECURITY;

-- อ่านได้ทุกคน
CREATE POLICY "Allow read for all"
ON po
FOR SELECT
USING (true);

-- เพิ่มได้เฉพาะ admin
CREATE POLICY "Allow insert for admin only"
ON po
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- แก้ไขได้เฉพาะ admin
CREATE POLICY "Allow update for admin only"
ON po
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);