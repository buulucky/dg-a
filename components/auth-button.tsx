import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">เข้าสู่ระบบ</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">สมัครสมาชิก</Link>
        </Button>
      </div>
    );
  }

  // ดึงข้อมูล profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role, status')
    .eq('id', user.sub)
    .single();

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span className="text-muted-foreground">สวัสดี, </span>
        <span className="font-medium">
          {profile?.full_name || user.email}
        </span>
        {profile?.role === 'admin' && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            ผู้ดูแลระบบ
          </span>
        )}
      </div>
      <LogoutButton />
    </div>
  );
}
