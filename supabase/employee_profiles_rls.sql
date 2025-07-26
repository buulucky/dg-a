-- Policy ให้ admin ดูข้อมูลพนักงานได้ทุกบริษัท
CREATE POLICY "Admin can view all employees" ON employee_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
        AND role = 'admin' 
        AND status = 'approved'
    )
  );
-- เปิด RLS สำหรับ employee_profiles
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;

-- Policy ให้ user เห็นเฉพาะข้อมูลพนักงานในบริษัทตัวเอง
CREATE POLICY "Users can view employees in their company" ON employee_profiles
  FOR SELECT TO authenticated
  USING (
    company_id = (
      SELECT company_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy ให้ user เพิ่ม/แก้ไขข้อมูลพนักงานในบริษัทตัวเอง
CREATE POLICY "Users can insert employees in their company" ON employee_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = (
      SELECT company_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update employees in their company" ON employee_profiles
  FOR UPDATE TO authenticated
  USING (
    company_id = (
      SELECT company_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );
