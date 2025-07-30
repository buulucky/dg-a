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

-- เปิด RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- อ่านข้อมูล profile ใครก็ได้ (ทุกคนอ่านได้)
CREATE POLICY "Allow read for all"
ON user_profiles
FOR SELECT
USING (true);

-- user แก้ไขได้เฉพาะของตัวเอง
CREATE POLICY "User can update own profile"
ON user_profiles
FOR UPDATE
USING (id = auth.uid());

-- admin แก้ไขได้ทุก profile
CREATE POLICY "Admin can update all profiles"
ON user_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- เพิ่มข้อมูล profile ได้เฉพาะตอนสมัคร (หรือถ้าต้องการให้ admin เพิ่ม user ได้ ให้เพิ่ม policy สำหรับ admin)
CREATE POLICY "Allow insert for self"
ON user_profiles
FOR INSERT
WITH CHECK (id = auth.uid());