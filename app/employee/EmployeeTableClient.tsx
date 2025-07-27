"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmployees, type Employee } from "./actions";
import ResignButton from "@/components/employee/ChangeStatusButton";
import ChangeStatusButton from "@/components/employee/ChangeStatusButton";

interface EmployeeTableClientProps {
  initialEmployees: Employee[];
  initialTotal: number;
  initialTotalPages: number;
}

function EmployeeTableClient({
  initialEmployees,
  initialTotal,
  initialTotalPages,
}: EmployeeTableClientProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const loadEmployees = async (page: number, searchQuery: string) => {
    const result = await getEmployees(page, 15, searchQuery);
    if (result.error) {
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: " + result.error);
    } else {
      setEmployees(result.data || []);
      setTotalEmployees(result.total || 0);
      setTotalPages(result.totalPages || 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      setCurrentPage(1);
      loadEmployees(1, searchQuery);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      loadEmployees(page, searchQuery);
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH");
  };

  return (
    <>
      <div className="w-full">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-4">
          <Input
            type="text"
            placeholder="ค้นหาพนักงาน (ชื่อ, นามสกุล, เลขบัตรประชาชน, ตำแหน่ง)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "กำลังค้นหา..." : "ค้นหา"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
              startTransition(() => {
                loadEmployees(1, "");
              });
            }}
            disabled={isPending}
          >
            ล้างการค้นหา
          </Button>
        </form>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          แสดง {employees.length} รายการ จากทั้งหมด {totalEmployees} รายการ
          {searchQuery && ` (ค้นหา: "${searchQuery}")`}
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลขบัตรประชาชน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสพนักงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลข PO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ตำแหน่งงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่เริ่มงาน
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {isPending ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูลพนักงาน"}
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr
                    key={`${employee.employee_id}-${index}`}
                    className="hover:bg-purple-100 cursor-pointer"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {employee.personal_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {employee.employee_code || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {employee.prefix_th} {employee.first_name_th}{" "}
                      {employee.last_name_th}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {employee.po_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {employee.job_position_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {formatDate(employee.start_date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              หน้า {currentPage} จาก {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
              >
                หน้าก่อนหน้า
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isPending}
                      className="w-10 h-10 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
              >
                หน้าถัดไป
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  ข้อมูลพนักงาน
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedEmployee(null)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลขบัตรประชาชน
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.personal_id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสพนักงาน
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.employee_code || "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ-นามสกุล (ไทย)
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.prefix_th}{" "}
                    {selectedEmployee.first_name_th}{" "}
                    {selectedEmployee.last_name_th}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ-นามสกุล (อังกฤษ)
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.prefix_en}{" "}
                    {selectedEmployee.first_name_en}{" "}
                    {selectedEmployee.last_name_en}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันเกิด
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedEmployee.birth_date)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อายุ
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.age ? `${selectedEmployee.age} ปี` : "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ตำแหน่งงาน
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.job_position_name || "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่เริ่มงาน
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedEmployee.start_date)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อายุงาน
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.work_years &&
                    typeof selectedEmployee.work_years === "object" &&
                    (selectedEmployee.work_years.years ||
                      selectedEmployee.work_years.months ||
                      selectedEmployee.work_years.days) ? (
                      <>
                        {selectedEmployee.work_years.years
                          ? `${selectedEmployee.work_years.years} ปี`
                          : ""}
                        {selectedEmployee.work_years.months
                          ? ` ${selectedEmployee.work_years.months} เดือน`
                          : ""}
                        {selectedEmployee.work_years.days
                          ? ` ${selectedEmployee.work_years.days} วัน`
                          : ""}
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลข PO
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.po_number || "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    บริษัท
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.company_name || "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานะ
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.status_code || "-"}
                  </p>
                </div>
              </div>
              <div>
                <ChangeStatusButton
                  employeeId={selectedEmployee.employee_id}
                  onStatusChange={() => setSelectedEmployee(null)}
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEmployee(null)}
                >
                  ปิด
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EmployeeTableClient;
