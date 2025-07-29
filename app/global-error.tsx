"use client";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-red-500 mb-2">💥</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                เกิดข้อผิดพลาดร้ายแรง
              </h2>
              <p className="text-gray-600 mb-4">
                ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
              </p>
              
              {error.message && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-red-600 font-mono">
                    {error.message}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={reset} 
                className="w-full"
              >
                🔄 ลองใหม่
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                className="w-full"
              >
                🏠 กลับหน้าหลัก
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                หากปัญหายังคงเกิดขึ้น กรุณาติดต่อผู้ดูแลระบบ
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
