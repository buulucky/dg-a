-- ตาราง employee_course_records สำหรับเก็บข้อมูลการอบรมพนักงาน
CREATE TABLE employee_course_records (
  employee_course_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES training_courses(course_id) ON DELETE CASCADE,
  date_completed DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Allow everyone to read
create policy "Allow read for all"
on employee_course_records
for select
using (true);

-- Allow only admin to insert
create policy "Allow insert for admin only"
on employee_course_records
for insert
with check (EXISTS (
  select 1 from user_profiles
  where id = auth.uid() and role = 'admin'
));

-- Allow only admin to update
create policy "Allow update for admin only"
on employee_course_records
for update
using (EXISTS (
  select 1 from user_profiles
  where id = auth.uid() and role = 'admin'
));