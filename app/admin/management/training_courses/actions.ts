'use server';

import { createClient } from "@/lib/supabase/server";

export interface TrainingCourse {
  course_id: number;
  course_name: string;
  validity_period_days: number;
}

export async function getTrainingCourses(): Promise<{ data: TrainingCourse[] | null; error: string | null }> {
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
      .from('training_courses')
      .select('*')
      .order('course_name', { ascending: true });

    if (error) {
      console.error('Error fetching training courses:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function createTrainingCourse(courseName: string, validityPeriodDays: number = 30): Promise<{ data: TrainingCourse | null; error: string | null }> {
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
      .from('training_courses')
      .insert([{ course_name: courseName, validity_period_days: validityPeriodDays }])
      .select()
      .single();

    if (error) {
      console.error('Error creating training course:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function updateTrainingCourse(
  courseId: number, 
  courseName: string,
  validityPeriodDays: number
): Promise<{ data: TrainingCourse | null; error: string | null }> {
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
      .from('training_courses')
      .update({ course_name: courseName, validity_period_days: validityPeriodDays })
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating training course:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function deleteTrainingCourse(courseId: number): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    
    // ตรวจสอบ user ที่ล็อกอิน
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    // ตรวจสอบ role ของ user - เฉพาะ admin เท่านั้น
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return { error: "Unable to verify user permissions" };
    }

    // อนุญาตเฉพาะ admin เท่านั้น
    if (userProfile.role !== 'admin') {
      return { error: "Access denied - Admin access required" };
    }

    const { error } = await supabase
      .from('training_courses')
      .delete()
      .eq('course_id', courseId);

    if (error) {
      console.error('Error deleting training course:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
