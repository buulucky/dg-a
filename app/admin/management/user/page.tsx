import { AdminPanelClient } from "@/components/management/user/admin-panel-client";
import { getCurrentUser, getAllUsers } from "./actions";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  
  const users = await getAllUsers();

  return (
    <main className="">
      <AdminPanelClient 
        initialUsers={users} 
        currentUser={currentUser} 
      />
    </main>
  );
}
