"use client";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const [user, setUser] = useState<{id: string; email: string} | null>(null);
  const [profile, setProfile] = useState<{full_name?: string; role?: string; status?: string} | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (isMounted) setUser(authUser ? { id: authUser.id, email: authUser.email || '' } : null);
      if (authUser) {
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("full_name, role, status")
          .eq("id", authUser.id)
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

  // ปิด dropdown เมื่อคลิกนอกเมนู
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const logout = async () => {
    if (isLoggingOut) return; // ป้องกันการเรียกซ้ำ
    
    try {
      setIsLoggingOut(true);
      setOpen(false);
      
      // ลบ auth session
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      setProfile(null);
      
      // ใช้ window.location.replace เพื่อหลีกเลี่ยง router cache และ state listener conflicts
      window.location.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // กรณี error ให้ redirect แบบ fallback
      window.location.replace("/auth/login");
    }
    // ไม่ต้อง setIsLoggingOut(false) เพราะจะ redirect ออกไปแล้ว
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition">
          <Link href="/auth/login">เข้าสู่ระบบ</Link>
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        className="inline-flex items-center gap-x-1.5 rounded-mdpx-3 py-2 text-sm font-semibold shadow-xs"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        {profile?.full_name || user.email}
        {profile?.role === "admin" && (
          <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            ผู้ดูแลระบบ
          </span>
        )}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="-mr-1 size-5 text-blue-400"
        >
          <path
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
            fillRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          tabIndex={-1}
          aria-labelledby="menu-button"
          aria-orientation="vertical"
          className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div role="none" className="py-1">
            <button
              role="menuitem"
              tabIndex={-1}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-blue-50 disabled:opacity-50"
              onClick={logout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
