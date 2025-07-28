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