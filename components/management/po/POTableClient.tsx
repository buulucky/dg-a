"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPOs, type PO } from "@/app/admin/management/po/actions";
import { toast } from "@/lib/toast";
import AddPOButton from "./AddPOButton";

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

interface POTableClientProps {
  initialPOs: PO[];
  initialTotal: number;
  initialTotalPages: number;
  showAddButton?: boolean;
  isAdmin?: boolean;
}

function POTableClient({
  initialPOs,
  initialTotal,
  initialTotalPages,
  showAddButton = false,
  isAdmin = false,
}: POTableClientProps) {
  const [pos, setPOs] = useState<PO[]>(initialPOs);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPOs, setTotalPOs] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPOs = async (page: number, searchQuery: string) => {
    const result = await getPOs(page, 15, searchQuery);
    if (result.error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล PO: " + result.error);
    } else {
      setPOs(result.data || []);
      setTotalPOs(result.total || 0);
      setTotalPages(result.totalPages || 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      setCurrentPage(1);
      loadPOs(1, searchQuery);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      loadPOs(page, searchQuery);
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH");
  };

  const getStatusBadge = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">รอเริ่มงาน</span>;
    } else if (now >= start && now <= end) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">ใช้งานอยู่</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">หมดอายุ</span>;
    }
  };

  const handleRefresh = () => {
    startTransition(() => {
      loadPOs(currentPage, searchQuery);
    });
  };

  const handleEdit = () => {
    if (selectedPO) {
      setIsEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedPO(null);
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPO) return;

    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // TODO: Implement the actual update logic here
      // This would typically involve calling an API or action to update the PO
      console.log("Updating PO with data:", {
        po_id: selectedPO.po_id,
        po_number: formData.get('po_number'),
        employee_count: formData.get('employee_count'),
        po_type: formData.get('po_type'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("แก้ไขข้อมูล PO สำเร็จ");
      handleCloseModal();
      handleRefresh(); // Refresh the data
      
    } catch (error) {
      console.error("Error updating PO:", error);
      toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล PO");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* เพิ่ม CSS animation */}
      <style jsx>{modalStyles}</style>
      
      <div className="w-full">
        {/* Add PO Button */}
        {showAddButton && (
          <div className="mb-6">
            <AddPOButton onPOAdded={handleRefresh} />
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-4">
          <Input
            type="text"
            placeholder="ค้นหา PO (เลข PO, บริษัท, หน้าที่, ตำแหน่ง)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80"
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
                loadPOs(1, "");
              });
            }}
            disabled={isPending}
          >
            ล้างการค้นหา
          </Button>
        </form>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          แสดง {pos.length} รายการ จากทั้งหมด {totalPOs} รายการ
          {searchQuery && ` (ค้นหา: "${searchQuery}")`}
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลข PO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บริษัท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  กลุ่มงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ตำแหน่งงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่เริ่ม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สิ้นสุด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {isPending ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูล PO"}
                  </td>
                </tr>
              ) : (
                pos.map((po, index) => (
                  <tr
                    key={`${po.po_id}-${index}`}
                    className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => setSelectedPO(po)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border-b">
                      {po.po_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {po.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {po.function_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {po.job_position_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {formatDate(po.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {formatDate(po.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                      {po.start_date && po.end_date ? getStatusBadge(po.start_date, po.end_date) : "-"}
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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
              >
                ก่อนหน้า
              </Button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    disabled={isPending}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}

        {/* PO Detail Modal */}
        {selectedPO && !isEditModalOpen && (
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
                    รายละเอียด PO
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">เลข PO</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedPO.po_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">บริษัท</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedPO.company_name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">กลุ่มงาน</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedPO.function_code}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">ตำแหน่งงาน</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedPO.job_position_name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">จำนวนพนักงาน</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedPO.employee_count || 0} คน</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">สัญญา</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedPO.po_type || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">วันที่เริ่มงาน</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formatDate(selectedPO.start_date)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formatDate(selectedPO.end_date)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                      <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {selectedPO.start_date && selectedPO.end_date ? getStatusBadge(selectedPO.start_date, selectedPO.end_date) : "-"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={handleCloseModal}
                        className="px-6 py-2"
                      >
                        ปิด
                      </Button>
                      {isAdmin && (
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

        {/* Edit PO Modal */}
        {selectedPO && isEditModalOpen && (
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
                    แก้ไขข้อมูล PO
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
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">เลข PO</label>
                      <Input
                        type="text"
                        defaultValue={selectedPO.po_number || ""}
                        placeholder="เลข PO"
                        className="w-full"
                        disabled
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">บริษัท</label>
                      <Input
                        type="text"
                        defaultValue={selectedPO.company_name}
                        placeholder="ชื่อบริษัท"
                        className="w-full"
                        disabled
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">กลุ่มงาน</label>
                      <Input
                        type="text"
                        defaultValue={selectedPO.function_code}
                        placeholder="กลุ่มงาน"
                        className="w-full"
                        disabled
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">ตำแหน่งงาน</label>
                      <Input
                        type="text"
                        defaultValue={selectedPO.job_position_name}
                        placeholder="ตำแหน่งงาน"
                        className="w-full"
                        disabled
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">จำนวนพนักงาน</label>
                      <Input
                        type="number"
                        name="employee_count"
                        defaultValue={selectedPO.employee_count || 0}
                        placeholder="จำนวนพนักงาน"
                        className="w-full"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">ประเภทสัญญา</label>
                      <select 
                        name="po_type"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        defaultValue={selectedPO.po_type || ""}
                      >
                        <option value="">เลือกประเภทสัญญา</option>
                        <option value="รายเดือน">รายเดือน</option>
                        <option value="รายวัน">รายวัน</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">วันที่เริ่มงาน</label>
                      <Input
                        type="date"
                        name="start_date"
                        defaultValue={selectedPO.start_date ? new Date(selectedPO.start_date).toISOString().split('T')[0] : ""}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                      <Input
                        type="date"
                        name="end_date"
                        defaultValue={selectedPO.end_date ? new Date(selectedPO.end_date).toISOString().split('T')[0] : ""}
                        className="w-full"
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
      </div>
    </>
  );
}

export default POTableClient;
