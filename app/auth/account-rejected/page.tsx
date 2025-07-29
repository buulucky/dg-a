import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function AccountRejectedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center bg-purple-950">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <CardTitle className="text-2xl">บัญชีถูกปฏิเสธ</CardTitle>
          <CardDescription>
            ใบสมัครของคุณไม่ได้รับการอนุมัติ
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            เสียใจด้วย บัญชีของคุณไม่ผ่านการพิจารณาของผู้ดูแลระบบ
            หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่อทีมงาน
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/login">
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ติดต่อเพื่อสอบถามเหตุผล: support@example.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
