import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">รอการอนุมัติ</CardTitle>
          <CardDescription>
            บัญชีของคุณอยู่ระหว่างการพิจารณาจากผู้ดูแลระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            เราได้รับใบสมัครของคุณแล้ว กรุณารอการติดต่อกลับจากทีมงาน
            โดยทั่วไปจะใช้เวลา 1-3 วันทำการ
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/login">
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            หากมีข้อสงสัย กรุณาติดต่อ support@example.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
