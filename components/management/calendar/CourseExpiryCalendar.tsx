"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { th } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourseList, getCourseExpiryData, type CourseOption, type CourseExpiryData } from "@/app/reports/calendar/actions";

const locales = {
  'th': th,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    employeeCount: number;
    date: string;
  };
}

export default function CourseExpiryCalendar() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);
  const [expiryData, setExpiryData] = useState<CourseExpiryData[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Load course list
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseList = await getCourseList();
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourse(courseList[0].course_id);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Load expiry data when course changes
  useEffect(() => {
    const fetchExpiryData = async () => {
      if (selectedCourse === 0) return;
      
      try {
        setLoading(true);
        const data = await getCourseExpiryData(selectedCourse);
        setExpiryData(data);
      } catch (error) {
        console.error("Error fetching expiry data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiryData();
  }, [selectedCourse]);

  // Convert expiry data to calendar events
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = expiryData.map((item, index) => {
      const eventDate = new Date(item.course_expiry_date + 'T00:00:00');
      return {
        id: `${selectedCourse}-${item.course_expiry_date}-${index}`,
        title: `${item.employee_count}`,
        start: eventDate,
        end: eventDate,
        resource: {
          employeeCount: item.employee_count,
          date: item.course_expiry_date
        }
      };
    });

    setEvents(calendarEvents);
  }, [expiryData, selectedCourse]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const employeeCount = event.resource.employeeCount;
    let backgroundColor = '#3174ad';
    
    if (employeeCount > 10) {
      backgroundColor = '#dc2626'; // Red for high count
    } else if (employeeCount > 5) {
      backgroundColor = '#ea580c'; // Orange for medium count  
    } else if (employeeCount > 0) {
      backgroundColor = '#16a34a'; // Green for low count
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '2px solid rgba(255,255,255,0.3)',
        fontWeight: 'bold',
        textAlign: 'center', // ต้องเป็น 'center' ไม่ใช่ string อะไรก็ได้
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } as React.CSSProperties // cast ให้ตรง type
    };
  };

  const CustomEvent = ({ event }: { event: CalendarEvent }) => (
    <div className="p-2 text-center">
      <div className="text-lg font-bold text-white">
        {event.resource.employeeCount}
      </div>
      <div className="text-xs font-medium text-white opacity-90">
        คน
      </div>
    </div>
  );

  if (loading && courses.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ปฏิทินหมดอายุคอร์ส</h1>
        <p className="text-gray-600">แสดงจำนวนพนักงานที่ต้องเรียนคอร์สใหม่ในแต่ละวัน</p>
      </div>

      {/* Course Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>เลือกคอร์สฝึกอบรม</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(parseInt(e.target.value))}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0}>เลือกคอร์ส</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name} (อายุ {course.validity_period_days} วัน)
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Calendar */}
      {selectedCourse > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                ปฏิทินหมดอายุคอร์ส - {courses.find(c => c.course_id === selectedCourse)?.course_name}
              </CardTitle>
              <div className="flex gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>1-5 คน</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-600 rounded"></div>
                  <span>6-10 คน</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-600 rounded"></div>
                  <span>10+ คน</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="h-[700px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  eventPropGetter={eventStyleGetter}
                  views={['month']}
                  defaultView="month"
                  components={{
                    event: CustomEvent,
                  }}
                  messages={{
                    next: "ถัดไป",
                    previous: "ก่อนหน้า",
                    today: "วันนี้",
                    month: "เดือน",
                    week: "สัปดาห์",
                    day: "วัน",
                    agenda: "กำหนดการ",
                    date: "วันที่",
                    time: "เวลา",
                    event: "กิจกรรม",
                    noEventsInRange: "ไม่มีข้อมูลในช่วงเวลานี้",
                    showMore: (total: number) => `แสดงเพิ่มเติม (${total})`
                  }}
                  culture="th"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {selectedCourse > 0 && expiryData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>สรุปข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {expiryData.reduce((sum, item) => sum + item.employee_count, 0)}
                </div>
                <div className="text-sm text-gray-600">รวมทั้งหมด (คน)</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {expiryData.length}
                </div>
                <div className="text-sm text-gray-600">จำนวนวันที่มีการหมดอายุ</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {expiryData.length > 0 ? Math.round(expiryData.reduce((sum, item) => sum + item.employee_count, 0) / expiryData.length) : 0}
                </div>
                <div className="text-sm text-gray-600">เฉลี่ยต่อวัน (คน)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
