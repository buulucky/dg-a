"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Company = {
  company_id: number;
  company_name: string;
};

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ดึงข้อมูลบริษัท
  useEffect(() => {
    async function fetchCompanies() {
      const supabase = createClient();
      const { data, error } = await supabase.from("companies").select("company_id, company_name");
      if (error) return setError("ไม่สามารถโหลดรายชื่อบริษัทได้");
      setCompanies(data || []);
    }
    fetchCompanies();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setIsLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      setIsLoading(false);
      return;
    }

    if (!companyId) {
      setError("กรุณาเลือกบริษัท");
      setIsLoading(false);
      return;
    }

    try {
      // สมัครสมาชิก
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (signUpError) throw signUpError;

      // อัพเดท profile เพิ่ม company_id (trigger สร้าง profile แล้ว)
      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            company_id: companyId,
            role: "user",
            status: "pending",
          })
          .eq("id", signUpData.user.id);
        if (profileError) throw profileError;
      }

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("already registered")) {
          setError("อีเมลนี้ได้ลงทะเบียนแล้ว");
        } else if (error.message.includes("Invalid email")) {
          setError("รูปแบบอีเมลไม่ถูกต้อง");
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
        <CardHeader>
          <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
          <CardDescription>สร้างบัญชีใหม่เพื่อใช้งานระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="นายสมชาย ใจดี"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
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
                <Label htmlFor="company">เลือกบริษัท</Label>
                <select
                  id="company"
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- กรุณาเลือกบริษัท --</option>
                  {companies.map((company) => (
                    <option key={company.company_id} value={company.company_id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
