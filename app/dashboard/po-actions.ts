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
  shortage: number;
  surplus: number;
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

    // กำหนดช่วงเวลาสำหรับการ query
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10);
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString().slice(0, 10);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

    console.log("getPOEmployeeStats: Checking for month", currentMonth, "to", currentMonthEnd);

    // Query ข้อมูลหลักแบบ parallel
    const [
      { count: currentEmployees },
      { count: employeesInThisMonth },
      { count: employeesOutThisMonth },
      { data: monthlyInData },
      { data: monthlyOutData }
    ] = await Promise.all([
      // พนักงานปัจจุบันใน PO นี้ (ACTIVE)
      supabase
        .from('view_employee_contracts_relationship')
        .select('*', { count: 'exact' })
        .eq('po_id', poId)
        .eq('status_code', 'ACTIVE'),
      
      // พนักงานเข้าเดือนนี้
      supabase
        .from('view_employee_contracts_relationship')
        .select('*', { count: 'exact' })
        .eq('po_id', poId)
        .gte('start_date', `${currentMonth}-01`)
        .lt('start_date', currentMonthEnd),
      
      // พนักงานออกเดือนนี้
      supabase
        .from('employee_contracts')
        .select('*', { count: 'exact' })
        .eq('po_id', poId)
        .not('end_date', 'is', null)
        .gte('end_date', `${currentMonth}-01`)
        .lt('end_date', currentMonthEnd),
      
      // ข้อมูลพนักงานเข้าทั้ง 12 เดือน
      supabase
        .from('view_employee_contracts_relationship')
        .select('start_date')
        .eq('po_id', poId)
        .gte('start_date', twelveMonthsAgo)
        .lt('start_date', nextMonth),
      
      // ข้อมูลพนักงานออกทั้ง 12 เดือน
      supabase
        .from('employee_contracts')
        .select('end_date')
        .eq('po_id', poId)
        .not('end_date', 'is', null)
        .gte('end_date', twelveMonthsAgo)
        .lt('end_date', nextMonth)
    ]);

    console.log("getPOEmployeeStats: Current employees count", currentEmployees);
    console.log("getPOEmployeeStats: Employees in this month", employeesInThisMonth);
    console.log("getPOEmployeeStats: Employees out this month", employeesOutThisMonth);

    // คำนวณขาดเหลือ
    const targetEmployees = poData.employee_count;
    const actualEmployees = currentEmployees || 0;
    const shortage = Math.max(0, targetEmployees - actualEmployees);
    const surplus = Math.max(0, actualEmployees - targetEmployees);

    // สร้างข้อมูลรายเดือนโดยการจัดกลุ่มข้อมูลที่ได้
    const monthlyData: Array<{ month: string; employeesIn: number; employeesOut: number }> = [];
    const yearNow = now.getFullYear();
    const monthNow = now.getMonth(); // 0-based
    
    for (let offset = 11; offset >= 0; offset--) {
      let m = monthNow - offset;
      let y = yearNow;
      while (m < 0) {
        m += 12;
        y -= 1;
      }
      const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
      
      // นับจากข้อมูลที่ query มาแล้ว
      const monthEmployeesIn = (monthlyInData || []).filter(emp => 
        emp.start_date?.startsWith(monthStr)
      ).length;
      
      const monthEmployeesOut = (monthlyOutData || []).filter(emp => 
        emp.end_date?.startsWith(monthStr)
      ).length;

      monthlyData.push({
        month: monthStr,
        employeesIn: monthEmployeesIn,
        employeesOut: monthEmployeesOut
      });
    }

    // Query ข้อมูลแบบ parallel เพื่อลดเวลาโหลด
    const [
      { data: recentEmployeesIn },
      { data: recentEmployeesOutData }
    ] = await Promise.all([
      // รายชื่อพนักงานเข้าล่าสุด
      supabase
        .from('view_employee_contracts_relationship')
        .select('employee_id, first_name_th, last_name_th, start_date')
        .eq('po_id', poId)
        .order('start_date', { ascending: false })
        .limit(5),
      
      // รายชื่อพนักงานออกล่าสุด
      supabase
        .from('employee_contracts')
        .select(`
          employee_id,
          end_date,
          employees!inner(first_name_th, last_name_th)
        `)
        .eq('po_id', poId)
        .not('end_date', 'is', null)
        .order('end_date', { ascending: false })
        .limit(5)
    ]);

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
