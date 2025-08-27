import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import CourseExpiryCalendar from "@/components/management/calendar/CourseExpiryCalendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function CalendarPage() {
  const supabase = await createClient();

  // ตรวจสอบสิทธิ์ผู้ใช้
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return <div>กรุณาเข้าสู่ระบบ</div>;
  }

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role, status, company_id")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    return <div>ไม่พบข้อมูลผู้ใช้</div>;
  }

  if (userProfile.status !== "approved") {
    return <div>บัญชีของคุณยังไม่ได้รับการอนุมัติ</div>;
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CourseExpiryCalendar />
    </Suspense>
  );
}
