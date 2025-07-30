import { AdminPanelClient } from "@/components/management/user/admin-panel-client";
import { getCurrentUser, getAllUsers } from "./actions";

// บอก Next.js ว่าหน้านี้ต้อง dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // ตรวจสอบสิทธิ์ admin ฝั่ง server
  const currentUser = await getCurrentUser();
  
  // โหลดข้อมูล users ฝั่ง server
  const users = await getAllUsers();

  return (
    <main className="p-6">
      <AdminPanelClient 
        initialUsers={users} 
        currentUser={currentUser} 
      />
    </main>
  );
}
