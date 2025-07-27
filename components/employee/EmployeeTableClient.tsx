"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmployees, type Employee } from "../../app/employee/actions";
import ChangeStatusButton from "@/components/employee/ChangeStatusButton";
import AddEmployeeButton from "@/components/employee/AddEmployeeButton";
import { toast } from "@/lib/toast";

// เพิ่ม keyframes สำหรับ animation
const modalStyles = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

interface EmployeeTableClientProps {
  initialEmployees: Employee[];
  initialTotal: number;
  initialTotalPages: number;
  showAddButton?: boolean;
  isAdmin?: boolean;
}

function EmployeeTableClient({
  initialEmployees,
  initialTotal,
  initialTotalPages,
  showAddButton = false,
  isAdmin = false,
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
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: " + result.error);
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
      {/* เพิ่ม CSS animation */}
      <style jsx>{modalStyles}</style>
      
      <div className="w-full">
        {/* Add Employee Button */}
        {showAddButton && (
          <div className="mb-6">
            <AddEmployeeButton 
              onEmployeeAdded={() => {
                // รีเฟรชข้อมูลตารางหลังเพิ่มพนักงาน
                startTransition(() => {
                  loadEmployees(currentPage, searchQuery);
                });
              }}
            />
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-4">
          <Input
            type="text"
            placeholder="ค้นหาพนักงาน"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100"
            style={{
              animation: 'modalFadeIn 0.3s ease-out'
            }}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  ข้อมูลพนักงาน
                </h2>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    เลขบัตรประชาชน
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.personal_id}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    รหัสพนักงาน
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.employee_code || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่อ-นามสกุล (ไทย)
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.prefix_th}{" "}
                    {selectedEmployee.first_name_th}{" "}
                    {selectedEmployee.last_name_th}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่อ-นามสกุล (อังกฤษ)
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.prefix_en}{" "}
                    {selectedEmployee.first_name_en}{" "}
                    {selectedEmployee.last_name_en}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    วันเกิด
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formatDate(selectedEmployee.birth_date)}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    อายุ
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.age ? `${selectedEmployee.age} ปี` : "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    ตำแหน่งงาน
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.job_position_name || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    วันที่เริ่มงาน
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {formatDate(selectedEmployee.start_date)}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    อายุงาน
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
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

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    เลข PO
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.po_number || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    บริษัท
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.company_name || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    สถานะ
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {selectedEmployee.status_code || "-"}
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                {!isAdmin && (
                  <ChangeStatusButton
                    employeeId={selectedEmployee.employee_id}
                    onStatusChange={() => {
                      setSelectedEmployee(null);
                      // รีเฟรชข้อมูลตารางหลังเปลี่ยนสถานะ
                      startTransition(() => {
                        loadEmployees(currentPage, searchQuery);
                      });
                    }}
                  />
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedEmployee(null)}
                  className={`px-6 py-2 ${isAdmin ? "ml-auto" : ""}`}
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
