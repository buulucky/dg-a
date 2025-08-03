"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // ตรวจสอบสถานะการอนุมัติ
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("status, role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        throw new Error("ไม่สามารถตรวจสอบสถานะบัญชีได้");
      }

      if (profile.status === "pending") {
        await supabase.auth.signOut();
        setError("บัญชีของคุณรออนุมัติจากผู้ดูแลระบบ กรุณารอการติดต่อกลับ");
        setIsLoading(false);
        return;
      }

      if (profile.status === "rejected") {
        await supabase.auth.signOut();
        setError("บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ");
        setIsLoading(false);
        return;
      }

      // เข้าสู่ระบบสำเร็จ
      router.push("/employee");
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else if (error.message.includes("Email not confirmed")) {
          setError(
            "กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ ตรวจสอบในกล่องข้อความของคุณ"
          );
        } else if (error.message.includes("signup")) {
          setError("กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ");
        } else {
          setError("เกิดข้อผิดพลาด: " + error.message);
        }
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <div className="flex justify-center mt-6 mb-6">
          <Image
            src="/Thai_Airways_logo.png"
            alt="ตราการบินไทย"
            width={200}
            height={200}
            className="h-12 w-auto"
            priority
          />
        </div>
        {/* <CardHeader>
          <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader> */}
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="somchai@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md">
                  {error}
                  {error.includes("ยืนยันอีเมล") && (
                    <div className="mt-2">
                      <Link
                        href="/auth/resend-confirmation"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        ส่งอีเมลยืนยันซ้ำ
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
