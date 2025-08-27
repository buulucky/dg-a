'use server';

import { createClient } from "@/lib/supabase/server";

export interface JobPosition {
  job_position_id: number;
  job_position_name: string;
}

export async function getJobPositions(): Promise<{ data: JobPosition[] | null; error: string | null }> {
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
      .from('job_positions')
      .select('*')
      .order('job_position_name', { ascending: true });

    if (error) {
      console.error('Error fetching job positions:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function createJobPosition(jobPositionName: string): Promise<{ data: JobPosition | null; error: string | null }> {
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
      .from('job_positions')
      .insert([{ job_position_name: jobPositionName }])
      .select()
      .single();

    if (error) {
      console.error('Error creating job position:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function updateJobPosition(
  jobPositionId: number, 
  jobPositionName: string
): Promise<{ data: JobPosition | null; error: string | null }> {
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
      .from('job_positions')
      .update({ job_position_name: jobPositionName })
      .eq('job_position_id', jobPositionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job position:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function deleteJobPosition(jobPositionId: number): Promise<{ error: string | null }> {
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
      .from('job_positions')
      .delete()
      .eq('job_position_id', jobPositionId);

    if (error) {
      console.error('Error deleting job position:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
