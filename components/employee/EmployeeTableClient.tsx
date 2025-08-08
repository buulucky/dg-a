"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmployees, updateEmployee, type Employee } from "../../app/employee/actions";
import ChangeStatusButton from "@/components/employee/ChangeStatusButton";
import AddEmployeeButton from "@/components/employee/AddEmployeeButton";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

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
  const [selectedPO, setSelectedPO] = useState("");
  const [poList, setPoList] = useState<{ po_id: string; po_number: string; job_position_name?: string; }[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseStatuses, setCourseStatuses] = useState<{ course_id: number; course_name: string; status: string; date_completed?: string; expiry_date?: string; }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseModalEmployee, setCourseModalEmployee] = useState<Employee | null>(null);
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    course: { course_id: number; course_name: string; } | null;
    completionDate: string;
  }>({
    isOpen: false,
    course: null,
    completionDate: new Date().toISOString().split('T')[0] // Today's date as default
  });

  const loadEmployees = async (page: number, searchQuery: string, poFilter?: string) => {
    const result = await getEmployees(page, 15, searchQuery, poFilter);
    if (result.error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: " + result.error);
    } else {
      setEmployees(result.data || []);
      setTotalEmployees(result.total || 0);
      setTotalPages(result.totalPages || 1);
    }
  };

  const loadPoList = async () => {
    try {
      const supabase = createClient();
      const { data: pos, error } = await supabase
        .from("view_po_relationship")
        .select("po_id, po_number, job_position_name")
        .order("po_number");

      if (error) {
        console.error("Error loading PO list:", error);
        return;
      }

      setPoList(pos || []);
    } catch (error) {
      console.error("Error loading PO list:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      setCurrentPage(1);
      loadEmployees(1, searchQuery, selectedPO);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      loadEmployees(page, searchQuery, selectedPO);
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH");
  };

  const fetchEmployeeCourseStatuses = async (employeeId: string) => {
    setLoadingCourses(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("view_employee_course_statuses")
      .select("*")
      .eq("employee_id", employeeId)
      .order("course_name");

    setLoadingCourses(false);

    if (error) {
      console.error("Error fetching course statuses:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร");
      setCourseStatuses([]);
    } else {
      setCourseStatuses(data || []);
    }
  };

  // useEffect สำหรับดึงข้อมูลหลักสูตรเมื่อเลือกพนักงาน
  useEffect(() => {
    if (courseModalEmployee && showCourseModal) {
      fetchEmployeeCourseStatuses(courseModalEmployee.employee_id);
    } else {
      setCourseStatuses([]);
    }
  }, [courseModalEmployee, showCourseModal]);

  // useEffect สำหรับโหลดรายการ PO เมื่อ component mount
  useEffect(() => {
    loadPoList();
  }, []);

  const handleEdit = () => {
    if (selectedEmployee) {
      setIsEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setIsEditModalOpen(false);
  };

  const handleShowCourseModal = (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation(); // ป้องกันไม่ให้เปิด employee detail modal
    setCourseModalEmployee(employee);
    setShowCourseModal(true);
  };

  // Handle opening completion modal
  const handleOpenCompletionModal = (course: { course_id: number; course_name: string; }) => {
    setCompletionModal({
      isOpen: true,
      course,
      completionDate: new Date().toISOString().split('T')[0]
    });
  };

  // Handle closing completion modal
  const handleCloseCompletionModal = () => {
    setCompletionModal({
      isOpen: false,
      course: null,
      completionDate: new Date().toISOString().split('T')[0]
    });
  };

  // Handle saving course completion
  const handleSaveCourseCompletion = async () => {
    if (!completionModal.course || !courseModalEmployee) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/course-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: courseModalEmployee.employee_id,
          course_id: completionModal.course.course_id,
          date_completed: completionModal.completionDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save course completion`);
      }

      toast.success(`บันทึกข้อมูลการอบรมหลักสูตร "${completionModal.course.course_name}" สำเร็จ`);
      
      // Refresh course statuses
      await fetchEmployeeCourseStatuses(courseModalEmployee.employee_id);
      
      // Close modal
      handleCloseCompletionModal();
    } catch (error) {
      console.error('Error saving course completion:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    setCourseModalEmployee(null);
    setCourseStatuses([]);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // เรียกใช้ action สำหรับอัปเดตข้อมูลพนักงาน
      const result = await updateEmployee({
        employeeId: selectedEmployee.employee_id,
        prefix_th: formData.get('prefix_th') as string,
        first_name_th: formData.get('first_name_th') as string,
        last_name_th: formData.get('last_name_th') as string,
        prefix_en: formData.get('prefix_en') as string,
        first_name_en: formData.get('first_name_en') as string,
        last_name_en: formData.get('last_name_en') as string,
        birth_date: formData.get('birth_date') as string,
      });
      
      if (result.error) {
        toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล: " + result.error);
        return;
      }
      
      toast.success("แก้ไขข้อมูลพนักงานสำเร็จ");
      handleCloseModal();
      // Refresh the data
      startTransition(() => {
        loadEmployees(currentPage, searchQuery, selectedPO);
      });
      
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลพนักงาน");
    } finally {
      setIsSubmitting(false);
    }
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
                  loadEmployees(currentPage, searchQuery, selectedPO);
                });
              }}
            />
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-4 flex-wrap">
          <Input
            type="text"
            placeholder="ค้นหาพนักงาน"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56"
          />
          <select
            value={selectedPO}
            onChange={(e) => setSelectedPO(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- เลือก PO --</option>
            {poList.map((po) => (
              <option key={po.po_id} value={po.po_id}>
                {po.po_number} - {po.job_position_name || "ไม่มีตำแหน่ง"}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={isPending}>
            {isPending ? "กำลังค้นหา..." : "ค้นหา"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedPO("");
              setCurrentPage(1);
              startTransition(() => {
                loadEmployees(1, "", "");
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
          {selectedPO && ` (PO: ${poList.find(po => po.po_id === selectedPO)?.po_number || selectedPO})`}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะอบรม
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
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 border-b cursor-pointer hover:text-blue-800 hover:underline"
                      onClick={(e) => handleShowCourseModal(employee, e)}
                    >
                      {employee.course_progress_summary || "ดูสถานะอบรม"}
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
      {selectedEmployee && !isEditModalOpen && (
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
                  onClick={handleCloseModal}
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
              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  {!isAdmin && (
                    <ChangeStatusButton
                      employeeId={selectedEmployee.employee_id}
                      onStatusChange={() => {
                        setSelectedEmployee(null);
                        // รีเฟรชข้อมูลตารางหลังเปลี่ยนสถานะ
                        startTransition(() => {
                          loadEmployees(currentPage, searchQuery, selectedPO);
                        });
                      }}
                    />
                  )}
                  <div className="flex justify-end space-x-3 ml-auto">
                    <Button
                      variant="outline"
                      onClick={handleCloseModal}
                      className="px-6 py-2"
                    >
                      ปิด
                    </Button>
                    {!isAdmin && (
                      <Button
                        onClick={handleEdit}
                      >
                        แก้ไข
                      </Button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {selectedEmployee && isEditModalOpen && (
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
                  แก้ไขข้อมูลพนักงาน
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleSaveEdit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ข้อมูลที่ไม่สามารถแก้ไขได้ */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      เลขบัตรประชาชน
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedEmployee.personal_id}
                      className="w-full"
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      รหัสพนักงาน
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedEmployee.employee_code || ""}
                      className="w-full"
                      disabled
                    />
                  </div>

                  {/* ข้อมูลภาษาไทยที่แก้ไขได้ */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      คำนำหน้า (ไทย)
                    </label>
                    <select
                      name="prefix_th"
                      defaultValue={selectedEmployee.prefix_th || ""}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                    >
                      <option value="">เลือกคำนำหน้า</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      ชื่อ (ไทย)
                    </label>
                    <Input
                      type="text"
                      name="first_name_th"
                      defaultValue={selectedEmployee.first_name_th || ""}
                      placeholder="ชื่อภาษาไทย"
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      นามสกุล (ไทย)
                    </label>
                    <Input
                      type="text"
                      name="last_name_th"
                      defaultValue={selectedEmployee.last_name_th || ""}
                      placeholder="นามสกุลภาษาไทย"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* ข้อมูลภาษาอังกฤษที่แก้ไขได้ */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      คำนำหน้า (อังกฤษ)
                    </label>
                    <select
                      name="prefix_en"
                      defaultValue={selectedEmployee.prefix_en || ""}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                    >
                      <option value="">เลือกคำนำหน้า</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      ชื่อ (อังกฤษ)
                    </label>
                    <Input
                      type="text"
                      name="first_name_en"
                      defaultValue={selectedEmployee.first_name_en || ""}
                      placeholder="First Name"
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      นามสกุล (อังกฤษ)
                    </label>
                    <Input
                      type="text"
                      name="last_name_en"
                      defaultValue={selectedEmployee.last_name_en || ""}
                      placeholder="Last Name"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* วันเกิดที่แก้ไขได้ */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      วันเกิด
                    </label>
                    <Input
                      type="date"
                      name="birth_date"
                      defaultValue={selectedEmployee.birth_date ? new Date(selectedEmployee.birth_date).toISOString().split('T')[0] : ""}
                      className="w-full"
                    />
                  </div>

                  {/* ข้อมูลที่ไม่สามารถแก้ไขได้ */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      ตำแหน่งงาน
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedEmployee.job_position_name || ""}
                      className="w-full"
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      วันที่เริ่มงาน
                    </label>
                    <Input
                      type="text"
                      defaultValue={formatDate(selectedEmployee.start_date)}
                      className="w-full"
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      เลข PO
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedEmployee.po_number || ""}
                      className="w-full"
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      บริษัท
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedEmployee.company_name || ""}
                      className="w-full"
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      สถานะ
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedEmployee.status_code || ""}
                      className="w-full"
                      disabled
                    />
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    กลับไปดูรายละเอียด
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Status Modal */}
      {courseModalEmployee && showCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100"
            style={{
              animation: 'modalFadeIn 0.3s ease-out'
            }}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    สถานะการอบรมหลักสูตร
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {courseModalEmployee.prefix_th} {courseModalEmployee.first_name_th} {courseModalEmployee.last_name_th}
                  </p>
                </div>
                <button
                  onClick={handleCloseCourseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Course Status Table */}
              <div className="mt-4">
                {loadingCourses ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">กำลังโหลดข้อมูลหลักสูตร...</span>
                  </div>
                ) : courseStatuses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-lg font-medium">ไม่มีข้อมูลหลักสูตรที่ต้องอบรม</p>
                    <p className="text-sm">พนักงานคนนี้ไม่มีหลักสูตรที่ต้องอบรมตามตำแหน่งงาน</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                            หลักสูตร
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                            วันที่อบรม
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                            วันหมดอายุ
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            สถานะ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courseStatuses.map((course, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-300">
                              {course.course_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300">
                              {course.date_completed ? formatDate(course.date_completed) : "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300">
                              {course.expiry_date ? formatDate(course.expiry_date) : "-"}
                            </td>
                            <td className="px-6 py-4 text-sm border-gray-300">
                              {course.status === "ยังไม่อบรม" || course.status === "ใกล้หมดอายุ" || course.status === "หมดอายุแล้ว" ? (
                                <button
                                  onClick={isAdmin ? () => handleOpenCompletionModal({ course_id: course.course_id, course_name: course.course_name }) : undefined}
                                  disabled={!isAdmin}
                                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${
                                    isAdmin
                                      ? 'hover:shadow-md cursor-pointer'
                                      : 'opacity-60 cursor-not-allowed'
                                  } ${
                                    course.status === "ใกล้หมดอายุ"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                      : course.status === "หมดอายุแล้ว"
                                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  }`}
                                  title={isAdmin ? "คลิกเพื่อบันทึกวันที่อบรม" : "เฉพาะผู้ดูแลระบบ (admin) เท่านั้นที่สามารถบันทึกวันที่อบรมได้"}
                                >
                                  {course.status}
                                </button>
                              ) : (
                                <span
                                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                    course.status === "ปกติ"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {course.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCloseCourseModal}
                    className="px-6 py-2"
                  >
                    ปิด
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Completion Modal */}
      {completionModal.isOpen && completionModal.course && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  บันทึกวันที่อบรม
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  หลักสูตร: {completionModal.course.course_name}
                </p>
                <p className="text-sm text-gray-600">
                  พนักงาน: {courseModalEmployee?.employee_code} - {courseModalEmployee?.first_name_th} {courseModalEmployee?.last_name_th}
                </p>
              </div>

              {/* Form */}
              <div className="mb-6">
                <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่อบรมเสร็จสิ้น
                </label>
                <input
                  type="date"
                  id="completionDate"
                  value={completionModal.completionDate}
                  onChange={(e) => setCompletionModal(prev => ({ ...prev, completionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]} // Cannot select future dates
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseCompletionModal}
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSaveCourseCompletion}
                  disabled={isSubmitting || !completionModal.completionDate}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
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
