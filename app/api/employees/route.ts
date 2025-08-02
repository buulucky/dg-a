import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      personalId,
      formData,
      employeeId,
      selectedPoId,
      checkEmployeeCode,
      checkPersonalId,
      loadPoList,
      companyId,
    } = body;

    const supabase = await createClient();

    // Check for duplicate employee_code
    if (checkEmployeeCode) {
      const { data: existingContracts, error } = await supabase
        .from("employee_contracts")
        .select("employee_code, employee_id, po_id")
        .eq("employee_code", employeeId)
        .is("end_date", null);

      if (error) throw error;

      const hasDuplicate = await Promise.all(
        existingContracts?.map(async (contract) => {
          const { data: po, error: poError } = await supabase
            .from("po")
            .select("company_id")
            .eq("po_id", contract.po_id)
            .single();

          if (poError) throw poError;

          return po?.company_id === companyId;
        }) || []
      ).then((results) => results.some((isDuplicate) => isDuplicate));

      return NextResponse.json({ duplicate: hasDuplicate });
    }

    // Check personal ID and get employee data
    if (checkPersonalId) {
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select(`
          personal_id, 
          employee_id,
          prefix_th,
          first_name_th,
          last_name_th,
          prefix_en,
          first_name_en,
          last_name_en,
          birth_date
        `)
        .eq("personal_id", personalId)
        .single();

      if (employeeError && employeeError.code !== "PGRST116") {
        throw employeeError;
      }

      let hasActiveContract = false;
      if (employeeData) {
        const { data: activeContract, error: contractError } = await supabase
          .from("employee_contracts")
          .select("employee_contract_id")
          .eq("employee_id", employeeData.employee_id)
          .is("end_date", null)
          .single();

        if (contractError && contractError.code !== "PGRST116") {
          throw contractError;
        }

        hasActiveContract = !!activeContract;
      }

      return NextResponse.json({ 
        employeeData: employeeData || null,
        hasActiveContract 
      });
    }

    // Load PO list for a company
    if (loadPoList) {
      const { data: pos, error: poError } = await supabase
        .from("po")
        .select("po_id, po_number")
        .eq("company_id", companyId);

      if (poError) throw poError;

      return NextResponse.json({ poList: pos || [] });
    }

    let employeeIdToUse = employeeId;

    // Check if personal_id already exists
    const { data: existingEmployee, error: checkError } = await supabase
      .from("employees")
      .select("employee_id")
      .eq("personal_id", personalId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingEmployee) {
      // Update existing employee
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          prefix_th: formData.prefix_th,
          first_name_th: formData.first_name_th,
          last_name_th: formData.last_name_th,
          prefix_en: formData.prefix_en,
          first_name_en: formData.first_name_en,
          last_name_en: formData.last_name_en,
          birth_date: formData.birth_date,
        })
        .eq("personal_id", personalId);

      if (updateError) throw updateError;

      employeeIdToUse = existingEmployee.employee_id;
    } else {
      // Insert new employee
      const { data: insertEmp, error: insertError } = await supabase
        .from("employees")
        .insert({
          personal_id: personalId,
          prefix_th: formData.prefix_th,
          first_name_th: formData.first_name_th,
          last_name_th: formData.last_name_th,
          prefix_en: formData.prefix_en,
          first_name_en: formData.first_name_en,
          last_name_en: formData.last_name_en,
          birth_date: formData.birth_date,
        })
        .select("employee_id")
        .single();

      if (insertError) throw insertError;

      employeeIdToUse = insertEmp.employee_id;
    }

    // Insert contract
    const { error: contractError } = await supabase.from("employee_contracts").insert({
      employee_id: employeeIdToUse,
      employee_code: employeeId,
      po_id: selectedPoId,
      status_id: 1, // Active status
      start_date: formData.start_date,
    });

    if (contractError) throw contractError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in employee API:", error);

    let errorMessage = "An error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
