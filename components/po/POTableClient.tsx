"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPOs, type PO } from "../../app/admin/po-management/actions";
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
        {selectedPO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ animation: 'modalFadeIn 0.2s ease-out' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    รายละเอียด PO
                  </h3>
                  <button
                    onClick={() => setSelectedPO(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">เลข PO</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPO.po_number || "-"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">บริษัท</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPO.company_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">กลุ่มงาน</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPO.function_code}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ตำแหน่งงาน</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPO.job_position_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">จำนวนพนักงาน</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPO.employee_count || 0} คน</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">สัญญา</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPO.po_type || "-"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                      <div className="mt-1">
                        {selectedPO.start_date && selectedPO.end_date ? getStatusBadge(selectedPO.start_date, selectedPO.end_date) : "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">วันที่เริ่มงาน</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPO.start_date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPO.end_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPO(null)}
                    >
                      ปิด
                    </Button>
                    {isAdmin && (
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        แก้ไข
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default POTableClient;
