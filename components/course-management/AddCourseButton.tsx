"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

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

interface AddCourseButtonProps {
  onCourseAdded?: () => void;
}

interface JobPosition {
  job_position_id: string;
  job_position_name: string;
}

interface Course {
  course_id: string;
  course_name: string;
  validity_period_days: number;
}

export default function AddCourseButton({ onCourseAdded }: AddCourseButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedJobPositionId, setSelectedJobPositionId] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingJobPositions, setLoadingJobPositions] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const fetchJobPositions = async () => {
      setLoadingJobPositions(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("job_positions")
        .select("job_position_id, job_position_name")
        .order("job_position_name");

      setLoadingJobPositions(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตำแหน่งงาน: " + error.message);
      } else {
        setJobPositions(data || []);
      }
    };

    const fetchCourses = async () => {
      setLoadingCourses(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("training_courses")
        .select("course_id, course_name, validity_period_days")
        .order("course_name");

      setLoadingCourses(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร: " + error.message);
      } else {
        const formattedCourses = data?.map(course => ({
          ...course,
          course_id: course.course_id.toString()
        })) || [];
        setCourses(formattedCourses);
      }
    };

    if (open) {
      fetchJobPositions();
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    const fetchLinkedCourses = async () => {
      if (!selectedJobPositionId) {
        setSelectedCourseIds([]);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("position_courses")
        .select("course_id")
        .eq("job_position_id", selectedJobPositionId);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตรที่เชื่อมโยง: " + error.message);
      } else {
        const linkedCourseIds = data?.map(item => item.course_id.toString()) || [];
        console.log("Loaded linked courses:", linkedCourseIds, "for position:", selectedJobPositionId);
        setSelectedCourseIds(linkedCourseIds);
      }
    };

    fetchLinkedCourses();
  }, [selectedJobPositionId]);

  const handleCourseChange = (courseId: string, checked: boolean) => {
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

    setLoading(true);
    const supabase = createClient();

    try {
      const { data: existingData, error: fetchError } = await supabase
        .from("position_courses")
        .select("course_id")
        .eq("job_position_id", selectedJobPositionId);

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }

      const existingCourseIds = existingData?.map(item => item.course_id.toString()) || [];
      console.log("Existing courses:", existingCourseIds);
      console.log("Selected courses:", selectedCourseIds);

      const toDelete = existingCourseIds.filter(id => !selectedCourseIds.includes(id));
      
      const toInsert = selectedCourseIds.filter(id => !existingCourseIds.includes(id));

      console.log("To delete:", toDelete);
      console.log("To insert:", toInsert);

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("position_courses")
          .delete()
          .eq("job_position_id", selectedJobPositionId)
          .in("course_id", toDelete.map(id => parseInt(id)));

        if (deleteError) {
          console.error("Delete error:", deleteError);
          throw deleteError;
        }
      }

      if (toInsert.length > 0) {
        const insertData = toInsert.map(courseId => ({
          job_position_id: parseInt(selectedJobPositionId),
          course_id: parseInt(courseId)
        }));

        console.log("Inserting new data:", insertData);
        const { error: insertError } = await supabase
          .from("position_courses")
          .insert(insertData);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
      }

      toast.success("บันทึกการจับคู่ตำแหน่งกับหลักสูตรสำเร็จ");
      setOpen(false);
      setSelectedJobPositionId("");
      setSelectedCourseIds([]);
      if (onCourseAdded) onCourseAdded();

    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{modalStyles}</style>
      <Button onClick={() => setOpen(true)}>+ จับคู่ตำแหน่งกับหลักสูตร</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
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
              <Button onClick={handleSaveWithUpsert} disabled={loading || !selectedJobPositionId}>
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
