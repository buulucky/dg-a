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
