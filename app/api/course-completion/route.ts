import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { employee_id, course_id, date_completed } = await request.json();

    // Validate required fields
    if (!employee_id || !course_id || !date_completed) {
      return NextResponse.json(
        { error: 'Missing required fields: employee_id, course_id, date_completed' },
        { status: 400 }
      );
    }

    // Validate date format and ensure it's not in the future
    const completionDate = new Date(date_completed);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (isNaN(completionDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (completionDate > today) {
      return NextResponse.json(
        { error: 'Completion date cannot be in the future' },
        { status: 400 }
      );
    }

    // Insert the course completion record
    const { data, error } = await supabase
      .from('employee_course_records')
      .insert({
        employee_id: parseInt(employee_id),
        course_id: parseInt(course_id),
        date_completed: date_completed
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting course completion:', error);
      return NextResponse.json(
        { error: 'Failed to save course completion record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
