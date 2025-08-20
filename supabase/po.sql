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

-- อ่านได้เฉพาะ admin เห็นได้ทั้งหมด หรือ user มี company_id ตรงกับ company_id ของ PO
CREATE POLICY "Read admin or user with matching company_id"
ON po
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR company_id = po.company_id
      )
  )
);

CREATE POLICY "Allow insert"
ON po
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow update"
ON po
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
);