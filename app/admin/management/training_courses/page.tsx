"use client";
import { useState, useEffect } from "react";
import { getTrainingCourses, createTrainingCourse, updateTrainingCourse, type TrainingCourse } from "./actions";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrainingCoursesPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newValidityPeriod, setNewValidityPeriod] = useState(30);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingValidityPeriod, setEditingValidityPeriod] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await getTrainingCourses();

    setLoading(false);

    if (error) {
      console.error("Error fetching courses:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error);
    } else {
      setCourses(data || []);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_id.toString().includes(searchTerm)
  );

  const handleCreate = async () => {
    if (!newCourseName.trim()) {
      toast.error("กรุณากรอกชื่อหลักสูตร");
      return;
    }

    setIsSubmitting(true);
    const { error } = await createTrainingCourse(newCourseName.trim(), newValidityPeriod);
    
    if (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มหลักสูตร: " + error);
    } else {
      toast.success("เพิ่มหลักสูตรสำเร็จ");
      setNewCourseName("");
      setNewValidityPeriod(30);
      setShowAddModal(false);
      await fetchCourses();
    }
    setIsSubmitting(false);
  };

  const handleEdit = (course: TrainingCourse) => {
    setEditingId(course.course_id);
    setEditingName(course.course_name);
    setEditingValidityPeriod(course.validity_period_days);
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      toast.error("กรุณากรอกชื่อหลักสูตร");
      return;
    }

    if (editingId) {
      setIsSubmitting(true);
      const { error } = await updateTrainingCourse(editingId, editingName.trim(), editingValidityPeriod);
      
      if (error) {
        toast.error("เกิดข้อผิดพลาดในการแก้ไขหลักสูตร: " + error);
      } else {
        toast.success("แก้ไขหลักสูตรสำเร็จ");
        setEditingId(null);
        setEditingName("");
        setEditingValidityPeriod(30);
        await fetchCourses();
      }
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingValidityPeriod(30);
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewCourseName("");
    setNewValidityPeriod(30);
  };

  return (
    <main className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">หลักสูตรการฝึกอบรม</h1>
        <p className="text-gray-600 mt-2">จัดการข้อมูลหลักสูตรการฝึกอบรม</p>
      </div>

      {/* Add Course Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowAddModal(true)}
          disabled={isSubmitting}
        >
          + เพิ่มหลักสูตร
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาหลักสูตร (ชื่อหรือ ID)..."
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
                    รวมหลักสูตรทั้งหมด: {filteredCourses.length} หลักสูตร
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
                      ชื่อหลักสูตร
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ระยะเวลาการมีผล (วัน)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
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
                            {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลหลักสูตร"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr key={course.course_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {course.course_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === course.course_id ? (
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
                              {course.course_name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === course.course_id ? (
                            <Input
                              type="number"
                              value={editingValidityPeriod}
                              onChange={(e) => setEditingValidityPeriod(parseInt(e.target.value) || 30)}
                              className="w-20"
                              min="1"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">
                              {course.validity_period_days}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingId === course.course_id ? (
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
                              onClick={() => handleEdit(course)}
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
            <h3 className="text-lg font-semibold mb-4">เพิ่มหลักสูตรใหม่</h3>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="ชื่อหลักสูตร"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate();
                  }
                  if (e.key === 'Escape') {
                    handleCancelAdd();
                  }
                }}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระยะเวลาการมีผล (วัน)
                </label>
                <Input
                  type="number"
                  placeholder="30"
                  value={newValidityPeriod}
                  onChange={(e) => setNewValidityPeriod(parseInt(e.target.value) || 30)}
                  className="w-full"
                  min="1"
                autoFocus
                />
              </div>
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
                  disabled={isSubmitting || !newCourseName.trim()}
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
