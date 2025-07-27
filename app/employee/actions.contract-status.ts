'use server';

import { createClient } from "@/lib/supabase/server";

export async function updateEmployeeContractStatus({
  employeeId,
  statusId,
  reason,
  date
}: {
  employeeId: string;
  statusId: string;
  reason: string;
  date: string;
}) {
  const supabase = await createClient();
  // หาค่า contract ล่าสุดของ employee
  const { data: contract, error: contractError } = await supabase
    .from("employee_contracts")
    .select("employee_contract_id")
    .eq("employee_id", employeeId)
    .is("end_date", null)
    .single();

  if (contractError || !contract) {
    return { error: contractError?.message || "ไม่พบสัญญา" };
  }

  // อัปเดตสถานะ, เหตุผล, วันที่
  const { error: updateError } = await supabase
    .from("employee_contracts")
    .update({
      status_id: statusId,
      note: reason,
      end_date: date,
    })
    .eq("employee_contract_id", contract.employee_contract_id);

  if (updateError) {
    return { error: updateError.message };
  }
  return { error: null };
}
