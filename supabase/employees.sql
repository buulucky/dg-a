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

  blacklist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

create policy "admin can update"
on employees
for update
using (EXISTS (
  select 1 from user_profiles
  where id = auth.uid() and role = 'admin'
));