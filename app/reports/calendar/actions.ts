'use server';

import { createClient } from "@/lib/supabase/server";

export interface CourseExpiryData {
  course_expiry_date: string;
  employee_count: number;
}

export interface CourseOption {
  course_id: number;
  course_name: string;
  validity_period_days: number;
}

export async function getCourseList(): Promise<CourseOption[]> {
  const supabase = await createClient();

  try {
    // ตั้งค่า session variables สำหรับ RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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

    const { data, error } = await supabase
      .from('training_courses')
      .select('course_id, course_name, validity_period_days')
      .order('course_name');

    console.log("Course list query result:", { data, error });

    if (error) {
      console.error("Error fetching course list:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching course list:", error);
    return [];
  }
}

export async function getCourseExpiryData(courseId: number): Promise<CourseExpiryData[]> {
  const supabase = await createClient();

  try {
    // ตั้งค่า session variables สำหรับ RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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

    // ใช้ SQL query ที่กำหนด
    const { data, error } = await supabase.rpc('get_course_expiry_calendar', {
      selected_course_id: courseId
    });

    if (error) {
      console.error("Error fetching course expiry data:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching course expiry data:", error);
    return [];
  }
}
