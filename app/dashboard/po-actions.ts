'use server';

import { createClient } from "@/lib/supabase/server";

export interface POOption {
  po_id: number;
  po_number: string;
  company_name: string;
  function_code: string;
  job_position_name: string;
  employee_count: number;
  start_date: string;
  end_date: string;
}

export interface POEmployeeStats {
  poInfo: POOption;
  currentEmployees: number;
  employeesInThisMonth: number;
  employeesOutThisMonth: number;
  shortage: number; // ขาดไป
  surplus: number;  // เหลือ
  monthlyData: Array<{
    month: string;
    employeesIn: number;
    employeesOut: number;
  }>;
  recentEmployeesIn: Array<{
    employee_id: string;
    first_name_th: string;
    last_name_th: string;
    start_date: string;
  }>;
  recentEmployeesOut: Array<{
    employee_id: string;
    first_name_th: string;
    last_name_th: string;
    end_date: string;
  }>;
}

export async function getPOList(companyId?: number): Promise<POOption[]> {
  const supabase = await createClient();

  try {
    // ตั้งค่า session variables สำหรับ RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // ดึงข้อมูล user profile เพื่อเช็ค role และ company_id
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        await supabase.rpc('set_claim', { key: 'role', value: userProfile.role });
        await supabase.rpc('set_claim', { key: 'company_id', value: userProfile.company_id.toString() });
      }
    }

    console.log("Fetching PO list for company:", companyId);
    
    let query = supabase
      .from('view_po_relationship')
      .select('po_id, po_number, company_name, function_code, job_position_name, employee_count, start_date, end_date')
      .order('created_at', { ascending: false });

    // ถ้าไม่ใช่ admin จะเห็นเฉพาะ PO ของบริษัทตัวเอง
    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching PO list:", error);
      return [];
    }

    console.log("PO list data:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching PO list:", error);
    return [];
  }
}

export async function getPOEmployeeStats(poId: number): Promise<POEmployeeStats | null> {
  const supabase = await createClient();

  try {
    // ตั้งค่า session variables สำหรับ RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // ดึงข้อมูล user profile เพื่อเช็ค role และ company_id
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        await supabase.rpc('set_claim', { key: 'role', value: userProfile.role });
        await supabase.rpc('set_claim', { key: 'company_id', value: userProfile.company_id.toString() });
      }
    }

    console.log("getPOEmployeeStats: Starting for PO ID", poId);
    
    // ดึงข้อมูล PO
    const { data: poData, error: poError } = await supabase
      .from('view_po_relationship')
      .select('po_id, po_number, company_name, function_code, job_position_name, employee_count, start_date, end_date')
      .eq('po_id', poId)
      .single();

    console.log("getPOEmployeeStats: PO data", poData);
    console.log("getPOEmployeeStats: PO error", poError);

    if (poError || !poData) {
      console.error("Error fetching PO info:", poError);
      return null;
    }

    // พนักงานปัจจุบันใน PO นี้ (ACTIVE)
    const { count: currentEmployees } = await supabase
      .from('view_employee_contracts_relationship')
      .select('*', { count: 'exact' })
      .eq('po_id', poId)
      .eq('status_code', 'ACTIVE');

    console.log("getPOEmployeeStats: Current employees count", currentEmployees);

    // พนักงานเข้าเดือนนี้
    const currentMonth = new Date().toISOString().slice(0, 7);
    const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10);

    console.log("getPOEmployeeStats: Checking for month", currentMonth, "to", nextMonth);

    const { count: employeesInThisMonth } = await supabase
      .from('view_employee_contracts_relationship')
      .select('*', { count: 'exact' })
      .eq('po_id', poId)
      .eq('status_code', 'ACTIVE')
      .gte('start_date', `${currentMonth}-01`)
      .lt('start_date', nextMonth);

    console.log("getPOEmployeeStats: Employees in this month", employeesInThisMonth);

    // พนักงานออกเดือนนี้ (ดึงจากตาราง employee_contracts ที่มี end_date)
    const { count: employeesOutThisMonth } = await supabase
      .from('employee_contracts')
      .select('*', { count: 'exact' })
      .eq('po_id', poId)
      .not('end_date', 'is', null)
      .gte('end_date', `${currentMonth}-01`)
      .lt('end_date', nextMonth);

    // คำนวณขาดเหลือ
    const targetEmployees = poData.employee_count;
    const actualEmployees = currentEmployees || 0;
    const shortage = Math.max(0, targetEmployees - actualEmployees);
    const surplus = Math.max(0, actualEmployees - targetEmployees);

    // ข้อมูลรายเดือน (12 เดือนย้อนหลัง)
    const monthlyData: Array<{ month: string; employeesIn: number; employeesOut: number }> = [];
    const processedMonths = new Set<string>(); // ป้องกัน duplicate months
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      
      // ข้ามถ้าเดือนนี้ประมวลผลแล้ว
      if (processedMonths.has(monthStr)) {
        continue;
      }
      processedMonths.add(monthStr);
      
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 10);

      const { count: monthEmployeesIn } = await supabase
        .from('view_employee_contracts_relationship')
        .select('*', { count: 'exact' })
        .eq('po_id', poId)
        .eq('status_code', 'ACTIVE')
        .gte('start_date', `${monthStr}-01`)
        .lt('start_date', monthEnd);

      const { count: monthEmployeesOut } = await supabase
        .from('employee_contracts')
        .select('*', { count: 'exact' })
        .eq('po_id', poId)
        .not('end_date', 'is', null)
        .gte('end_date', `${monthStr}-01`)
        .lt('end_date', monthEnd);

      monthlyData.push({
        month: monthStr,
        employeesIn: monthEmployeesIn || 0,
        employeesOut: monthEmployeesOut || 0
      });
    }

    // รายชื่อพนักงานเข้าล่าสุด
    const { data: recentEmployeesIn } = await supabase
      .from('view_employee_contracts_relationship')
      .select('employee_id, first_name_th, last_name_th, start_date')
      .eq('po_id', poId)
      .eq('status_code', 'ACTIVE')
      .order('start_date', { ascending: false })
      .limit(5);

    // รายชื่อพนักงานออกล่าสุด (ดึงจากตาราง employee_contracts ที่มี end_date)
    const { data: recentEmployeesOutData } = await supabase
      .from('employee_contracts')
      .select(`
        employee_id,
        end_date,
        employees!inner(first_name_th, last_name_th)
      `)
      .eq('po_id', poId)
      .not('end_date', 'is', null)
      .order('end_date', { ascending: false })
      .limit(5);

    // แปลงรูปแบบข้อมูลให้ตรงกับ interface
    const recentEmployeesOut = recentEmployeesOutData?.map(item => ({
      employee_id: item.employee_id.toString(),
      first_name_th: (item.employees as unknown as { first_name_th: string })?.first_name_th || '',
      last_name_th: (item.employees as unknown as { last_name_th: string })?.last_name_th || '',
      end_date: item.end_date
    })) || [];

    return {
      poInfo: poData,
      currentEmployees: actualEmployees,
      employeesInThisMonth: employeesInThisMonth || 0,
      employeesOutThisMonth: employeesOutThisMonth || 0,
      shortage,
      surplus,
      monthlyData,
      recentEmployeesIn: recentEmployeesIn || [],
      recentEmployeesOut: recentEmployeesOut || []
    };

  } catch (error) {
    console.error("Error fetching PO employee stats:", error);
    return null;
  }
}
