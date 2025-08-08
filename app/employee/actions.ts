'use server';

import { createClient } from "@/lib/supabase/server";

export interface Employee {
  employee_id: string;
  employee_code: string;
  personal_id: string;
  prefix_th: string;
  first_name_th: string;
  last_name_th: string;
  prefix_en: string;
  first_name_en: string;
  last_name_en: string;
  birth_date: string | null;
  age?: number | null;
  start_date: string | null;
  work_years?: {
    years?: number;
    months?: number;
    days?: number;
  } | null;
  po_number: string | null;
  job_position_name: string | null;
  company_name: string | null;
  status_code?: string | null;
  course_progress_summary?: string | null;
}

export async function getEmployees(
  page: number = 1,
  limit: number = 15,
  search: string = "",
  poFilter: string = ""
): Promise<{ 
  data: Employee[] | null; 
  error: string | null; 
  total: number;
  totalPages: number;
}> {
  try {
    const supabase = await createClient();
    
    // ตรวจสอบ user ที่ล็อกอิน
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return { data: null, error: "ไม่พบผู้ใช้ที่ล็อกอิน", total: 0, totalPages: 0 };
    }

    // ดึงข้อมูล user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role, status, company_id")
      .eq("id", authUser.id)
      .single();

    if (profileError || !userProfile) {
      return { data: null, error: "ไม่พบข้อมูล user profile", total: 0, totalPages: 0 };
    }

    // สร้าง query สำหรับนับจำนวนทั้งหมด
    let countQuery = supabase
      .from('view_employee_contracts_relationship')
      .select('*', { count: 'exact', head: true })
      .eq('status_code', 'ACTIVE'); // << เพิ่มตรงนี้

    // สร้าง query สำหรับดึงข้อมูล
    let dataQuery = supabase
      .from('view_employee_contracts_relationship')
      .select('*')
      .eq('status_code', 'ACTIVE'); // << เพิ่มตรงนี้

    // ถ้าไม่ใช่ admin ให้ filter ตาม company_id
    if (userProfile.role !== 'admin') {
      countQuery = countQuery.eq('company_id', userProfile.company_id);
      dataQuery = dataQuery.eq('company_id', userProfile.company_id);
    }

    // เพิ่มการค้นหาตาม PO
    if (poFilter.trim()) {
      countQuery = countQuery.eq('po_id', poFilter);
      dataQuery = dataQuery.eq('po_id', poFilter);
    }

    // เพิ่มการค้นหา
    if (search.trim()) {
      const searchCondition = `personal_id.ilike.%${search}%,first_name_th.ilike.%${search}%,last_name_th.ilike.%${search}%,first_name_en.ilike.%${search}%,last_name_en.ilike.%${search}%,employee_code.ilike.%${search}%,job_position_name.ilike.%${search}%`;
      countQuery = countQuery.or(searchCondition);
      dataQuery = dataQuery.or(searchCondition);
    }

    // ดึงจำนวนทั้งหมดก่อน
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error("Error counting employees:", countError);
      return { data: null, error: countError.message || "เกิดข้อผิดพลาดในการนับข้อมูล", total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // คำนวณ offset สำหรับ pagination
    const offset = (page - 1) * limit;

    // ดึงข้อมูลพร้อม pagination
    const { data, error } = await dataQuery
      .order('employee_id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error loading employees:", error);
      return { data: null, error: error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล", total: 0, totalPages: 0 };
    }

    return { data: data || [], error: null, total, totalPages };
    
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "เกิดข้อผิดพลาดในการดึงข้อมูล", total: 0, totalPages: 0 };
  }
}

export async function getUserRole(): Promise<{ role: string | null; isAdmin: boolean }> {
  try {
    const supabase = await createClient();
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return { role: null, isAdmin: false };
    }

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    const role = userProfile?.role || null;
    return { role, isAdmin: role === 'admin' };
    
  } catch (error) {
    console.error("Error getting user role:", error);
    return { role: null, isAdmin: false };
  }
}

export async function updateEmployee({
  employeeId,
  prefix_th,
  first_name_th,
  last_name_th,
  prefix_en,
  first_name_en,
  last_name_en,
  birth_date,
}: {
  employeeId: string;
  prefix_th: string;
  first_name_th: string;
  last_name_th: string;
  prefix_en: string;
  first_name_en: string;
  last_name_en: string;
  birth_date: string;
}): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    // ตรวจสอบ user ที่ล็อกอิน
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return { error: "ไม่พบผู้ใช้ที่ล็อกอิน" };
    }

    // อัปเดตข้อมูลพนักงาน
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        prefix_th,
        first_name_th,
        last_name_th,
        prefix_en,
        first_name_en,
        last_name_en,
        birth_date,
      })
      .eq("employee_id", employeeId);

    if (updateError) {
      console.error("Error updating employee:", updateError);
      return { error: updateError.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
    }

    return { error: null };
    
  } catch (error) {
    console.error("Server action error:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
  }
}
