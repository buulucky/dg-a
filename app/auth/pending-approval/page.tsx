import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">รอการอนุมัติ</CardTitle>
          <CardDescription>
            บัญชีของคุณอยู่ระหว่างการพิจารณาจากผู้ดูแลระบบ
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6 text-center">
          <LogoutButton label="กลับสู่หน้าล็อกอิน" />
        </div>
      </Card>
    </div>
  );
}
