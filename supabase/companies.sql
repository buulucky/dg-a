-- ตาราง companies สำหรับเก็บข้อมูลบริษัท
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เปิดใช้งาน RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: admin ดู/เพิ่ม/แก้ไข/ลบ ได้ทุกแถว
CREATE POLICY "Admin สามารถจัดการ companies ได้" ON companies
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );
