"use client";

interface Employee {
  po_id?: number;
  po_number?: string;
  employee_id?: string;
  first_name_th?: string;
  last_name_th?: string;
  job_position_name: string;
  function_code?: string;
  start_date?: string;
  end_date?: string;
  company_name: string;
  employee_count?: number;
}

interface RecentEmployeesProps {
  employees: Employee[];
  type: "new" | "resignation";
  showCompany: boolean;
}

export default function RecentEmployees({ employees, type, showCompany }: RecentEmployeesProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ไม่มีข้อมูล{type === "new" ? "PO ใหม่" : "PO หมดอายุ"}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map((employee) => (
        <div key={employee.po_id || employee.employee_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
          <div className="flex-1">
            <div className="font-medium text-sm">
              {employee.po_number ? 
                `${employee.po_number}` : 
                `${employee.first_name_th} ${employee.last_name_th}`
              }
            </div>
            <div className="text-xs text-gray-600">
              {employee.job_position_name}
            </div>
            {employee.function_code && (
              <div className="text-xs text-purple-600">
                {employee.function_code}
              </div>
            )}
            {employee.employee_count && (
              <div className="text-xs text-orange-600">
                จำนวนพนักงาน: {employee.employee_count} คน
              </div>
            )}
            {showCompany && (
              <div className="text-xs text-blue-600">
                {employee.company_name}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className={`text-xs px-2 py-1 rounded-full ${
              type === "new" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {type === "new" ? "เข้าใหม่" : "ออก"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {type === "new" 
                ? formatDate(employee.start_date || "") 
                : formatDate(employee.end_date || "")
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
