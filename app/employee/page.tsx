import EmployeeTableClient from "../../components/employee/EmployeeTableClient";
import { getEmployees, getUserRole } from "./actions";

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
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">รายชื่อพนักงาน</h2>
        <EmployeeTableClient 
          initialEmployees={employees}
          initialTotal={total}
          initialTotalPages={totalPages}
          showAddButton={!isAdmin}
          isAdmin={isAdmin}
        />
      </div>
    </main>
  );
}