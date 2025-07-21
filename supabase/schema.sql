-- สร้างตาราง user_profiles สำหรับจัดเก็บข้อมูลผู้ใช้และสถานะ
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- สร้าง RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับให้ผู้ใช้อ่านข้อมูลตัวเองได้
CREATE POLICY "ผู้ใช้สามารถดูข้อมูลตัวเองได้" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy สำหรับให้ผู้ใช้แก้ไขข้อมูลตัวเองได้ (ยกเว้น role และ status)
CREATE POLICY "ผู้ใช้สามารถแก้ไขข้อมูลตัวเองได้" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy สำหรับให้ admin ดูข้อมูลทุกคนได้
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

-- Policy สำหรับให้ admin แก้ไขข้อมูลทุกคนได้
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

-- Policy สำหรับการ insert ข้อมูลใหม่
CREATE POLICY "ผู้ใช้สามารถสร้างโปรไฟล์ตัวเองได้" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function สำหรับสร้าง user profile อัตโนมัติเมื่อมีการสมัครสมาชิก
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger สำหรับเรียก function เมื่อมี user ใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- สร้าง admin user คนแรก (เปลี่ยน email ตามต้องการ)
-- หลังจากรัน SQL นี้แล้ว ให้สมัครสมาชิกด้วย email นี้
-- แล้วอัพเดท role เป็น admin และ status เป็น approved ด้วยตัวเอง
INSERT INTO user_profiles (id, email, role, status, approved_at)
SELECT 
  id, 
  email, 
  'admin',
  'approved',
  NOW()
FROM auth.users 
WHERE email = 'buulucky@icloud.com' -- เปลี่ยนเป็น email ที่ต้องการ
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'approved',
  approved_at = NOW();
