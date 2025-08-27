"use client";
import { useState, useEffect, useTransition } from "react";
import { toast } from "@/lib/toast";
import { 
  getPositionCourses, 
  getJobPositions, 
  getTrainingCourses, 
  getLinkedCourses, 
  updatePositionCourses,
  type PositionCourse, 
  type JobPosition, 
  type TrainingCourse 
} from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

export default function CourseManagementPage() {
  const [positionCourses, setPositionCourses] = useState<PositionCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [, startTransition] = useTransition();

  // Modal states
  const [open, setOpen] = useState(false);
  const [selectedJobPositionId, setSelectedJobPositionId] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loadingJobPositions, setLoadingJobPositions] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    fetchPositionCourses();
  }, []);

  const fetchPositionCourses = async () => {
    setLoading(true);
    
    startTransition(async () => {
      const { data, error } = await getPositionCourses();

      setLoading(false);

      if (error) {
        console.error("Error fetching position courses:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error);
      } else {
        setPositionCourses(data || []);
      }
    });
  };

  // Fetch job positions and courses when modal opens
  useEffect(() => {
    const fetchJobPositions = async () => {
      setLoadingJobPositions(true);
      const { data, error } = await getJobPositions();

      setLoadingJobPositions(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตำแหน่งงาน: " + error);
      } else {
        setJobPositions(data || []);
      }
    };

    const fetchCourses = async () => {
      setLoadingCourses(true);
      const { data, error } = await getTrainingCourses();

      setLoadingCourses(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร: " + error);
      } else {
        setCourses(data || []);
      }
    };

    if (open) {
      fetchJobPositions();
      fetchCourses();
    }
  }, [open]);

  // Fetch linked courses when position is selected
  useEffect(() => {
    const fetchLinkedCourses = async () => {
      if (!selectedJobPositionId) {
        setSelectedCourseIds([]);
        return;
      }

      const { data, error } = await getLinkedCourses(parseInt(selectedJobPositionId));

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตรที่เชื่อมโยง: " + error);
      } else {
        console.log("Loaded linked courses:", data, "for position:", selectedJobPositionId);
        setSelectedCourseIds(data || []);
      }
    };

    fetchLinkedCourses();
  }, [selectedJobPositionId]);

  const handleCourseChange = (courseId: number, checked: boolean) => {
    if (checked) {
      setSelectedCourseIds(prev => [...prev, courseId]);
    } else {
      setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
    }
  };

  const handleSaveWithUpsert = async () => {
    if (!selectedJobPositionId) {
      toast.error("กรุณาเลือกตำแหน่งงาน");
      return;
    }

    setModalLoading(true);

    try {
      const { error } = await updatePositionCourses(
        parseInt(selectedJobPositionId), 
        selectedCourseIds
      );

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการบันทึก: " + error);
      } else {
        toast.success("บันทึกการจับคู่ตำแหน่งกับหลักสูตรสำเร็จ");
        setOpen(false);
        setSelectedJobPositionId("");
        setSelectedCourseIds([]);
        fetchPositionCourses(); // Refresh the table
      }
    } catch (error: unknown) {
      console.error("Save error:", error);
      if (error instanceof Error) {
        toast.error("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึก");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const filteredCourses = positionCourses.filter(
    (item) =>
      item.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.required_courses.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style jsx>{modalStyles}</style>
      <main className="">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">หลักสูตร & ตำแหน่งงาน</h1>
          <p className="text-gray-600 mt-2">จัดการข้อมูลหลักสูตรตามตำแหน่งงาน</p>
        </div>
        
        {/* Add Course Button */}
        <div className="mb-6">
          <Button onClick={() => setOpen(true)}>+ จับคู่ตำแหน่งกับหลักสูตร</Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาตำแหน่งงานหรือหลักสูตร..."
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
                      รวมตำแหน่งงานทั้งหมด: {filteredCourses.length} ตำแหน่ง
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
                        ตำแหน่งงาน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หลักสูตรที่ต้องมี
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-6 py-12 text-center">
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
                              ไม่มีข้อมูลหลักสูตรตามตำแหน่งงาน
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.position_name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {item.required_courses ? (
                                <div className="flex flex-wrap gap-1">
                                  {item.required_courses
                                    .split(", ")
                                    .map((course, courseIndex) => (
                                      <span
                                        key={courseIndex}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {course}
                                      </span>
                                    ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">
                                  ไม่มีหลักสูตรที่กำหนด
                                </span>
                              )}
                            </div>
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

        {/* Add/Edit Modal */}
        {open && (
          <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              style={{ animation: "modalFadeIn 0.2s ease-out" }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                จับคู่ตำแหน่งกับหลักสูตร
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobPosition">ตำแหน่งงาน</Label>
                  <select
                    id="jobPosition"
                    value={selectedJobPositionId}
                    onChange={(e) => setSelectedJobPositionId(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  >
                    <option value="">เลือกตำแหน่งงาน</option>
                    {loadingJobPositions ? (
                      <option disabled>กำลังโหลด...</option>
                    ) : (
                      jobPositions.map((position) => (
                        <option key={position.job_position_id} value={position.job_position_id}>
                          {position.job_position_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <Label>หลักสูตรที่ต้องการ</Label>
                  <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {loadingCourses ? (
                      <div className="text-center text-gray-500">กำลังโหลด...</div>
                    ) : courses.length === 0 ? (
                      <div className="text-center text-gray-500">ไม่มีหลักสูตร</div>
                    ) : (
                      <div className="space-y-2">
                        {courses.map((course) => {
                          const isChecked = selectedCourseIds.includes(course.course_id);
                          
                          return (
                            <label key={course.course_id} className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCourseChange(course.course_id, e.target.checked)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {course.course_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ระยะเวลาใช้งาน: {course.validity_period_days} วัน
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    เลือกแล้ว: {selectedCourseIds.length} หลักสูตร
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSaveWithUpsert} disabled={modalLoading || !selectedJobPositionId}>
                  {modalLoading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
