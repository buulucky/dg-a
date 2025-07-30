'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_id?: number;
  company_name?: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`
      *,
      companies (
        company_name
      )
    `)
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
    redirect('/protected');
  }

  return {
    ...profile,
    company_name: profile.companies?.company_name
  } as UserProfile;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = await createClient();
  
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      companies (
        company_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return users.map(user => ({
    ...user,
    company_name: user.companies?.company_name
  })) as UserProfile[];
}
