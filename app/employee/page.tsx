import AddEmployeeButton from "./AddEmployeeButton";
import EmployeeTableClient from "./EmployeeTableClient";
import { getEmployees, getUserRole } from "./actions";

// บอก Next.js ว่าหน้านี้ต้อง dynamic rendering
export const dynamic = 'force-dynamic';

export default async function EmployeePage() {
  const [roleResult, employeesResult] = await Promise.all([
    getUserRole(),
    getEmployees(1, 15, "") // หน้าแรก, 15 รายการ, ไม่มีการค้นหา
  ]);

  const isAdmin = roleResult.isAdmin;
  const employees = employeesResult.data || [];
  const total = employeesResult.total;
  const totalPages = employeesResult.totalPages;

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">จัดการพนักงาน</h1>
        {/* แสดงปุ่มเพิ่มพนักงานเฉพาะ user ที่ไม่ใช่ admin */}
        {!isAdmin && (
          <AddEmployeeButton />
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">รายชื่อพนักงาน</h2>
        <EmployeeTableClient 
          initialEmployees={employees}
          initialTotal={total}
          initialTotalPages={totalPages}
        />
      </div>
    </main>
  );
}