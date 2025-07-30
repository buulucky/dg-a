"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, type DashboardStats } from "@/app/dashboard/actions";
import { FileText, FilePlus, FileX, TrendingUp } from "lucide-react";
import MonthlyChart from "./MonthlyChart";
import RecentEmployees from "./RecentEmployees";

interface DashboardClientProps {
  userProfile: {
    id: string;
    role: string;
    company_id: number;
    status: string;
  };
  isAdmin: boolean;
}

export default function DashboardClient({ userProfile, isAdmin }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const companyId = isAdmin ? undefined : userProfile?.company_id;
        const data = await getDashboardStats(companyId);
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userProfile, isAdmin]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
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
    );
  }

  if (!stats) {
    return <div>ไม่สามารถโหลดข้อมูลได้</div>;
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PO ทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPOs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              จำนวน PO {isAdmin ? "ทั้งระบบ" : "ในบริษัท"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PO ใหม่เดือนนี้</CardTitle>
            <FilePlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.newPOsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              อัตรา PO ใหม่: {formatPercentage(stats.activePOsRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PO หมดอายุเดือนนี้</CardTitle>
            <FileX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredPOsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              อัตราหมดอายุ: {formatPercentage(stats.expirationRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ดุล PO</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats.newPOsThisMonth - stats.expiredPOsThisMonth >= 0 
                ? "text-green-600" 
                : "text-red-600"
            }`}>
              {stats.newPOsThisMonth - stats.expiredPOsThisMonth > 0 ? "+" : ""}
              {stats.newPOsThisMonth - stats.expiredPOsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              PO ใหม่ - หมดอายุ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>แนวโน้ม PO ใหม่/หมดอายุ</CardTitle>
          <CardDescription>
            สถิติรายเดือนย้อนหลัง 12 เดือน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyChart data={stats.monthlyData} />
        </CardContent>
      </Card>

      {/* Recent POs Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>PO ใหม่ล่าสุด</CardTitle>
            <CardDescription>5 รายการล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEmployees 
              employees={stats.recentNewPOs} 
              type="new"
              showCompany={isAdmin}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PO หมดอายุล่าสุด</CardTitle>
            <CardDescription>5 รายการล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEmployees 
              employees={stats.recentExpiredPOs} 
              type="resignation"
              showCompany={isAdmin}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
