import { createClient } from "@/lib/supabase/server";

export default async function TestDBPage() {
  const supabase = await createClient();

  try {
    // ทดสอบการเชื่อมต่อฐานข้อมูล
    const { data: employeeContractsTest, error: employeeContractsError } = await supabase
      .from('employee_contracts')
      .select('employee_contract_id, employee_id, po_id, status_id, employee_code, start_date, end_date')
      .limit(10);

    console.log("Employee Contracts Test:", employeeContractsTest);

    // ดึงข้อมูลจาก view_employee_contracts_relationship
    const { data: employeeContractsView, error: employeeContractsViewError } = await supabase
      .from('view_employee_contracts_relationship')
      .select('*')
      .limit(10);

    console.log("Employee Contracts View:", employeeContractsView);

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

        <div>
          <h2 className="text-lg font-semibold">Employee Contracts Table:</h2>
          {employeeContractsError ? (
            <p className="text-red-600">Error: {employeeContractsError.message}</p>
          ) : (
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(employeeContractsTest, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Employee Contracts View:</h2>
          {employeeContractsViewError ? (
            <p className="text-red-600">Error: {employeeContractsViewError.message}</p>
          ) : (
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(employeeContractsView, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Database Connection Failed</h1>
        <pre className="bg-red-100 p-4 rounded text-red-700">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
