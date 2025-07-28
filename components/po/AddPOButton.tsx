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

export default function AddPOButton({ onPOAdded }: AddPOButtonProps) {
  const [open, setOpen] = useState(false);
  const [poNumber, setPONumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ company_id: string; company_name: string }[]>([]);
  const [jobPositions, setJobPositions] = useState<{ job_position_id: string; job_position_name: string }[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingJobPositions, setLoadingJobPositions] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("companies").select("company_id, company_name");

      setLoadingCompanies(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลบริษัท: " + error.message);
      } else {
        setCompanies(data || []);
      }
    };

    const fetchJobPositions = async () => {
      setLoadingJobPositions(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("job_positions").select("job_position_id, job_position_name");

      setLoadingJobPositions(false);

      if (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตำแหน่งงาน: " + error.message);
      } else {
        setJobPositions(data || []);
      }
    };

    fetchCompanies();
    fetchJobPositions();
  }, []);

  const handleAddPO = async () => {
    if (!poNumber || !companyName || !jobPosition) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("purchase_orders").insert({
      po_number: poNumber,
      company_name: companyName,
      job_position: jobPosition,
    });

    setLoading(false);

    if (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่ม PO: " + error.message);
    } else {
      toast.success("เพิ่ม PO สำเร็จ");
      setOpen(false);
      setPONumber("");
      setCompanyName("");
      setJobPosition("");
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
                <Label htmlFor="companyName">ชื่อบริษัท</Label>
                <select
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกบริษัท</option>
                  {loadingCompanies ? (
                    <option disabled>กำลังโหลด...</option>
                  ) : (
                    companies.map((company) => (
                      <option key={company.company_id} value={company.company_name}>
                        {company.company_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <Label htmlFor="jobPosition">ตำแหน่งงาน</Label>
                <select
                  id="jobPosition"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกตำแหน่งงาน</option>
                  {loadingJobPositions ? (
                    <option disabled>กำลังโหลด...</option>
                  ) : (
                    jobPositions.map((position) => (
                      <option key={position.job_position_id} value={position.job_position_name}>
                        {position.job_position_name}
                      </option>
                    ))
                  )}
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