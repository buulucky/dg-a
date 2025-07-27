# ระบบล๊อคอินแบบ Role-Based พร้อมระบบอนุมัติ

ระบบล๊อคอินที่มีการจัดการ role (user/admin) และระบบอนุมัติสมาชิกใหม่ โดยใช้ Next.js และ Supabase

## คุณสมบัติ

- 🔐 ระบบล๊อคอิน/สมัครสมาชิกเป็นภาษาไทย
- 👥 จัดการ Role: User และ Admin
- ✅ ระบบอนุมัติสมาชิกใหม่โดย Admin
- 🛡️ ความปลอดภัยระดับแถว (Row Level Security)
- 📱 Responsive Design
- 🎨 UI สวยงามด้วย Tailwind CSS และ shadcn/ui

## การติดตั้ง

### 1. ติดตั้ง Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. ตั้งค่า Supabase

1. สร้างโปรเจค Supabase ใหม่ที่ [supabase.com](https://supabase.com)
2. คัดลอกไฟล์ `.env.local.example` เป็น `.env.local`
3. กรอกข้อมูล Supabase URL และ Anon Key

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. ตั้งค่า Database

รันคำสั่ง SQL ในไฟล์ `supabase/schema.sql` ใน Supabase SQL Editor:

1. เข้าไปที่ Supabase Dashboard
2. ไปที่ SQL Editor
3. คัดลอกและรันโค้ดใน `supabase/schema.sql`

### 4. ตั้งค่า Admin แรก

1. แก้ไขอีเมลใน `supabase/schema.sql` บรรทัดสุดท้าย เป็นอีเมลของคุณ
2. รันคำสั่ง SQL
3. สมัครสมาชิกด้วยอีเมลนั้น
4. คุณจะได้สิทธิ์ Admin โดยอัตโนมัติ

### 5. เริ่มใช้งาน

\`\`\`bash
npm run dev
\`\`\`

## โครงสร้างระบบ

### User Roles

- **User**: ผู้ใช้ทั่วไป - เข้าถึงหน้า protected ได้หลังได้รับการอนุมัติ
- **Admin**: ผู้ดูแลระบบ - เข้าถึงหน้า admin เพื่อจัดการสมาชิกได้

### User Status

- **Pending**: รอการอนุมัติจาก Admin
- **Approved**: ได้รับการอนุมัติแล้ว สามารถใช้งานระบบได้
- **Rejected**: ถูกปฏิเสธ ไม่สามารถเข้าใช้งานได้

## การใช้งาน

### สำหรับผู้ใช้ทั่วไป

1. **สมัครสมาชิก**: ไปที่ `/auth/sign-up` กรอกข้อมูล
2. **รอการอนุมัติ**: ระบบจะแสดงหน้ารอการอนุมัติ
3. **เข้าสู่ระบบ**: หลังได้รับการอนุมัติ สามารถเข้าสู่ระบบได้ที่ `/auth/login`
4. **ใช้งาน**: เข้าถึงหน้า `/protected` ได้

### สำหรับ Admin

1. **เข้าสู่ระบบ**: ด้วยบัญชี Admin
2. **จัดการสมาชิก**: ไปที่ `/admin` เพื่อ:
   - อนุมัติ/ปฏิเสธสมาชิกใหม่
   - เลื่อนขั้น/ปลดสิทธิ์ Admin
   - ดูข้อมูลสมาชิกทั้งหมด

## หน้าหลัก

- `/` - หน้าแรก
- `/auth/login` - เข้าสู่ระบบ
- `/auth/sign-up` - สมัครสมาชิก
- `/auth/forgot-password` - ลืมรหัสผ่าน
- `/auth/pending-approval` - รอการอนุมัติ
- `/auth/account-rejected` - บัญชีถูกปฏิเสธ
- `/protected` - หน้าสำหรับสมาชิก
- `/admin` - หน้าจัดการสำหรับ Admin

## Security Features

- Row Level Security (RLS) ป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต
- Middleware ตรวจสอบสิทธิ์การเข้าถึงแต่ละหน้า
- การตรวจสอบ Role และ Status ก่อนอนุญาตให้เข้าถึง

## Database Schema

### user_profiles

\`\`\`sql
- id (UUID) - เชื่อมกับ auth.users
- email (TEXT) - อีเมลผู้ใช้
- full_name (TEXT) - ชื่อ-นามสกุล
- role (TEXT) - 'user' หรือ 'admin'
- status (TEXT) - 'pending', 'approved', 'rejected'
- created_at (TIMESTAMP) - วันที่สมัคร
- approved_by (UUID) - ผู้อนุมัติ
- approved_at (TIMESTAMP) - วันที่อนุมัติ
\`\`\`

## การพัฒนาต่อ

- เพิ่ม Role อื่นๆ เช่น 'moderator'
- ระบบการแจ้งเตือนทางอีเมลเมื่อได้รับการอนุมัติ
- ระบบ Dashboard สำหรับดูสถิติ
- การ Export ข้อมูลสมาชิก

## License

MIT License


import { toast } from "@/lib/toast";

// ใช้งานง่ายๆ
toast.success("บันทึกข้อมูลสำเร็จ");
toast.error("เกิดข้อผิดพลาด");
toast.warning("คำเตือน");
toast.info("ข้อมูลทั่วไป");

// ปรับแต่งตำแหน่งและระยะเวลา
toast.success("สำเร็จ!", { 
  duration: 5000, 
  position: 'top-center' 
});