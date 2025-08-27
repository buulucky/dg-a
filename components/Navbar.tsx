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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

          {/* Desktop Links */}
          <div className="hidden md:flex gap-6 items-center">
            <Link
              href="/dashboard"
              className="hover:text-purple-200 transition"
            >
              Dashboard
            </Link>

            <Link href="/employee" className="hover:text-purple-200 transition">
              Employee
            </Link>

            {user?.role === "admin" && user?.status === "approved" && (
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
                      href="/admin/management/po"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition first:rounded-t-lg"
                      onClick={() => setShowManageDropdown(false)}
                    >
                      Purchase Order
                    </Link>
                    <Link
                      href="/admin/management/positions"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                      onClick={() => setShowManageDropdown(false)}
                    >
                      Positions
                    </Link>
                    <Link
                      href="/admin/management/training_courses"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                      onClick={() => setShowManageDropdown(false)}
                    >
                      Training Courses
                    </Link>
                    <Link
                      href="/admin/management/course_position"
                      className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition last:rounded-b-lg"
                      onClick={() => setShowManageDropdown(false)}
                    >
                      Position & Course
                    </Link>
                  </div>
                )}
              </div>
            )}
            
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
                    href="/reports/employee"
                    className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition first:rounded-t-lg"
                    onClick={() => setShowReportDropdown(false)}
                  >
                    Report Excel
                  </Link>
                  <Link
                    href="/reports/calendar"
                    className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition"
                    onClick={() => setShowReportDropdown(false)}
                  >
                    Course Calendar
                  </Link>
                  <Link
                    href="/reports/missing-courses"
                    className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-700 transition last:rounded-b-lg"
                    onClick={() => setShowReportDropdown(false)}
                  >
                    Missing Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md hover:bg-purple-800 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-purple-800 border-t border-purple-700 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 hover:bg-purple-700 transition rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                Dashboard
              </Link>

              <Link
                href="/employee"
                className="px-4 py-2 hover:bg-purple-700 transition rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                Employee
              </Link>

              {user?.role === "admin" && user?.status === "approved" && (
                <div className="px-4">
                  <div className="border-t border-purple-700 pt-4">
                    <p className="text-purple-200 text-sm font-medium mb-2">Management</p>
                    <div className="pl-4 space-y-2">
                      <Link
                        href="/admin/management/po"
                        className="block py-2 hover:text-purple-200 transition"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Purchase Order
                      </Link>
                      <Link
                        href="/admin/management/positions"
                        className="block py-2 hover:text-purple-200 transition"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Positions
                      </Link>
                      <Link
                        href="/admin/management/training_courses"
                        className="block py-2 hover:text-purple-200 transition"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Training Courses
                      </Link>
                      <Link
                        href="/admin/management/course_position"
                        className="block py-2 hover:text-purple-200 transition"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Position & Course
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4">
                <div className="border-t border-purple-700 pt-4">
                  <p className="text-purple-200 text-sm font-medium mb-2">Report</p>
                  <div className="pl-4 space-y-2">
                    <Link
                      href="/reports/employee"
                      className="block py-2 hover:text-purple-200 transition"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Report Excel
                    </Link>
                    <Link
                      href="/reports/calendar"
                      className="block py-2 hover:text-purple-200 transition"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Course Calendar
                    </Link>
                    <Link
                      href="/reports/missing-courses"
                      className="block py-2 hover:text-purple-200 transition"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Missing Courses
                    </Link>
                  </div>
                </div>
              </div>

              <div className="px-4 pt-4 border-t border-purple-700">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
