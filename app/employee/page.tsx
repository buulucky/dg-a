import EmployeeTableClient from "../../components/employee/EmployeeTableClient";
import { getEmployees, getUserRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function EmployeePage() {
  const [roleResult, employeesResult] = await Promise.all([
    getUserRole(),
    getEmployees(1, 15, ""), // หน้าแรก, 15 รายการ, ไม่มีการค้นหา
  ]);

  const isAdmin = roleResult.isAdmin;
  const employees = employeesResult.data || [];
  const total = employeesResult.total;
  const totalPages = employeesResult.totalPages;

  return (
    <main className="">
      <div className="">
        <h1 className="text-3xl font-bold">รายชื่อพนักงาน</h1>
        <div className="mt-6">
          <EmployeeTableClient
            initialEmployees={employees}
            initialTotal={total}
            initialTotalPages={totalPages}
            showAddButton={!isAdmin}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </main>
  );
}
