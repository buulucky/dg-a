-- สร้างตาราง user_profiles สำหรับจัดเก็บข้อมูลผู้ใช้และสถานะ
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_id BIGINT REFERENCES companies(company_id),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Trigger สำหรับอัปเดต updated_at เมื่อมีการแก้ไขข้อมูล user_profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- เปิด RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW_LEVEL_SECURITY;

CREATE POLICY "ผู้ใช้สามารถดูข้อมูลตัวเองได้" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "ผู้ใช้สามารถแก้ไขข้อมูลตัวเองได้" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin สามารถดูข้อมูลทุกคนได้" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admin สามารถแก้ไขข้อมูลทุกคนได้" ON user_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "ผู้ใช้สามารถสร้างโปรไฟล์ตัวเองได้" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ตาราง training_courses สำหรับเก็บข้อมูลหลักสูตรการฝึกอบรม
CREATE TABLE IF NOT EXISTS training_courses (
  course_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  validity_period_days INT NOT NULL DEFAULT 30
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on training_courses"
  ON training_courses
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;

-- ตาราง position_courses สำหรับเชื่อมโยงตำแหน่งงานกับคอร์สอบรม
CREATE TABLE IF NOT EXISTS position_courses (
  job_position_id INT REFERENCES job_positions(job_position_id),
  course_id INT REFERENCES training_courses(course_id),
  PRIMARY KEY (job_position_id, course_id)
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on position_courses"
  ON position_courses
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE position_courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE po (
  po_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  po_number VARCHAR,
  company_id INT NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  function_id INT NOT NULL REFERENCES functions(function_id) ON DELETE RESTRICT,
  job_position_id INT NOT NULL REFERENCES job_positions(job_position_id) ON DELETE RESTRICT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_po
BEFORE UPDATE ON po
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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

CREATE TABLE employees (
  employee_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  personal_id VARCHAR(13) NOT NULL UNIQUE,
  prefix_th VARCHAR(50) NOT NULL,
  first_name_th VARCHAR(50) NOT NULL,
  last_name_th VARCHAR(50) NOT NULL,
  prefix_en VARCHAR(50),
  first_name_en VARCHAR(50),
  last_name_en VARCHAR(50),
  birth_date DATE NOT NULL,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on employees"
  ON employees
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- สร้าง Trigger สำหรับอัปเดต updated_at เมื่อมีการแก้ไขข้อมูล
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ตาราง employee_status_types สำหรับประเภทสถานะพนักงาน
CREATE TABLE IF NOT EXISTS employee_status_types (
  status_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_code VARCHAR(5) NOT NULL,
  status_name VARCHAR(20) NOT NULL
);

-- ให้ทุกคน SELECT ได้
CREATE POLICY "Allow public select on employee_status_types"
  ON employee_status_types
  FOR SELECT
  USING (true);

-- เปิด RLS (Row Level Security)
ALTER TABLE employee_status_types ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE employee_course_records (
  employee_course_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES training_courses(course_id) ON DELETE CASCADE,
  date_completed DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- สร้าง Trigger สำหรับอัปเดต updated_at เมื่อมีการแก้ไขข้อมูล
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_employee_course_records
BEFORE UPDATE ON employee_course_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE employee_contracts (
  employee_contract_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id),
  po_id INT NOT NULL REFERENCES po(po_id),
  status_id INT NOT NULL REFERENCES employee_status_types(status_id),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  note TEXT
);

-- สร้าง Trigger สำหรับอัปเดต updated_at เมื่อมีการแก้ไขข้อมูล
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_employee_contracts
BEFORE UPDATE ON employee_contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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