"use client";

import { useState, useEffect } from "react";
import AddEmployeeButton from "./AddEmployeeButton";
import { getEmployees, getUserRole, type Employee } from "./actions";

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // โหลดข้อมูล user role และพนักงานพร้อมกัน
      const [roleResult, employeesResult] = await Promise.all([
        getUserRole(),
        getEmployees()
      ]);

      setIsAdmin(roleResult.isAdmin);

      if (employeesResult.error) {
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: " + employeesResult.error);
      } else {
        setEmployees(employeesResult.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    const result = await getEmployees();
    if (result.error) {
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: " + result.error);
    } else {
      setEmployees(result.data || []);
    }
  };

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">จัดการพนักงาน</h1>
        {/* แสดงปุ่มเพิ่มพนักงานเฉพาะ user ที่ไม่ใช่ admin */}
        {!isAdmin && (
          <AddEmployeeButton onEmployeeAdded={loadEmployees} />
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">รายชื่อพนักงาน</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    เลขบัตรประชาชน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    ชื่อ-นามสกุล (ไทย)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    ชื่อ-นามสกุล (อังกฤษ)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    รหัสพนักงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    วันที่เริ่มงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    เลขที่ PO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    ตำแหน่งงาน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      ไม่มีข้อมูลพนักงาน
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr key={`${employee.employee_id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {employee.personal_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {employee.prefix_th} {employee.first_name_th} {employee.last_name_th}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {employee.prefix_en} {employee.first_name_en} {employee.last_name_en}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {employee.employee_code || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {employee.start_date 
                          ? new Date(employee.start_date).toLocaleDateString('th-TH')
                          : "-"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {employee.po_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                        {employee.job_position_name || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}