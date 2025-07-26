"use client";

import { useState, useEffect } from "react";
import AddEmployeeButton from "./AddEmployeeButton";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

interface Employee {
  employee_id: string;
  personal_id: string;
  prefix_th: string;
  first_name_th: string;
  last_name_th: string;
  prefix_en: string;
  first_name_en: string;
  last_name_en: string;
  employee_code: string;
  company_id: number;
  start_date: string;
  po_number: string;
}

export default function EmployeePage() {
  const { user, loading } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  // const [loadingEmployees, setLoadingEmployees] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && user?.company_id) {
      loadEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id, loading]);

  const loadEmployees = async () => {
    try {
      // Query จาก view ที่ join ข้อมูลครบชุด
      let query = supabase
        .from('v_employee_profiles_with_contracts')
        .select('*');
      if (user?.role !== 'admin') {
        query = query.eq('company_id', user?.company_id);
      }
      const { data, error } = await query;

      if (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน:", error, "\ndata:", data);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน กรุณาตรวจสอบสิทธิ์การเข้าถึง หรือ company_id ของ user\n\nรายละเอียด: " + (error.message || JSON.stringify(error)));
        return;
      }

      // ข้อมูลที่ได้จาก view ตรงกับ interface Employee เลย
      setEmployees(data || []);
    } catch (error) {
      console.error("เกิดข้อผิดพลาด (catch):", error);
      alert("เกิดข้อผิดพลาด (catch): " + (error instanceof Error ? error.message : JSON.stringify(error)));
    }
  };

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">จัดการพนักงาน</h1>
        {/* แสดงปุ่มเพิ่มพนักงานเฉพาะ user ที่ไม่ใช่ admin */}
        {user?.role !== 'admin' && (
          <AddEmployeeButton onEmployeeAdded={loadEmployees} />
        )}
      </div>

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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}