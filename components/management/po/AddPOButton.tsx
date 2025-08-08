"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

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

export default function AddPOButton({ onPOAdded }: AddPOButtonProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [poNumber, setPONumber] = useState("");
  const [selectedFunctionId, setSelectedFunctionId] = useState("");
  const [selectedJobPositionId, setSelectedJobPositionId] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [functions, setFunctions] = useState<{ function_id: string; function_code: string }[]>([]);
  const [jobPositions, setJobPositions] = useState<{ job_position_id: string; job_position_name: string }[]>([]);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [loadingJobPositions, setLoadingJobPositions] = useState(false);
  const [companyName, setCompanyName] = useState("กำลังโหลด...");

  useEffect(() => {
    const fetchFunctions = async () => {
      setLoadingFunctions(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("functions")
        .select("function_id, function_code");

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
      setLoadingJobPositions(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("job_positions")
        .select("job_position_id, job_position_name"); // Fetch directly from job_positions table

      setLoadingJobPositions(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตำแหน่งงาน: " + error.message);
      } else {
        setJobPositions(data || []);
      }
    };

    fetchJobPositions();
  }, []);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!user?.company_id) {
        setCompanyName("ไม่พบข้อมูลบริษัท");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("company_name")
        .eq("company_id", user.company_id)
        .single();

      if (error) {
        console.error("Error fetching company name:", error);
        setCompanyName("ไม่พบข้อมูลบริษัท");
      } else {
        setCompanyName(data?.company_name || "ไม่พบข้อมูลบริษัท");
      }
    };

    fetchCompanyName();
  }, [user?.company_id]);

  const handleAddPO = async () => {
    if (!poNumber || !selectedFunctionId || !selectedJobPositionId || !user?.company_id || 
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
      toast.error("เลข PO นี้มีอยู่ในระบบแล้ว ไม่สามารถบันทึกได้");
      return;
    }

    const { error } = await supabase.from("po").insert({
      po_number: poNumber,
      function_id: selectedFunctionId,
      job_position_id: selectedJobPositionId,
      company_id: user.company_id,
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
        <div className="fixed inset-0 z-50 flex items-center  backdrop-blur-sm  justify-center p-4 bg-black bg-opacity-50">
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
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
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
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
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
                <p id="companyName" className="text-gray-700">{companyName}</p>
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
                <Label htmlFor="paymentType">ประเภทสัญญา</Label>
                <select
                  id="paymentType"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                >
                  <option value="">เลือกประเภทสัญญา</option>
                  <option value="รายเดือน">รายเดือน</option>
                  <option value="รายวัน">รายวัน</option>
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