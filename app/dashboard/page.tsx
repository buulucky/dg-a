import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import PODashboardClient from "@/components/dashboard/PODashboardClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function DashboardPage() {
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

  const isAdmin = userProfile.role === "admin" && userProfile.status === "approved";

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">สรุปสถิติพนักงานตาม PO</p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <PODashboardClient userProfile={userProfile} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}
