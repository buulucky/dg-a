"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface PO {
  po_id: number;
  po_number: string;
  company_id: number;
  company_name: string;
  function_id: number;
  function_code: string; // เปลี่ยนจาก function_name เป็น function_code
  job_position_id: number;
  job_position_name: string;
  employee_count: number; // เพิ่ม employee_count จาก view
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  po_type: string;
}

export async function getUserRole() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const isAdmin = userProfile?.role === "admin" && userProfile?.status === "approved";
  
  return { isAdmin, user };
}

export async function getPOs(page = 1, limit = 15, searchQuery = "") {
  const supabase = await createClient();
  
  // ตรวจสอบสิทธิ์ผู้ใช้
  const { isAdmin, user } = await getUserRole();
  
  if (!isAdmin && !user) {
    return { data: [], total: 0, totalPages: 0, error: "ไม่มีสิทธิ์เข้าถึงข้อมูล" };
  }

  const offset = (page - 1) * limit;

  // Query จาก view_po_relationship
  let query = supabase
    .from("view_po_relationship")
    .select("*", { count: 'exact' });

  // ถ้าไม่ใช่ Admin ให้ดูเฉพาะ PO ของบริษัทตัวเอง
  if (!isAdmin) {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (userProfile?.company_id) {
      query = query.eq("company_id", userProfile.company_id);
    } else {
      // ถ้าไม่มี company_id ให้ return ข้อมูลว่าง
      return { data: [], total: 0, totalPages: 0 };
    }
  }

  // เพิ่มการค้นหา
  if (searchQuery.trim()) {
    query = query.or(`po_number.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,function_code.ilike.%${searchQuery}%,job_position_name.ilike.%${searchQuery}%`);
  }

  // เรียงลำดับและ pagination
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching POs:", error);
    return { data: [], total: 0, totalPages: 0, error: error.message };
  }

  // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้งานง่าย
  const formattedData: PO[] = (data || []).map((po: any) => ({
    po_id: po.po_id,
    po_number: po.po_number || "",
    company_id: po.company_id,
    company_name: po.company_name || "",
    function_id: po.function_id,
    function_code: po.function_code || "",
    job_position_id: po.job_position_id,
    job_position_name: po.job_position_name || "",
    employee_count: po.employee_count || 0,
    start_date: po.start_date,
    end_date: po.end_date,
    created_at: po.created_at,
    updated_at: po.updated_at,
    po_type: po.po_type || ""
  }));

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { data: formattedData, total, totalPages };
}
