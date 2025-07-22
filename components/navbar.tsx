"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { LogoutButton } from "./logout-button";

// Hook สำหรับดึงข้อมูล user จาก Supabase
function useUser() {
  const [user, setUser] = useState<{ role: string; status: string } | null>(
    null
  );
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, status")
          .eq("id", authUser.id)
          .single();
        if (isMounted) setUser(profile);
      } else {
        if (isMounted) setUser(null);
      }
    }
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return user;
}

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (isMounted) setUser(authUser);
      if (authUser) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('full_name, role, status')
          .eq('id', authUser.id)
          .single();
        if (isMounted) setProfile(profileData);
      } else {
        if (isMounted) setProfile(null);
      }
    }
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

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

export default function Navbar() {
  const user = useUser(); // { role: 'admin' | 'user' | ... }
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}

          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:text-blue-200 transition"
          >
            <span className="bg-white text-blue-700 rounded px-2 py-1 font-black">
              DG
            </span>
            <span>Admin</span>
          </Link>
          {/* Links */}
          <div className="flex gap-6 items-center">
            {user?.role === "admin" && user?.status === "approved" && (
              <>
                <Link
                  href="/admin/companies"
                  className="hover:text-blue-200 transition"
                >
                  Companies
                </Link>
                <Link href="/admin" className="hover:text-blue-200 transition">
                  Admin
                </Link>
              </>
            )}
            <Link href="/protected" className="hover:text-blue-200 transition">
              Protected
            </Link>
          </div>
          {/* Auth Button */}
          <div>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
