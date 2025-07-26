CREATE TABLE employee_profiles (
  employee_company_profile_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id),
  company_id INT NOT NULL REFERENCES companies(company_id),
  employee_code VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ฟังก์ชันสำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_employee_profiles()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ที่ใช้ฟังก์ชันข้างบน
CREATE TRIGGER set_updated_at_employee_profiles
BEFORE UPDATE ON employee_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_employee_profiles();
