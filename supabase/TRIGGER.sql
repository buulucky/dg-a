-- ✅ ฟังก์ชันกลางสำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ Trigger สำหรับ user_profiles
CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ✅ Trigger สำหรับ employee_contracts
CREATE TRIGGER set_updated_at_employee_contracts
BEFORE UPDATE ON employee_contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ✅ Trigger สำหรับ employee_course_records
CREATE TRIGGER set_updated_at_employee_course_records
BEFORE UPDATE ON employee_course_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ✅ Trigger สำหรับ employees
CREATE TRIGGER set_updated_at_employees
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ✅ Trigger สำหรับ po
CREATE TRIGGER set_updated_at_po
BEFORE UPDATE ON po
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
