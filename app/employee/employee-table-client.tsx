"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmployees, type Employee } from "./actions";

interface EmployeeTableClientProps {
  initialEmployees: Employee[];
  initialTotal: number;
  initialTotalPages: number;
}

export function EmployeeTableClient({ 
  initialEmployees, 
  initialTotal, 
  initialTotalPages
}: EmployeeTableClientProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadEmployees = async (page: number, searchQuery: string) => {
    const result = await getEmployees(page, 15, searchQuery);
    if (result.error) {
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: " + result.error);
    } else {
      setEmployees(result.data || []);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      setCurrentPage(1);
      loadEmployees(1, search);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      loadEmployees(page, search);
    });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      buttons.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isPending}
        >
          ← ก่อนหน้า
        </Button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          disabled={isPending}
          className={currentPage === i ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          {i}
        </Button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      buttons.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isPending}
        >
          ถัดไป →
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="ค้นหาพนักงาน (ชื่อ, นามสกุล, รหัสพนักงาน, ตำแหน่ง, เลขบัตรประชาชน)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "กำลังค้นหา..." : "ค้นหา"}
        </Button>
        {search && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              setCurrentPage(1);
              startTransition(() => {
                loadEmployees(1, "");
              });
            }}
            disabled={isPending}
          >
            ล้าง
          </Button>
        )}
      </form>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          {search && (
            <span>ผลการค้นหา &quot;{search}&quot;: </span>
          )}
          แสดง {employees.length} รายการ จากทั้งหมด {total} รายการ
        </div>
        <div>
          หน้าที่ {currentPage} จาก {totalPages}
        </div>
      </div>

      {/* Table */}
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
                  {search ? "ไม่พบข้อมูลพนักงานที่ค้นหา" : "ไม่มีข้อมูลพนักงาน"}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {renderPaginationButtons()}
        </div>
      )}
    </div>
  );
}
