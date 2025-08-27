'use server';

import { createClient } from "@/lib/supabase/server";

export interface PositionCourse {
  position_name: string;
  required_courses: string;
}

export interface JobPosition {
  job_position_id: number;
  job_position_name: string;
}

export interface TrainingCourse {
  course_id: number;
  course_name: string;
  validity_period_days: number;
}

export interface PositionCourseLink {
  job_position_id: number;
  course_id: number;
}

// Helper function to verify admin access
async function verifyAdminAccess() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { user: null, error: "Unauthorized" };
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    return { user: null, error: "Unable to verify user permissions" };
  }

  if (userProfile.role !== 'admin') {
    return { user: null, error: "Access denied - Admin access required" };
  }

  return { user, error: null };
}

export async function getPositionCourses(): Promise<{ data: PositionCourse[] | null; error: string | null }> {
  try {
    const { user, error: authError } = await verifyAdminAccess();
    if (authError || !user) {
      return { data: null, error: authError };
    }

    const supabase = await createClient();
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

export async function getJobPositions(): Promise<{ data: JobPosition[] | null; error: string | null }> {
  try {
    const { user, error: authError } = await verifyAdminAccess();
    if (authError || !user) {
      return { data: null, error: authError };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('job_positions')
      .select('job_position_id, job_position_name')
      .order('job_position_name');

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

export async function getTrainingCourses(): Promise<{ data: TrainingCourse[] | null; error: string | null }> {
  try {
    const { user, error: authError } = await verifyAdminAccess();
    if (authError || !user) {
      return { data: null, error: authError };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('training_courses')
      .select('course_id, course_name, validity_period_days')
      .order('course_id');

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

export async function getLinkedCourses(jobPositionId: number): Promise<{ data: number[] | null; error: string | null }> {
  try {
    const { user, error: authError } = await verifyAdminAccess();
    if (authError || !user) {
      return { data: null, error: authError };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('position_courses')
      .select('course_id')
      .eq('job_position_id', jobPositionId);

    if (error) {
      console.error('Error fetching linked courses:', error);
      return { data: null, error: error.message };
    }

    const courseIds = data?.map(item => item.course_id) || [];
    return { data: courseIds, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

export async function updatePositionCourses(
  jobPositionId: number, 
  courseIds: number[]
): Promise<{ error: string | null }> {
  try {
    const { user, error: authError } = await verifyAdminAccess();
    if (authError || !user) {
      return { error: authError };
    }

    const supabase = await createClient();

    // Get existing course links
    const { data: existingData, error: fetchError } = await supabase
      .from('position_courses')
      .select('course_id')
      .eq('job_position_id', jobPositionId);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return { error: fetchError.message };
    }

    const existingCourseIds = existingData?.map(item => item.course_id) || [];
    
    // Determine what to delete and insert
    const toDelete = existingCourseIds.filter(id => !courseIds.includes(id));
    const toInsert = courseIds.filter(id => !existingCourseIds.includes(id));

    // Delete removed courses
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('position_courses')
        .delete()
        .eq('job_position_id', jobPositionId)
        .in('course_id', toDelete);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return { error: deleteError.message };
      }
    }

    // Insert new courses
    if (toInsert.length > 0) {
      const insertData = toInsert.map(courseId => ({
        job_position_id: jobPositionId,
        course_id: courseId
      }));

      const { error: insertError } = await supabase
        .from('position_courses')
        .insert(insertData);

      if (insertError) {
        console.error('Insert error:', insertError);
        return { error: insertError.message };
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
