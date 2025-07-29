"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-red-500 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            หน้านี้กำลังอยู่ในช่วงการพัฒนา
          </h2>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="w-full"
          >
            ← กลับหน้าที่แล้ว
          </Button>
          
          <Link href="/" className="block">
            <Button className="w-full">
              🏠 กลับหน้าหลัก
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
      </div>
    </div>
  );
}
