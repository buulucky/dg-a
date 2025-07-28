import AddPOButton from "@/components/po/AddPOButton";
import POTableClient from "../../../components/po/POTableClient";
import { getPOs, getUserRole } from "./actions";

export const dynamic = 'force-dynamic';

export default async function PoManagement() {
  const [roleResult, posResult] = await Promise.all([
    getUserRole(),
    getPOs(1, 15, "") // หน้าแรก, 15 รายการ, ไม่มีการค้นหา
  ]);

  const isAdmin = roleResult.isAdmin;
  const pos = posResult.data || [];
  const total = posResult.total;
  const totalPages = posResult.totalPages;

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการ Purchase Order (PO)</h1>
        <p className="text-gray-600 mt-2">จัดการข้อมูล Purchase Order และติดตามสถานะ</p>
      </div>
      <AddPOButton />
      <div className="mt-6">
        <POTableClient 
          initialPOs={pos}
          initialTotal={total}
          initialTotalPages={totalPages}
          showAddButton={isAdmin}
          isAdmin={isAdmin}
        />
      </div>
    </main>
  );
}