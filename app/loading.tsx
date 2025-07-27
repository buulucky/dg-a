export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
      <div className="text-lg text-gray-600">กำลังโหลดข้อมูลพนักงาน...</div>
    </div>
  );
}