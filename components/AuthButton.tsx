"use client";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import ChangePasswordForm from "@/components/ChangePasswordForm";

// เพิ่ม keyframes สำหรับ animation
const modalStyles = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

export function AuthButton() {
  const [user, setUser] = useState<{id: string; email: string} | null>(null);
  const [profile, setProfile] = useState<{full_name?: string; role?: string; status?: string} | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const logout = async () => {
    if (isLoggingOut) return; // ป้องกันการเรียกซ้ำ
    
    try {
      setIsLoggingOut(true);
      setShowDropdown(false);
      
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
        <Link
          href="/auth/login"
          className="bg-white text-purple-900 hover:bg-purple-100 px-4 py-2 rounded-md text-sm font-medium transition"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* เพิ่ม CSS animation */}
      <style jsx>{modalStyles}</style>
      
      <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center gap-x-1.5 rounded-md bg-white text-purple-900 hover:bg-purple-100 px-4 py-2 text-sm font-medium shadow-sm transition"
        aria-expanded={showDropdown}
        aria-haspopup="true"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {profile?.full_name || user.email}
        {profile?.role === "admin" && (
          <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            ผู้ดูแลระบบ
          </span>
        )}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`-mr-1 size-5 text-purple-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        >
          <path
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
            fillRule="evenodd"
          />
        </svg>
      </button>
      {showDropdown && (
        <div
          role="menu"
          tabIndex={-1}
          aria-labelledby="menu-button"
          aria-orientation="vertical"
          className="absolute right-0 z-10 mt-1 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div role="none" className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500 border-b">
              {user.email}
            </div>
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
              onClick={() => {
                setShowDropdown(false);
                setShowModal(true);
              }}
            >
              เปลี่ยนรหัสผ่าน
            </button>
            <hr className="my-1" />
            <button
              role="menuitem"
              tabIndex={-1}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
              onClick={logout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            </button>
          </div>
        </div>
      )}

      {/* Modal สำหรับเปลี่ยนรหัสผ่าน */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl p-8 min-w-[420px] max-w-md w-full relative transform transition-all duration-300 ease-out scale-100"
            style={{
              animation: 'modalFadeIn 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">เปลี่ยนรหัสผ่าน</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="mb-6">
              <ChangePasswordForm />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
}
