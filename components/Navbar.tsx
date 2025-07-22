"use client";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { AuthButton } from "./AuthButton";

export default function Navbar() {
  const user = useUser();
  
  if (!user) return null;

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
            {user?.role === "admin" && user?.status === "approved" && (
              <>
                <Link
                  href="/admin/companies"
                  className="hover:text-purple-200 transition"
                >
                  จัดการบริษัท
                </Link>
                <Link href="/admin" className="hover:text-purple-200 transition">
                  จัดการสมาชิก
                </Link>
              </>
            )}
            <Link href="/protected" className="hover:text-purple-200 transition">
              Protected
            </Link>
          </div>
          <div>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
