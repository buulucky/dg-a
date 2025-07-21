import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // ดึงข้อมูล profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', data.claims.sub)
    .single();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto p-6">
      <div className="w-full">
        <div className="bg-green-50 border border-green-200 text-sm p-4 rounded-md text-green-800 flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          ยินดีต้อนรับเข้าสู่ระบบ! นี่คือหน้าที่เฉพาะสมาชิกเท่านั้นที่เข้าถึงได้
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              ข้อมูลบัญชีของคุณ
            </CardTitle>
            <CardDescription>
              รายละเอียดบัญชีผู้ใช้และสิทธิ์การเข้าถึง
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ชื่อ-นามสกุล:</span>
                <span className="text-sm">{profile?.full_name || 'ไม่ระบุ'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">อีเมล:</span>
                <span className="text-sm">{data.claims.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">บทบาท:</span>
                <div>
                  {profile?.role === 'admin' ? (
                    <Badge variant="default" className="bg-blue-500">ผู้ดูแลระบบ</Badge>
                  ) : (
                    <Badge variant="outline">ผู้ใช้ทั่วไป</Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">สถานะ:</span>
                <div>
                  {profile?.status === 'approved' && (
                    <Badge variant="default" className="bg-green-500">อนุมัติแล้ว</Badge>
                  )}
                  {profile?.status === 'pending' && (
                    <Badge variant="secondary">รออนุมัติ</Badge>
                  )}
                  {profile?.status === 'rejected' && (
                    <Badge variant="destructive">ปฏิเสธ</Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">สมาชิกเมื่อ:</span>
                <span className="text-sm">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH') : 'ไม่ทราบ'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                เครื่องมือผู้ดูแลระบบ
              </CardTitle>
              <CardDescription>
                จัดการสมาชิกและอนุมัติการสมัครใหม่
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin">
                  เข้าสู่หน้าจัดการระบบ
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-4">ข้อมูลเซสชัน (สำหรับการพัฒนา)</h3>
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs font-mono overflow-auto max-h-48 bg-muted p-3 rounded">
              {JSON.stringify(
                {
                  user: data.claims,
                  profile: profile
                }, 
                null, 
                2
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
