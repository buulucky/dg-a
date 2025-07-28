# DG-A Project Overview

## โปรเจคคืออะไร
ระบบจัดการพนักงานและบริษัทแรงงานภายนอก พร้อมระบบ Authentication แบบ Role-based

## เทคโนโลยีหลัก
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Authentication)
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Deployment**: Vercel

## โครงสร้างสำคัญ
```
app/
├── admin/user-management/     # จัดการผู้ใช้ (Admin only)
├── employee/                  # จัดการข้อมูลพนักงาน
├── auth/                      # หน้า Authentication
components/
├── employee/                  # Components สำหรับพนักงาน
├── ui/                       # shadcn/ui components
supabase/                     # SQL schema files
```

## ฐานข้อมูลหลัก
- `user_profiles` - ผู้ใช้และสิทธิ์ (pending/approved/rejected)
- `companies` - ข้อมูลบริษัท
- `employees` - ข้อมูลพนักงาน
- `employee_contracts` - สัญญาจ้างงาน
- `job_positions` - ตำแหน่งงาน
- `training_courses` - หลักสูตรฝึกอบรม

## Roles และ Permissions
- **Admin**: อนุมัติผู้ใช้ใหม่, ดูข้อมูลพนักงานทั้งหมด
- **User**: เพิ่มข้อมูลพนักงาน, ดูข้อมูลของบริษัทตัวเอง

## Features ปัจจุบัน
- ✅ ระบบ Login/Signup (ภาษาไทย)
- ✅ ระบบอนุมัติสมาชิกใหม่
- ✅ จัดการข้อมูลพนักงาน (CRUD)
- ✅ เปลี่ยนสถานะพนักงาน
- ✅ Pagination และ Search
- ✅ Server-side rendering
- ✅ Row Level Security (RLS)

## การพัฒนาล่าสุด
- เพิ่ม Toast notifications
- ปรับ Navbar รองรับธีม
- แก้ไขการ reload หลังเพิ่มข้อมูล
- Server-side rendering สำหรับ performance

## คำสั่งที่ใช้บ่อย
```bash
npm run dev              # เริ่ม development server
npm run build           # build สำหรับ production
npm run lint            # ตรวจสอบ code quality
```

## ปัญหาที่เจอบ่อย
1. **Email confirmation**: ตั้งค่าใน Supabase Authentication Settings
2. **RLS Policy**: ตรวจสอบ permissions ในฐานข้อมูล
3. **Role-based access**: ใช้ middleware.ts ตรวจสอบสิทธิ์

## TODO / ฟีเจอร์ที่กำลังพัฒนา
- [ ] รายงานข้อมูลพนักงาน
- [ ] ระบบจัดการหลักสูตรฝึกอบรม
- [ ] Dashboard สรุปข้อมูล
- [ ] Export ข้อมูล Excel/PDF

## Contact & Notes
- ใช้ภาษาไทยใน UI
- Focus ที่ UX สำหรับผู้ใช้ไม่ชำนาญเทคโนโลยี
- ข้อมูลผู้ใช้ต้องผ่านการอนุมัติก่อนใช้งาน
