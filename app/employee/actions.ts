'use server';

import { createClient } from "@/lib/supabase/server";

export interface Employee {
  employee_id: string;
  personal_id: string;
  prefix_th: string;
  first_name_th: string;
  last_name_th: string;
  prefix_en: string;
  first_name_en: string;
  last_name_en: string;
  employee_code: string;
  company_id: number;
  start_date: string;
  po_number: string;
  job_position_name: string;
}

export async function getEmployees(): Promise<{ data: Employee[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    
    // ตรวจสอบ user ที่ล็อกอิน
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return { data: null, error: "ไม่พบผู้ใช้ที่ล็อกอิน" };
    }

    // ดึงข้อมูล user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role, status, company_id")
      .eq("id", authUser.id)
      .single();

    if (profileError || !userProfile) {
      return { data: null, error: "ไม่พบข้อมูล user profile" };
    }

    // Query ข้อมูลพนักงาน
    let query = supabase
      .from('v_employee_profiles_with_contracts')
      .select('*');

    // ถ้าไม่ใช่ admin ให้ filter ตาม company_id
    if (userProfile.role !== 'admin') {
      query = query.eq('company_id', userProfile.company_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading employees:", error);
      return { data: null, error: error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล" };
    }

    return { data: data || [], error: null };
    
  } catch (error) {
    console.error("Server action error:", error);
    return { data: null, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" };
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
