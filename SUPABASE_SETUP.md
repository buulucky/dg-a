# คู่มือการตั้งค่า Supabase

## แก้ไขปัญหา "Email not confirmed"

ปัญหานี้เกิดจากการตั้งค่า Email Confirmation ใน Supabase

### วิธีที่ 1: ปิดการยืนยันอีเมล (สำหรับการทดสอบ)

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือกโปรเจคของคุณ
3. ไปที่ **Authentication** → **Settings**
4. ในส่วน **User Signups**:
   - ปิด **"Enable email confirmations"** 
   - หรือเปลี่ยนเป็น **"Disabled"**
5. กด **Save**

### วิธีที่ 2: ตั้งค่า Email Confirmation (สำหรับ Production)

1. ใน Authentication Settings
2. ไปที่แท็บ **"URL Configuration"**
3. ตั้งค่า:
   - **Site URL**: `http://localhost:3000` (สำหรับ dev) หรือ domain จริง
   - **Redirect URLs**: เพิ่ม `http://localhost:3000/protected`

4. ไปที่แท็บ **"Email Templates"**
5. ในส่วน **"Confirm signup"**:
   - ตั้งค่า **Subject**: "ยืนยันการสมัครสมาชิก"
   - ปรับแต่ง **Body** เป็นภาษาไทย

### ตัวอย่าง Email Template (ภาษาไทย):

**Subject:**
\`\`\`
ยืนยันการสมัครสมาชิก {{ .SiteName }}
\`\`\`

**Body:**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ยืนยันการสมัครสมาชิก</title>
</head>
<body>
  <h2>ยินดีต้อนรับสู่ {{ .SiteName }}</h2>
  
  <p>สวัสดี!</p>
  
  <p>ขอบคุณที่สมัครสมาชิกกับเรา กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
  
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #3b82f6; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 6px; display: inline-block;">
    ยืนยันอีเมล
  </a>
  
  <p>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:</p>
  <p>{{ .ConfirmationURL }}</p>
  
  <hr>
  
  <p><strong>หมายเหตุสำคัญ:</strong></p>
  <ul>
    <li>หลังจากยืนยันอีเมลแล้ว บัญชีของคุณจะรอการอนุมัติจากผู้ดูแลระบบ</li>
    <li>กระบวนการอนุมัติใช้เวลา 1-3 วันทำการ</li>
    <li>คุณจะได้รับการแจ้งเตือนเมื่อบัญชีได้รับการอนุมัติ</li>
  </ul>
  
  <p>หากมีข้อสงสัย กรุณาติดต่อทีมงานที่ support@example.com</p>
  
  <p>ขอบคุณ<br>ทีมงาน {{ .SiteName }}</p>
</body>
</html>
\`\`\`

## การตั้งค่าอื่นๆ

### 1. Rate Limiting
- ไปที่ **Authentication** → **Rate Limits**
- ปรับค่าตามต้องการ เช่น:
  - Sign up: 10 requests per hour
  - Sign in: 30 requests per hour

### 2. Password Policy
- ใน **Authentication** → **Settings** 
- ตั้งค่า **Password Policy**:
  - Minimum length: 6 characters
  - Require symbols, numbers (ตามต้องการ)

### 3. Social Auth (เพิ่มเติม)
หากต้องการเพิ่ม Google/Facebook login:
- ไปที่ **Authentication** → **Providers**
- เปิดใช้งาน provider ที่ต้องการ
- ใส่ Client ID และ Secret

## การทดสอบ

### ขั้นตอนการทดสอบระบบ:

1. **สมัครสมาชิกใหม่**
   - ใช้อีเมลจริงที่เข้าถึงได้
   - กรอกข้อมูลครบถ้วน

2. **ยืนยันอีเมล** (ถ้าเปิดใช้งาน)
   - ตรวจสอบอีเมล
   - คลิกลิงก์ยืนยัน

3. **พยายามเข้าสู่ระบบ**
   - ควรได้หน้า "รอการอนุมัติ"

4. **Admin อนุมัติ**
   - ใช้บัญชี admin เข้า `/admin`
   - อนุมัติสมาชิกใหม่

5. **ทดสอบเข้าสู่ระบบอีกครั้ง**
   - ควรเข้าได้หน้า `/protected`

## Troubleshooting

### ปัญหาที่อาจพบ:

1. **"Email not confirmed"**
   - ปิดการยืนยันอีเมลชั่วคราว (วิธีที่ 1)
   - หรือตั้งค่า Email Templates (วิธีที่ 2)

2. **"Invalid redirect URL"**
   - ตรวจสอบ Redirect URLs ใน URL Configuration
   - เพิ่ม `http://localhost:3000/protected`

3. **RLS Policies ไม่ทำงาน**
   - ตรวจสอบ SQL ใน `supabase/schema.sql`
   - รัน SQL ใหม่ถ้าจำเป็น

4. **Admin ไม่สามารถเข้า /admin ได้**
   - ตรวจสอบอีเมลใน SQL (บรรทัดสุดท้าย)
   - อัพเดท role และ status ใน database
