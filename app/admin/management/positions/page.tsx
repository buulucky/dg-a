"use client";
import { useState, useEffect } from "react";
import { getJobPositions, createJobPosition, updateJobPosition, type JobPosition } from "@/app/admin/management/positions/actions";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PositionsPage() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPositionName, setNewPositionName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    const { data, error } = await getJobPositions();

    setLoading(false);

    if (error) {
      console.error("Error fetching positions:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error);
    } else {
      setPositions(data || []);
    }
  };

  const filteredPositions = positions.filter((position) =>
    position.job_position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.job_position_id.toString().includes(searchTerm)
  );

  const handleCreate = async () => {
    if (!newPositionName.trim()) {
      toast.error("กรุณากรอกชื่อตำแหน่งงาน");
      return;
    }

    setIsSubmitting(true);
    const { error } = await createJobPosition(newPositionName.trim());
    
    if (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มตำแหน่งงาน: " + error);
    } else {
      toast.success("เพิ่มตำแหน่งงานสำเร็จ");
      setNewPositionName("");
      setShowAddModal(false);
      await fetchPositions();
    }
    setIsSubmitting(false);
  };

  const handleEdit = (position: JobPosition) => {
    setEditingId(position.job_position_id);
    setEditingName(position.job_position_name);
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      toast.error("กรุณากรอกชื่อตำแหน่งงาน");
      return;
    }

    if (editingId) {
      setIsSubmitting(true);
      const { error } = await updateJobPosition(editingId, editingName.trim());
      
      if (error) {
        toast.error("เกิดข้อผิดพลาดในการแก้ไขตำแหน่งงาน: " + error);
      } else {
        toast.success("แก้ไขตำแหน่งงานสำเร็จ");
        setEditingId(null);
        setEditingName("");
        await fetchPositions();
      }
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewPositionName("");
  };

  return (
    <main className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ตำแหน่งงาน</h1>
        <p className="text-gray-600 mt-2">จัดการข้อมูลตำแหน่งงาน</p>
      </div>

      {/* Add Position Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowAddModal(true)}
          disabled={isSubmitting}
        >
          + เพิ่มตำแหน่งงาน
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาตำแหน่งงาน (ชื่อหรือ ID)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    รวมตำแหน่งงานทั้งหมด: {filteredPositions.length} ตำแหน่ง
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อตำแหน่งงาน
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPositions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <p className="text-lg font-medium">ไม่พบข้อมูล</p>
                          <p className="text-sm">
                            {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลตำแหน่งงาน"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPositions.map((position) => (
                      <tr key={position.job_position_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {position.job_position_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === position.job_position_id ? (
                            <Input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdate();
                                }
                                if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {position.job_position_name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingId === position.job_position_id ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={handleUpdate}
                                disabled={isSubmitting || !editingName.trim()}
                              >
                                บันทึก
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                              >
                                ยกเลิก
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(position)}
                              disabled={isSubmitting || editingId !== null}
                            >
                              แก้ไข
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">เพิ่มตำแหน่งงานใหม่</h3>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="ชื่อตำแหน่งงาน"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate();
                  }
                  if (e.key === 'Escape') {
                    handleCancelAdd();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={handleCancelAdd}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={isSubmitting || !newPositionName.trim()}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
