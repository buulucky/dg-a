-- ตาราง employee_contracts สำหรับเก็บข้อมูลสัญญาจ้างพนักงาน
CREATE TABLE employee_contracts (
  employee_contract_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id),
  po_id INT NOT NULL REFERENCES po(po_id),
  status_id INT NOT NULL REFERENCES employee_status_types(status_id),
  employee_code VARCHAR(50) NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  note TEXT
);

-- สร้าง Trigger เพื่อตรวจสอบไม่ให้มีสัญญาที่ Active ซ้ำกันสำหรับพนักงานเดียวกัน
CREATE OR REPLACE FUNCTION prevent_duplicate_active_contracts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date IS NULL OR NEW.end_date > CURRENT_DATE THEN
    IF EXISTS (
      SELECT 1 FROM employee_contracts
      WHERE employee_id = NEW.employee_id
        AND employee_contract_id != COALESCE(NEW.employee_contract_id, 0)
        AND (end_date IS NULL OR end_date > CURRENT_DATE)
    ) THEN
      RAISE EXCEPTION 'พนักงานคนนี้มีสัญญาที่ยัง Active อยู่แล้ว!';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_no_duplicate_active_contracts
BEFORE INSERT OR UPDATE ON employee_contracts
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_active_contracts();
