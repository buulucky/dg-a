"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import AddCourseButton from "@/components/management/course/AddCourseButton";

interface PositionCourse {
  position_name: string;
  required_courses: string;
}

export default function CourseManagementPage() {
  const [positionCourses, setPositionCourses] = useState<PositionCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPositionCourses();
  }, []);

  const fetchPositionCourses = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("view_position_required_courses")
      .select("*")
      .order("position_name");

    setLoading(false);

    if (error) {
      console.error("Error fetching position courses:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error.message);
    } else {
      setPositionCourses(data || []);
    }
  };

  const filteredCourses = positionCourses.filter(
    (item) =>
      item.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.required_courses.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการหลักสูตร</h1>
        <p className="text-gray-600 mt-2">จัดการข้อมูลหลักสูตรตามตำแหน่งงาน</p>
      </div>
      <div className="mb-6">
        <AddCourseButton onCourseAdded={fetchPositionCourses} />
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
    </main>
  );
}
