"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

const modalStyles = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

interface AddPOButtonProps {
  onPOAdded?: () => void;
}

// ...existing code...

export default function AddPOButton({ onPOAdded }: AddPOButtonProps) {
  const [open, setOpen] = useState(false);
  const [poNumber, setPONumber] = useState("");
  const [selectedFunctionId, setSelectedFunctionId] = useState("");
  const [selectedJobPositionId, setSelectedJobPositionId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [functions, setFunctions] = useState<{ function_id: string; function_code: string }[]>([]);
  const [jobPositions, setJobPositions] = useState<{ job_position_id: string; job_position_name: string }[]>([]);
  const [companies, setCompanies] = useState<{ company_id: string; company_name: string }[]>([]);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [loadingJobPositions, setLoadingJobPositions] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    const fetchFunctions = async () => {
      setLoadingFunctions(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("functions").select("function_id, function_code");

      setLoadingFunctions(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลฟังก์ชัน: " + error.message);
      } else {
        setFunctions(data || []);
      }
    };

    fetchFunctions();
  }, []);

  useEffect(() => {
    const fetchJobPositions = async () => {
      if (!selectedFunctionId) {
        setJobPositions([]);
        setSelectedJobPositionId("");
        setSelectedCompanyId("");
        return;
      }

      setLoadingJobPositions(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("function_positions")
        .select(`
          job_position_id,
          job_positions!inner(job_position_name)
        `)
        .eq("function_id", selectedFunctionId);

      console.log("Selected Function ID:", selectedFunctionId);
      console.log("Job Positions Data:", data);

      setLoadingJobPositions(false);

      if (error) {
        console.error("Error fetching job positions:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตำแหน่งงาน: " + error.message);
      } else {
        console.log("Raw job positions data:", data); // Debug
        const formattedData = data?.map((item: { job_position_id: string; job_positions?: { job_position_name: string } | { job_position_name: string }[] }) => {
          console.log("Item structure:", item); // Debug each item
          return {
            job_position_id: item.job_position_id,
            job_position_name: (Array.isArray(item.job_positions)
              ? item.job_positions[0]?.job_position_name
              : (item.job_positions as { job_position_name: string } | undefined)?.job_position_name) || "Unknown Position",
          };
        }) || [];
        console.log("Formatted job positions:", formattedData); // Debug
        setJobPositions(formattedData);
        setSelectedJobPositionId("");
        setSelectedCompanyId("");
      }
    };

    fetchJobPositions();
  }, [selectedFunctionId]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!selectedFunctionId || !selectedJobPositionId) {
        setCompanies([]);
        setSelectedCompanyId("");
        return;
      }

      setLoadingCompanies(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("function_position_companies")
        .select(`
          company_id,
          companies!inner(company_name)
        `)
        .eq("function_id", selectedFunctionId)
        .eq("job_position_id", selectedJobPositionId);

      console.log("Selected Function ID:", selectedFunctionId);
      console.log("Selected Job Position ID:", selectedJobPositionId);
      console.log("Companies Data:", data);

      setLoadingCompanies(false);

      if (error) {
        console.error("Error fetching companies:", error); // Debug
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลบริษัท: " + error.message);
      } else {
        console.log("Raw companies data:", data); // Debug
        const formattedData = data?.map((item: { company_id: string; companies?: { company_name: string } | { company_name: string }[] }) => {
          console.log("Company item structure:", item); // Debug each item
          return {
            company_id: item.company_id,
            company_name: (Array.isArray(item.companies)
              ? item.companies[0]?.company_name
              : (item.companies as { company_name: string } | undefined)?.company_name) || "Unknown Company",
          };
        }) || [];
        console.log("Formatted companies:", formattedData); // Debug
        setCompanies(formattedData);
        setSelectedCompanyId("");
      }
    };

    fetchCompanies();
  }, [selectedFunctionId, selectedJobPositionId]);

  const handleAddPO = async () => {
    if (!poNumber || !selectedFunctionId || !selectedJobPositionId || !selectedCompanyId || 
        !contractStartDate || !contractEndDate || !quantity || !paymentType) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // ตรวจสอบว่าเลข PO ซ้ำหรือไม่
    const { data: existingPO, error: checkError } = await supabase
      .from("po")
      .select("po_number")
      .eq("po_number", poNumber)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116: No rows found
      setLoading(false);
      toast.error("เกิดข้อผิดพลาดในการตรวจสอบเลข PO: " + checkError.message);
      return;
    }

    if (existingPO) {
      setLoading(false);
      toast.error("เลข PO นี้มีอยู่ในระบบแล้ว");
      return;
    }

    const { error } = await supabase.from("po").insert({
      po_number: poNumber,
      function_id: selectedFunctionId,
      job_position_id: selectedJobPositionId,
      company_id: selectedCompanyId,
      start_date: contractStartDate,
      end_date: contractEndDate,
      employee_count: parseInt(quantity),
      po_type: paymentType,
    });

    setLoading(false);

    if (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่ม PO: " + error.message);
    } else {
      toast.success("เพิ่ม PO สำเร็จ");
      setOpen(false);
      setPONumber("");
      setSelectedFunctionId("");
      setSelectedJobPositionId("");
      setSelectedCompanyId("");
      setContractStartDate("");
      setContractEndDate("");
      setQuantity("");
      setPaymentType("");
      if (onPOAdded) onPOAdded();
    }
  };

  return (
    <>
      <style jsx>{modalStyles}</style>
      <Button onClick={() => setOpen(true)}>+ เพิ่ม PO ใหม่</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            style={{ animation: "modalFadeIn 0.2s ease-out" }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              เพิ่ม PO ใหม่
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="poNumber">เลข PO</Label>
                <Input
                  id="poNumber"
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  placeholder="กรอกเลข PO"
                />
              </div>
              <div>
                <Label htmlFor="function">ฟังก์ชัน</Label>
                <select
                  id="function"
                  value={selectedFunctionId}
                  onChange={(e) => setSelectedFunctionId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกฟังก์ชัน</option>
                  {loadingFunctions ? (
                    <option disabled>กำลังโหลด...</option>
                  ) : (
                    functions.map((func) => (
                      <option key={func.function_id} value={func.function_id}>
                        {func.function_code}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <Label htmlFor="jobPosition">ตำแหน่งงาน</Label>
                <select
                  id="jobPosition"
                  value={selectedJobPositionId}
                  onChange={(e) => setSelectedJobPositionId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedFunctionId}
                >
                  <option value="">เลือกตำแหน่งงาน</option>
                  {loadingJobPositions ? (
                    <option disabled>กำลังโหลด...</option>
                  ) : (
                    jobPositions.map((position) => (
                      <option key={position.job_position_id} value={position.job_position_id}>
                        {position.job_position_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <Label htmlFor="companyName">บริษัท</Label>
                <select
                  id="companyName"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedFunctionId || !selectedJobPositionId}
                >
                  <option value="">เลือกบริษัท</option>
                  {loadingCompanies ? (
                    <option disabled>กำลังโหลด...</option>
                  ) : (
                    companies.map((company) => (
                      <option key={company.company_id} value={company.company_id}>
                        {company.company_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <Label htmlFor="contractStartDate">วันเริ่มสัญญา</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contractEndDate">วันสิ้นสุดสัญญา</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quantity">จำนวน</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="กรอกจำนวน"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="paymentType">สัญญา</Label>
                <select
                  id="paymentType"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="รายวัน">รายวัน</option>
                  <option value="รายเดือน">รายเดือน</option>
                </select>
              </div>

            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleAddPO} disabled={loading}>
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}