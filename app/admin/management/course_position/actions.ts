'use server';

import { createClient } from "@/lib/supabase/server";

export interface PositionCourse {
  position_name: string;
  required_courses: string;
}

export async function getPositionCourses(): Promise<{ data: PositionCourse[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    
    // ตรวจสอบ user ที่ล็อกอิน
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: "Unauthorized" };
    }

    // ตรวจสอบ role ของ user - เฉพาะ admin เท่านั้น
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return { data: null, error: "Unable to verify user permissions" };
    }

    // อนุญาตเฉพาะ admin เท่านั้น
    if (userProfile.role !== 'admin') {
      return { data: null, error: "Access denied - Admin access required" };
    }

    const { data, error } = await supabase
      .from('view_position_required_courses')
      .select('*')
      .order('position_name');

    if (error) {
      console.error('Error fetching position courses:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}
