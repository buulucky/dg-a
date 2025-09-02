"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface PO {
  po_id: number;
  po_number: string;
  company_id: number;
  company_name: string;
  function_id: number;
  function_code: string;
  job_position_id: number;
  job_position_name: string;
  employee_count: number;
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

export async function getPOs(page = 1, limit = 15, searchQuery = "", companyFilter = "") {
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

  // เพิ่มการกรองตามบริษัท (ถ้ามีการเลือกบริษัทเฉพาะ)
  if (companyFilter.trim()) {
    query = query.eq("company_id", parseInt(companyFilter));
  }

  // เพิ่มการค้นหาทั่วไป
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

  // Use the existing PO interface for type safety
  const formattedData: PO[] = (data || []).map((po) => ({
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

// ฟังก์ชันดึงข้อมูล Functions
export async function getFunctions() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("functions")
    .select("function_id, function_code")
    .order("function_code", { ascending: true });

  if (error) {
    console.error("Error fetching functions:", error);
    return { data: [], error: error.message };
  }

  const formattedData = data?.map((item) => ({
    function_id: item.function_id.toString(),
    function_code: item.function_code,
  })) || [];

  return { data: formattedData, error: null };
}

// ฟังก์ชันดึงข้อมูล Job Positions ทั้งหมด
export async function getJobPositions() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("job_positions")
    .select("job_position_id, job_position_name")
    .order("job_position_name", { ascending: true });

  if (error) {
    console.error("Error fetching job positions:", error);
    return { data: [], error: error.message };
  }

  const formattedData = data?.map((item) => ({
    job_position_id: item.job_position_id.toString(),
    job_position_name: item.job_position_name,
  })) || [];

  return { data: formattedData, error: null };
}

// ฟังก์ชันดึงข้อมูล Companies ทั้งหมด
export async function getCompanies() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("companies")
    .select("company_id, company_name")
    .order("company_name", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    return { data: [], error: error.message };
  }

  const formattedData = data?.map((item) => ({
    company_id: item.company_id.toString(),
    company_name: item.company_name,
  })) || [];

  return { data: formattedData, error: null };
}

// ฟังก์ชันดึงรายการบริษัททั้งหมดสำหรับการกรอง
export async function getCompaniesForFilter() {
  const supabase = await createClient();
  
  // ตรวจสอบสิทธิ์ผู้ใช้
  const { isAdmin, user } = await getUserRole();
  
  if (!isAdmin && !user) {
    return { data: [], error: "ไม่มีสิทธิ์เข้าถึงข้อมูล" };
  }

  let query = supabase
    .from("companies")
    .select("company_id, company_name")
    .order("company_name", { ascending: true });

  // ถ้าไม่ใช่ Admin ให้ดูเฉพาะบริษัทของตัวเอง
  if (!isAdmin) {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (userProfile?.company_id) {
      query = query.eq("company_id", userProfile.company_id);
    } else {
      return { data: [], error: null };
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching companies for filter:", error);
    return { data: [], error: error.message };
  }

  const formattedData = data?.map((item) => ({
    company_id: item.company_id.toString(),
    company_name: item.company_name,
  })) || [];

  return { data: formattedData, error: null };
}

// ฟังก์ชันเพิ่ม PO ใหม่
export async function addPO(poData: {
  po_number: string;
  function_id: string;
  job_position_id: string;
  company_id: string;
  start_date: string;
  end_date: string;
  employee_count: string;
  po_type: string;
}) {
  const supabase = await createClient();
  
  // ตรวจสอบสิทธิ์ admin
  const { isAdmin } = await getUserRole();
  
  if (!isAdmin) {
    return { success: false, error: "ไม่มีสิทธิ์ในการเพิ่ม PO - เฉพาะผู้ดูแลระบบเท่านั้น" };
  }

  // ตรวจสอบข้อมูลครบถ้วน
  if (!poData.po_number || !poData.function_id || !poData.job_position_id || 
      !poData.company_id || !poData.start_date || !poData.end_date || 
      !poData.employee_count || !poData.po_type) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" };
  }

  // ตรวจสอบวันที่
  if (new Date(poData.end_date) <= new Date(poData.start_date)) {
    return { success: false, error: "วันสิ้นสุดสัญญาต้องมากกว่าวันเริ่มสัญญา" };
  }

  try {
    // ตรวจสอบว่าเลข PO ซ้ำหรือไม่
    const { data: existingPO, error: checkError } = await supabase
      .from("po")
      .select("po_number")
      .eq("po_number", poData.po_number)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116: No rows found
      return { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบเลข PO: " + checkError.message };
    }

    if (existingPO) {
      return { success: false, error: "เลข PO นี้มีอยู่ในระบบแล้ว" };
    }

    // เพิ่ม PO ใหม่
    const { data, error } = await supabase
      .from("po")
      .insert({
        po_number: poData.po_number,
        function_id: parseInt(poData.function_id),
        job_position_id: parseInt(poData.job_position_id),
        company_id: parseInt(poData.company_id),
        start_date: poData.start_date,
        end_date: poData.end_date,
        employee_count: parseInt(poData.employee_count),
        po_type: poData.po_type,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: "เกิดข้อผิดพลาดในการเพิ่ม PO: " + error.message };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error("Unexpected error adding PO:", error);
    return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด" };
  }
}

export async function updatePO(poId: number, updateData: {
  employee_count: number;
  po_type: string;
  start_date: string;
  end_date: string;
}) {
  const supabase = await createClient();
  
  // ตรวจสอบสิทธิ์ผู้ใช้
  const { isAdmin, user } = await getUserRole();
  
  if (!isAdmin && !user) {
    return { success: false, error: "ไม่มีสิทธิ์แก้ไขข้อมูล" };
  }

  try {

    
    // อัพเดตข้อมูล PO (ไม่รวม po_number)
    const { data, error } = await supabase
      .from("po")
      .update({
        employee_count: updateData.employee_count,
        po_type: updateData.po_type,
        start_date: updateData.start_date,
        end_date: updateData.end_date,
        updated_at: new Date().toISOString()
      })
      .eq("po_id", poId)
      .select()
      .single();

    if (error) {
      console.error("Error updating PO:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating PO:", error);
    return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด" };
  }
}
