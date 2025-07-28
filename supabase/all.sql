-- ตาราง companies สำหรับเก็บข้อมูลบริษัท
CREATE TABLE IF NOT EXISTS companies (
  company_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL
);

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

-- ตาราง employee_course_records สำหรับเก็บข้อมูลการอบรมพนักงาน
CREATE TABLE employee_course_records (
  employee_course_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES training_courses(course_id) ON DELETE CASCADE,
  date_completed DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง employee_status_types สำหรับประเภทสถานะพนักงาน
CREATE TABLE IF NOT EXISTS employee_status_types (
  status_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_code VARCHAR(5) NOT NULL,
  status_name VARCHAR(20) NOT NULL
);

-- ตาราง employees สำหรับเก็บข้อมูลพนักงาน
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

-- ตาราง functions สำหรับเก็บข้อมูลแผนก
CREATE TABLE functions (
  function_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  function_name VARCHAR(100) NOT NULL
);

-- ตาราง job_positions สำหรับเก็บข้อมูลตำแหน่งงาน
CREATE TABLE IF NOT EXISTS job_positions (
  job_position_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_position_name VARCHAR(100) NOT NULL
);

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

-- ตาราง position_courses สำหรับเชื่อมโยงตำแหน่งงานกับคอร์สอบรม
CREATE TABLE IF NOT EXISTS position_courses (
  job_position_id INT REFERENCES job_positions(job_position_id),
  course_id INT REFERENCES training_courses(course_id),
  PRIMARY KEY (job_position_id, course_id)
);

-- ตาราง training_courses สำหรับเก็บข้อมูลหลักสูตรการฝึกอบรม
CREATE TABLE IF NOT EXISTS training_courses (
  course_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  validity_period_days INT NOT NULL DEFAULT 30
);

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