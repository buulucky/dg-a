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