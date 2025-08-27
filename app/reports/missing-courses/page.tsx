"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type POSummary = {
  po_id: string;
  po_number: string;
  company_name: string;
  job_position_name: string;
  missing_count: number;
};

type CourseMissing = {
  course_name: string;
  employee_count: number;
  employees: EmployeeMissingCourse[];
};

type EmployeeMissingCourse = {
  employee_id: string;
  employee_code: string;
  first_name_th: string;
  last_name_th: string;
  course_name: string;
};

export default function MissingCoursesPage() {
  const [poSummaries, setPOSummaries] = useState<POSummary[]>([]);
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [selectedPOData, setSelectedPOData] = useState<POSummary | null>(null);
  const [courseMissings, setCourseMissings] = useState<CourseMissing[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // ดึงข้อมูล PO Summary
  useEffect(() => {
    async function fetchPOSummary() {
      try {
        const { data, error } = await supabase
          .from('view_employees_missing_courses')
          .select(`
            po_id,
            po_number,
            company_name,
            job_position_name,
            employee_id
          `);

        if (error) throw error;

        // จัดกลุ่มข้อมูลตาม PO และนับจำนวนพนักงานที่ไม่ซ้ำ
        const grouped = data.reduce((acc: Record<string, POSummary & { _employees: Set<string> }>, row) => {
          const key = `${row.po_id}-${row.job_position_name}`;
          if (!acc[key]) {
            acc[key] = {
              po_id: row.po_id,
              po_number: row.po_number,
              company_name: row.company_name,
              job_position_name: row.job_position_name,
              missing_count: 0,
              _employees: new Set()
            };
          }
          acc[key]._employees.add(row.employee_id);
          acc[key].missing_count = acc[key]._employees.size;
          return acc;
        }, {});
        setPOSummaries(Object.values(grouped).map((obj) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _employees, ...rest } = obj;
          return rest;
        }));
      } catch (error) {
        console.error('Error fetching PO summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPOSummary();
  }, [supabase]);

  // ดึงรายละเอียดคอร์สใน PO ที่เลือก
  async function fetchCourseDetails(poId: string, poData: POSummary) {
    setDetailLoading(true);
    try {
      const { data, error } = await supabase
        .from('view_employees_missing_courses')
        .select(`
          employee_id,
          employee_code,
          first_name_th,
          last_name_th,
          course_name
        `)
        .eq('po_id', poId);

      if (error) throw error;

      // จัดกลุ่มตามคอร์ส
      const courseGroups = data.reduce((acc: Record<string, CourseMissing>, row) => {
        if (!acc[row.course_name]) {
          acc[row.course_name] = {
            course_name: row.course_name,
            employee_count: 0,
            employees: []
          };
        }
        
        acc[row.course_name].employees.push(row);
        acc[row.course_name].employee_count = acc[row.course_name].employees.length;
        return acc;
      }, {});

      setCourseMissings(Object.values(courseGroups));
      setSelectedPOData(poData);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setDetailLoading(false);
    }
  }

  const handlePOClick = (po: POSummary) => {
    setSelectedPO(po.po_id);
    fetchCourseDetails(po.po_id, po);
  };

  const handleCourseClick = (course: CourseMissing) => {
    // เปิดหน้าใหม่พร้อม parameters
    const params = new URLSearchParams();
    params.set('po_id', selectedPO!);
    params.set('po_number', selectedPOData!.po_number);
    params.set('company_name', selectedPOData!.company_name);
    params.set('course_name', course.course_name);
    params.set('employee_count', course.employee_count.toString());

    router.push(`/reports/missing-courses/details?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          รายงาน PO ที่พนักงานยังอบรมไม่ครบ
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ตารางสรุป PO */}
        <Card>
          <CardHeader>
            <CardTitle>เลือก PO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {poSummaries.map((po, index) => (
                <div
                  key={`${po.po_id}-${index}`}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedPO === po.po_id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handlePOClick(po)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        PO: {po.po_number}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {po.company_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ตำแหน่ง: {po.job_position_name}
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-4">
                      {po.missing_count} คน
                    </Badge>
                  </div>
                </div>
              ))}
              
              {poSummaries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>ไม่มี PO ที่พนักงานเรียนไม่ครบ</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* รายละเอียดคอร์ส */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPO ? `รายการคอร์สที่ขาด - PO: ${selectedPOData?.po_number}` : 'เลือก PO เพื่อดูรายละเอียด'}
            </CardTitle>
            {selectedPOData && (
              <p className="text-sm text-gray-600">
                {selectedPOData.company_name} - {selectedPOData.job_position_name}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!selectedPO ? (
              <div className="text-center py-8 text-gray-500">
                <p>กรุณาเลือก PO จากรายการทางซ้าย</p>
              </div>
            ) : detailLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-gray-600">กำลังโหลด...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courseMissings.map((course, index) => (
                  <div
                    key={`${course.course_name}-${index}`}
                    className="p-4 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleCourseClick(course)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {course.course_name}
                        </h4>
                        <p className="text-sm text-red-600 mt-1">
                          พนักงานที่ยังไม่อบรม: {course.employee_count} คน
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        ดูรายชื่อ
                      </Button>
                    </div>
                  </div>
                ))}
                
                {courseMissings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>ไม่พบข้อมูลคอร์สที่ขาด</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
