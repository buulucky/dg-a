import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl">
                สมัครสมาชิกสำเร็จ!
              </CardTitle>
              <CardDescription>รอการอนุมัติจากผู้ดูแลระบบ</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                คุณได้ลงทะเบียนเสร็จเรียบร้อยแล้ว 
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  📧 ขั้นตอนสำคัญ:
                </p>
                <ol className="text-xs text-yellow-700 text-left list-decimal list-inside space-y-1">
                  <li>ตรวจสอบอีเมลของคุณและคลิกลิงก์ยืนยัน</li>
                  <li>รอการอนุมัติจากผู้ดูแลระบบ (1-3 วันทำการ)</li>
                  <li>เข้าสู่ระบบเมื่อได้รับการอนุมัติ</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 หมายเหตุ: หากไม่พบอีเมลยืนยัน ตรวจสอบในโฟลเดอร์ Spam/Junk 
                  หรือ <Link href="/auth/resend-confirmation" className="underline font-medium">ส่งอีเมลยืนยันซ้ำ</Link>
                </p>
              </div>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    กลับไปหน้าเข้าสู่ระบบ
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/resend-confirmation">
                    ส่งอีเมลยืนยันซ้ำ
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
