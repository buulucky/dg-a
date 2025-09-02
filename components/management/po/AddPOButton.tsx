"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { getFunctions, getJobPositions, getCompanies, addPO, getUserRole } from "@/app/admin/management/po/actions";

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
  
  // Authentication states
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Data states
  const [functions, setFunctions] = useState<{ function_id: string; function_code: string }[]>([]);
  const [jobPositions, setJobPositions] = useState<{ job_position_id: string; job_position_name: string }[]>([]);
  const [companies, setCompanies] = useState<{ company_id: string; company_name: string }[]>([]);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [loadingJobPositions, setLoadingJobPositions] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // ตรวจสอบสิทธิ์ admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsCheckingAuth(true);
      try {
        // ใช้ getUserRole จาก actions
        const result = await getUserRole();
        setIsAdmin(result.isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, []);

  // ดึงข้อมูล Functions
  useEffect(() => {
    const fetchFunctions = async () => {
      setLoadingFunctions(true);
      const result = await getFunctions();
      setLoadingFunctions(false);

      if (result.error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลฟังก์ชัน: " + result.error);
      } else {
        setFunctions(result.data);
      }
    };

    fetchFunctions();
  }, []);

  // ดึงข้อมูล Job Positions
  useEffect(() => {
    const fetchJobPositions = async () => {
      setLoadingJobPositions(true);
      const result = await getJobPositions();
      setLoadingJobPositions(false);

      if (result.error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตำแหน่งงาน: " + result.error);
      } else {
        console.log("All Job Positions Data:", result.data);
        setJobPositions(result.data);
      }
    };

    fetchJobPositions();
  }, []);

  // ดึงข้อมูล Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      const result = await getCompanies();
      setLoadingCompanies(false);

      if (result.error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลบริษัท: " + result.error);
      } else {
        console.log("All Companies Data:", result.data);
        setCompanies(result.data);
      }
    };

    fetchCompanies();
  }, []);

  const handleAddPO = async () => {
    // ตรวจสอบสิทธิ์ admin อีกครั้งก่อนดำเนินการ
    if (!isAdmin) {
      toast.error("ไม่มีสิทธิ์ในการเพิ่ม PO - เฉพาะผู้ดูแลระบบเท่านั้น");
      return;
    }

    setLoading(true);

    const result = await addPO({
      po_number: poNumber,
      function_id: selectedFunctionId,
      job_position_id: selectedJobPositionId,
      company_id: selectedCompanyId,
      start_date: contractStartDate,
      end_date: contractEndDate,
      employee_count: quantity,
      po_type: paymentType,
    });

    setLoading(false);

    if (result.success) {
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
    } else {
      toast.error(result.error || "เกิดข้อผิดพลาดในการเพิ่ม PO");
    }
  };

  return (
    <>
      <style jsx>{modalStyles}</style>
      
      {/* แสดงปุ่มเฉพาะเมื่อเป็น admin */}
      {isCheckingAuth ? (
        <Button disabled>กำลังตรวจสอบสิทธิ์...</Button>
      ) : isAdmin ? (
        <Button onClick={() => setOpen(true)}>+ เพิ่ม PO ใหม่</Button>
      ) : (
        <div className="text-sm text-gray-500">
          เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเพิ่ม PO ได้
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center backdrop-blur-sm justify-center p-4 bg-black bg-opacity-50">
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
                <select
                  id="companyName"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
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
