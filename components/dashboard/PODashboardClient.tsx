"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPOList, getPOEmployeeStats, type POOption, type POEmployeeStats } from "@/app/dashboard/actions";
import { Users, UserPlus, UserMinus, AlertTriangle, CheckCircle } from "lucide-react";
import MonthlyChart from "./MonthlyChart";
import RecentEmployees from "./RecentEmployees";

interface UserProfile {
  role: string;
  status: string;
  company_id: number;
}

interface PODashboardClientProps {
  userProfile: UserProfile;
  isAdmin: boolean;
}

export default function PODashboardClient({ userProfile, isAdmin }: PODashboardClientProps) {
  const [poList, setPOList] = useState<POOption[]>([]);
  const [selectedPO, setSelectedPO] = useState<string>("");
  const [stats, setStats] = useState<POEmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchPOList = async () => {
      try {
        console.log("PODashboardClient: userProfile", userProfile);
        console.log("PODashboardClient: isAdmin", isAdmin);
        
        // ให้ user ทั่วไปก็เห็น PO ทั้งหมดได้ (ไม่จำกัดเฉพาะ company)
        const companyId = undefined; // แสดง PO ทั้งหมด
        console.log("PODashboardClient: companyId", companyId);
        console.log("PODashboardClient: Showing all POs for all users");
        
        const data = await getPOList(companyId);
        console.log("PODashboardClient: PO list received", data);
        
        setPOList(data);
        
        // เลือก PO แรกโดยอัตโนมัติ
        if (data.length > 0) {
          setSelectedPO(data[0].po_id.toString());
        }
      } catch (error) {
        console.error("Error fetching PO list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPOList();
  }, [userProfile, isAdmin]);

  useEffect(() => {
    const fetchPOStats = async () => {
      if (!selectedPO) return;
      
      setStatsLoading(true);
      try {
        const data = await getPOEmployeeStats(parseInt(selectedPO));
        setStats(data);
      } catch (error) {
        console.error("Error fetching PO stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPOStats();
  }, [selectedPO]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (poList.length === 0) {
    return (
      <div className="text-center py-8">
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูล PO</CardTitle>
            <CardDescription>กรุณาตรวจสอบฐานข้อมูลหรือสิทธิ์การเข้าถึง</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Debug Info:
              <br />- User Profile: {JSON.stringify(userProfile)}
              <br />- Is Admin: {isAdmin.toString()}
              <br />- PO List Length: {poList.length}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PO Selection */}
      <Card>
        <CardHeader>
          <CardTitle>เลือก Purchase Order</CardTitle>
          <CardDescription>เลือก PO เพื่อดูสถิติพนักงาน</CardDescription>
        </CardHeader>
        <CardContent>
          <select 
            value={selectedPO} 
            onChange={(e) => setSelectedPO(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">เลือก PO</option>
            {poList.map((po) => (
              <option key={po.po_id} value={po.po_id.toString()}>
                {po.po_number} - {po.company_name} - {po.job_position_name} ({po.employee_count} คน)
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* PO Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูล PO: {stats.poInfo.po_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">บริษัท:</span> {stats.poInfo.company_name}
                </div>
                <div>
                  <span className="font-medium">ตำแหน่ง:</span> {stats.poInfo.job_position_name}
                </div>
                <div>
                  <span className="font-medium">กลุ่มงาน:</span> {stats.poInfo.function_code}
                </div>
                <div>
                  <span className="font-medium">ระยะเวลา:</span> {new Date(stats.poInfo.start_date).toLocaleDateString('th-TH')} - {new Date(stats.poInfo.end_date).toLocaleDateString('th-TH')}
                </div>
                <div>
                  <span className="font-medium">จำนวนพนักงาน:</span> {stats.poInfo.employee_count} คน
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">พนักงานปัจจุบัน</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  จาก {stats.poInfo.employee_count} คนที่ต้องการ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">เข้าเดือนนี้</CardTitle>
                <UserPlus className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.employeesInThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  พนักงานเข้าใหม่
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ออกเดือนนี้</CardTitle>
                <UserMinus className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.employeesOutThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  พนักงานออก
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ขาดพนักงาน</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.shortage > 0 ? "text-orange-600" : "text-gray-400"}`}>
                  {stats.shortage}
                </div>
                <p className="text-xs text-muted-foreground">
                  คนที่ขาดไป
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">เหลือพนักงาน</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.surplus > 0 ? "text-blue-600" : "text-gray-400"}`}>
                  {stats.surplus}
                </div>
                <p className="text-xs text-muted-foreground">
                  คนที่เหลือ
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Chart */}
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มพนักงานเข้า/ออก ใน PO นี้</CardTitle>
              <CardDescription>
                สถิติรายเดือนย้อนหลัง 12 เดือน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyChart data={stats.monthlyData.map(item => ({
                month: item.month,
                newPOs: item.employeesIn,
                expiredPOs: item.employeesOut
              }))} />
            </CardContent>
          </Card>

          {/* Recent Employees Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>พนักงานเข้าล่าสุด</CardTitle>
                <CardDescription>5 คนล่าสุด</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentEmployees 
                  employees={stats.recentEmployeesIn.map(emp => ({
                    employee_id: emp.employee_id,
                    first_name_th: emp.first_name_th,
                    last_name_th: emp.last_name_th,
                    job_position_name: stats.poInfo.job_position_name,
                    start_date: emp.start_date,
                    company_name: stats.poInfo.company_name
                  }))} 
                  type="new"
                  showCompany={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>พนักงานออกล่าสุด</CardTitle>
                <CardDescription>5 คนล่าสุด</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentEmployees 
                  employees={stats.recentEmployeesOut.map(emp => ({
                    employee_id: emp.employee_id,
                    first_name_th: emp.first_name_th,
                    last_name_th: emp.last_name_th,
                    job_position_name: stats.poInfo.job_position_name,
                    end_date: emp.end_date,
                    company_name: stats.poInfo.company_name
                  }))} 
                  type="resignation"
                  showCompany={false}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          ไม่สามารถโหลดข้อมูลได้
        </div>
      )}
    </div>
  );
}
