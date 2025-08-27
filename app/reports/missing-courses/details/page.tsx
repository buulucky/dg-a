"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";
import { Printer } from "lucide-react";
import { saveAs } from "file-saver";

type EmployeeDetail = {
  employee_id: string;
  employee_code: string;
  first_name_th: string;
  last_name_th: string;
};

function MissingCourseDetailsContent() {
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const poId = searchParams.get("po_id");
  const poNumber = searchParams.get("po_number");
  const companyName = searchParams.get("company_name");
  const courseName = searchParams.get("course_name");
  const employeeCount = searchParams.get("employee_count");

  useEffect(() => {
    async function fetchEmployeeDetails() {
      if (!poId || !courseName) return;

      try {
        const { data, error } = await supabase
          .from("view_employees_missing_courses")
          .select(
            `
            employee_id,
            employee_code,
            first_name_th,
            last_name_th
          `
          )
          .eq("po_id", poId)
          .eq("course_name", courseName);

        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employee details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeeDetails();
  }, [poId, courseName, supabase]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "employees_missing_courses.xlsx");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToExcel}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            รายชื่อพนักงานที่ยังไม่อบรม
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">PO:</span> {poNumber} -{" "}
              {companyName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">คอร์ส:</span> {courseName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">จำนวนพนักงาน:</span> {employeeCount}{" "}
              คน
            </p>
          </div>
        </div>
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลำดับ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสพนักงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    ไม่พบข้อมูลพนักงาน
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employee.employee_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employee_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.first_name_th} {employee.last_name_th}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function MissingCourseDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    }>
      <MissingCourseDetailsContent />
    </Suspense>
  );
}
