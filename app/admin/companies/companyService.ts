import { createClient } from "@/lib/supabase/client";

export type Company = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
};

export async function fetchCompanies(): Promise<Company[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addCompany(form: Partial<Company>) {
  const supabase = createClient();
  const { error } = await supabase.from("companies").insert([form]);
  if (error) throw new Error(error.message);
}

export async function updateCompany(id: string, form: Partial<Company>) {
  const supabase = createClient();
  const { error } = await supabase.from("companies").update(form).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCompany(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw new Error(error.message);
}