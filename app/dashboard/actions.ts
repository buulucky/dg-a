'use server';

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalPOs: number;
  newPOsThisMonth: number;
  expiredPOsThisMonth: number;
  activePOsRate: number;
  expirationRate: number;
  monthlyData: Array<{
    month: string;
    newPOs: number;
    expiredPOs: number;
  }>;
  recentNewPOs: Array<{
    po_id: number;
    po_number: string;
    company_name: string;
    function_code: string;
    job_position_name: string;
    start_date: string;
    employee_count: number;
  }>;
  recentExpiredPOs: Array<{
    po_id: number;
    po_number: string;
    company_name: string;
    function_code: string;
    job_position_name: string;
    end_date: string;
    employee_count: number;
  }>;
}

export async function getDashboardStats(companyId?: number): Promise<DashboardStats> {
  const supabase = await createClient();

  try {
    // PO ทั้งหมดที่ยัง Active (ยังไม่หมดอายุ)
    let totalPOsQuery = supabase
      .from('view_po_relationship')
      .select('*', { count: 'exact' })
      .gte('end_date', new Date().toISOString().slice(0, 10)); // PO ที่ยังไม่หมดอายุ
    
    if (companyId) {
      totalPOsQuery = totalPOsQuery.eq('company_id', companyId);
    }
    
    const { count: totalPOs } = await totalPOsQuery;

    // PO ใหม่เดือนนี้
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10);
    
    let newPOsQuery = supabase
      .from('view_po_relationship')
      .select('*', { count: 'exact' })
      .gte('start_date', `${currentMonth}-01`)
      .lt('start_date', nextMonth);
    
    if (companyId) {
      newPOsQuery = newPOsQuery.eq('company_id', companyId);
    }
    
    const { count: newPOsThisMonth } = await newPOsQuery;

    // PO ที่หมดอายุเดือนนี้
    let expiredPOsQuery = supabase
      .from('view_po_relationship')
      .select('*', { count: 'exact' })
      .gte('end_date', `${currentMonth}-01`)
      .lt('end_date', nextMonth);
    
    if (companyId) {
      expiredPOsQuery = expiredPOsQuery.eq('company_id', companyId);
    }
    
    const { count: expiredPOsThisMonth } = await expiredPOsQuery;

    // ข้อมูลรายเดือน (12 เดือนย้อนหลัง)
    const monthlyData: Array<{ month: string; newPOs: number; expiredPOs: number }> = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 10);
      
      // PO ใหม่ในเดือนนี้
      let monthNewPOsQuery = supabase
        .from('view_po_relationship')
        .select('*', { count: 'exact' })
        .gte('start_date', `${monthStr}-01`)
        .lt('start_date', monthEnd);
      
      if (companyId) {
        monthNewPOsQuery = monthNewPOsQuery.eq('company_id', companyId);
      }
      
      const { count: monthNewPOs } = await monthNewPOsQuery;

      // PO ที่หมดอายุในเดือนนี้
      let monthExpiredPOsQuery = supabase
        .from('view_po_relationship')
        .select('*', { count: 'exact' })
        .gte('end_date', `${monthStr}-01`)
        .lt('end_date', monthEnd);
      
      if (companyId) {
        monthExpiredPOsQuery = monthExpiredPOsQuery.eq('company_id', companyId);
      }
      
      const { count: monthExpiredPOs } = await monthExpiredPOsQuery;

      monthlyData.push({
        month: monthStr,
        newPOs: monthNewPOs || 0,
        expiredPOs: monthExpiredPOs || 0
      });
    }

    // รายชื่อ PO ใหม่ล่าสุด (5 รายการล่าสุด)
    let recentNewPOsQuery = supabase
      .from('view_po_relationship')
      .select('po_id, po_number, company_name, function_code, job_position_name, start_date, employee_count')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (companyId) {
      recentNewPOsQuery = recentNewPOsQuery.eq('company_id', companyId);
    }
    
    const { data: recentNewPOs } = await recentNewPOsQuery;

    // รายชื่อ PO ที่หมดอายุล่าสุด (5 รายการล่าสุด)
    let recentExpiredPOsQuery = supabase
      .from('view_po_relationship')
      .select('po_id, po_number, company_name, function_code, job_position_name, end_date, employee_count')
      .lt('end_date', new Date().toISOString().slice(0, 10))
      .order('end_date', { ascending: false })
      .limit(5);
    
    if (companyId) {
      recentExpiredPOsQuery = recentExpiredPOsQuery.eq('company_id', companyId);
    }
    
    const { data: recentExpiredPOs } = await recentExpiredPOsQuery;

    return {
      totalPOs: totalPOs || 0,
      newPOsThisMonth: newPOsThisMonth || 0,
      expiredPOsThisMonth: expiredPOsThisMonth || 0,
      activePOsRate: totalPOs && totalPOs > 0 ? ((totalPOs - (expiredPOsThisMonth || 0)) / totalPOs) * 100 : 0,
      expirationRate: totalPOs && totalPOs > 0 ? ((expiredPOsThisMonth || 0) / totalPOs) * 100 : 0,
      monthlyData,
      recentNewPOs: recentNewPOs || [],
      recentExpiredPOs: recentExpiredPOs || []
    };

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalPOs: 0,
      newPOsThisMonth: 0,
      expiredPOsThisMonth: 0,
      activePOsRate: 0,
      expirationRate: 0,
      monthlyData: [],
      recentNewPOs: [],
      recentExpiredPOs: []
    };
  }
}
