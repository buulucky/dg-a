"use client";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { AuthButton } from "./AuthButton";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useUser();
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const manageDropdownRef = useRef<HTMLDivElement>(null);
  const reportDropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // ตรวจสอบว่าคลิกนอกพื้นที่ manage dropdown หรือไม่
      if (
        showManageDropdown &&
        manageDropdownRef.current &&
        !manageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowManageDropdown(false);
      }
      // ตรวจสอบว่าคลิกนอกพื้นที่ report dropdown หรือไม่
      if (
        showReportDropdown &&
        reportDropdownRef.current &&
        !reportDropdownRef.current.contains(event.target as Node)
      ) {
        setShowReportDropdown(false);
      }
    }

    // เพิ่ม event listener เฉพาะเมื่อมี dropdown เปิดอยู่
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showManageDropdown, showReportDropdown]);

  if (isAuthPage) {
    return null;
  }

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
            <Link
              href="/dashboard"
              className="hover:text-purple-200 transition"
            >
              Dashboard
            </Link>

            <Link href="/employee" className="hover:text-purple-200 transition">
              Employee
            </Link>

            <div className="relative" ref={manageDropdownRef}>
              <button
                className="hover:text-purple-200 transition flex items-center gap-1"
                onClick={() => {
                  setShowManageDropdown(!showManageDropdown);
                  setShowReportDropdown(false); // ปิด dropdown อื่น
                }}
              >
                Management
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showManageDropdown ? "rotate-180" : ""
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

              {showManageDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-lg shadow-lg min-w-[180px] z-50">
                  <Link
                    href="/management/po"
                    className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition first:rounded-t-lg"
                    onClick={() => setShowManageDropdown(false)}
                  >
                    Purchase Order
                  </Link>
                  {/* <Link
                    href="#"
                    className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition last:rounded-b-lg"
                    onClick={() => setShowManageDropdown(false)}
                  >
                    XXXXXX
                  </Link> */}
                  {user?.role === "admin" && user?.status === "approved" && (
                    <Link
                      href="/admin/management/course"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition last:rounded-b-lg"
                      onClick={() => setShowManageDropdown(false)}
                    >
                      Position & Course
                    </Link>
                  )}
                </div>
              )}
            </div>
            {user?.role === "admin" && user?.status === "approved" && (
              <div className="relative" ref={reportDropdownRef}>
                <button
                  className="hover:text-purple-200 transition flex items-center gap-1"
                  onClick={() => {
                    setShowReportDropdown(!showReportDropdown);
                    setShowManageDropdown(false);
                  }}
                >
                  Report
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showReportDropdown ? "rotate-180" : ""
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

                {showReportDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-lg shadow-lg min-w-[200px] z-50">
                    <Link
                      href="/admin/reports/employee"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition first:rounded-t-lg"
                      onClick={() => setShowReportDropdown(false)}
                    >
                      Report Excel
                    </Link>
                    <Link
                      href="/calendar"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                      onClick={() => setShowReportDropdown(false)}
                    >
                      Course Calendar
                    </Link>
                    <Link
                      href="/admin/reports/missing-courses"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition last:rounded-b-lg"
                      onClick={() => setShowReportDropdown(false)}
                    >
                      Missing Courses
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
