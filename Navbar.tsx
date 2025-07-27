"use client";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { AuthButton } from "./AuthButton";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  return (
    <nav className="bg-purple-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl hover:text-purple-200 transition"
          >
            <span className="bg-white text-purple-900 rounded px-2 py-1 font-black">
              DG-A
            </span>
          </Link>
          {/* Links */}
          <div className="flex gap-6 items-center">
            <Link href="/employee" className="hover:text-purple-200 transition">
              จัดการพนักงาน
            </Link>

            {user?.role === "admin" && user?.status === "approved" && (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="hover:text-purple-200 transition flex items-center gap-1"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  การจัดการ
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-md shadow-lg min-w-[180px] z-50">
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      แดชบอร์ดแอดมิน
                    </Link>
                    <Link
                      href="/admin/users"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      จัดการผู้ใช้
                    </Link>
                    <Link
                      href="/admin/companies"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      จัดการบริษัท
                    </Link>
                    <Link
                      href="/admin/reports"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      รายงาน
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
