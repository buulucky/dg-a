"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export default function AddEmployeeButton() {
  const [open, setOpen] = useState(false);
  const [personalId, setPersonalId] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [checkingEmp, setCheckingEmp] = useState(false);
  const [checkEmpResult, setCheckEmpResult] = useState<string | null>(null);
  const [canProceed, setCanProceed] = useState(false);
  // Form data states
  const [formData, setFormData] = useState({
    prefix_th: "",
    first_name_th: "",
    last_name_th: "",
    prefix_en: "",
    first_name_en: "",
    last_name_en: "",
    birth_date: ""
  });
  // Helper to check if all required fields are filled
  const isFormFilled =
    formData.prefix_th &&
    formData.first_name_th &&
    formData.last_name_th &&
    formData.birth_date &&
    personalId.length === 13 &&
    employeeId.length > 0;

  // Helper to check if employeeId has been checked and is available
  const isEmpIdChecked = checkEmpResult === "ไม่พบรหัสนี้ในระบบ - สามารถใช้ได้";

  // Helper to check if there are any errors
  const hasError =
    (checkResult && !canProceed) ||
    (checkEmpResult && checkEmpResult.includes("ไม่สามารถใช้ได้")) ||
    checking || checkingEmp;

  const checkPersonalId = async () => {
    setChecking(true);
    setCanProceed(false);
    
    try {
      const supabase = createClient();
      
      // ขั้นแรก: ตรวจสอบว่ามีพนักงานคนนี้ในระบบหรือไม่
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
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
        .eq('personal_id', personalId)
        .single();

      if (employeeError && employeeError.code !== 'PGRST116') {
        throw employeeError;
      }

      if (!employeeData) {
        // ไม่พบข้อมูล = สามารถเพิ่มพนักงานใหม่ได้
        setCheckResult("ไม่พบเลขนี้ในระบบ - สามารถเพิ่มพนักงานใหม่ได้");
        setCanProceed(true);
        // ล้างข้อมูลฟอร์ม
        setFormData({
          prefix_th: "",
          first_name_th: "",
          last_name_th: "",
          prefix_en: "",
          first_name_en: "",
          last_name_en: "",
          birth_date: ""
        });
        setEmployeeId("");
      } else {
        // พบข้อมูล = ตรวจสอบว่ามีสัญญาที่ยัง active หรือไม่
        const { data: activeContract, error: contractError } = await supabase
          .from('employee_contracts')
          .select('employee_contract_id, start_date, end_date')
          .eq('employee_id', employeeData.employee_id)
          .is('end_date', null)
          .single();

        if (contractError && contractError.code !== 'PGRST116') {
          throw contractError;
        }

        if (activeContract) {
          // มีสัญญาที่ยัง active = ไม่สามารถเพิ่มได้
          setCheckResult("พนักงานยังมีสัญญาที่ active อยู่ในระบบ - ไม่สามารถเพิ่มได้");
          setCanProceed(false);
        } else {
          // ไม่มีสัญญาที่ active = สามารถเพิ่มได้ และเติมข้อมูลอัตโนมัติ
          setCheckResult("พบข้อมูลพนักงานในระบบ แต่ไม่มีสัญญาที่ active - เติมข้อมูลอัตโนมัติ");
          setCanProceed(true);
          
          // เติมข้อมูลลงฟอร์มอัตโนมัติ
          setFormData({
            prefix_th: employeeData.prefix_th || "",
            first_name_th: employeeData.first_name_th || "",
            last_name_th: employeeData.last_name_th || "",
            prefix_en: employeeData.prefix_en || "",
            first_name_en: employeeData.first_name_en || "",
            last_name_en: employeeData.last_name_en || "",
            birth_date: employeeData.birth_date || ""
          });
        }
      }
    } catch (error) {
      console.error('Error checking personal ID:', error);
      setCheckResult("เกิดข้อผิดพลาดในการตรวจสอบ");
      setCanProceed(false);
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)}>
        เพิ่มพนักงาน
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">เพิ่มพนักงาน</h2>
            <form className="space-y-3">
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50 mb-2">
                <Label htmlFor="personal_id" className="mb-1 block">
                  เลขบัตรประชาชน (personal_id)
                </Label>
                <div className="flex gap-2 items-end">
                  <Input
                    id="personal_id"
                    type="text"
                    maxLength={13}
                    required
                    value={personalId}
                    onChange={(e) => {
                      setPersonalId(e.target.value);
                      setCheckResult(null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={personalId.length !== 13 || checking}
                    onClick={checkPersonalId}
                  >
                    {checking ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
                  </Button>
                </div>
                {checkResult && (
                  <div
                    className={
                      canProceed
                        ? "text-green-600 text-sm mt-1"
                        : "text-red-600 text-sm mt-1"
                    }
                  >
                    {checkResult}
                  </div>
                )}
              </div>
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="flex gap-2">
                  <div className="w-20 flex-shrink-0">
                    <Label htmlFor="prefix_th">คำนำหน้าชื่อ</Label>
                    <Select
                      id="prefix_th"
                      required
                      disabled={!canProceed}
                      value={formData.prefix_th}
                      onChange={(e) => setFormData({...formData, prefix_th: e.target.value})}
                      className="border rounded py-1 text-sm w-20"
                    >
                      <option value="">-- เลือก --</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="first_name_th">ชื่อ</Label>
                    <Input 
                      id="first_name_th" 
                      type="text" 
                      required 
                      disabled={!canProceed}
                      value={formData.first_name_th}
                      onChange={(e) => setFormData({...formData, first_name_th: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="last_name_th">นามสกุล</Label>
                    <Input 
                      id="last_name_th" 
                      type="text" 
                      required 
                      disabled={!canProceed}
                      value={formData.last_name_th}
                      onChange={(e) => setFormData({...formData, last_name_th: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="w-20 flex-shrink-0">
                    <Label htmlFor="prefix_en">Prefix (EN)</Label>
                    <Select
                      id="prefix_en"
                      disabled={!canProceed}
                      value={formData.prefix_en}
                      onChange={(e) => setFormData({...formData, prefix_en: e.target.value})}
                      className="border rounded py-1 text-sm w-20"
                    >
                      <option value="">-- เลือก --</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Miss">Miss</option>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="first_name_en">First Name (EN)</Label>
                    <Input 
                      id="first_name_en" 
                      type="text" 
                      disabled={!canProceed}
                      value={formData.first_name_en}
                      onChange={(e) => setFormData({...formData, first_name_en: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="last_name_en">Last Name (EN)</Label>
                    <Input 
                      id="last_name_en" 
                      type="text" 
                      disabled={!canProceed}
                      value={formData.last_name_en}
                      onChange={(e) => setFormData({...formData, last_name_en: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="birth_date">วันเกิด (birth_date)</Label>
                  <Input 
                    id="birth_date" 
                    type="date" 
                    required 
                    disabled={!canProceed}
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="mt-3">
                  <Label htmlFor="employee_id">รหัสพนักงาน (employee_id)</Label>
                  <div className="flex gap-2 items-end">
                    <Input
                      id="employee_id"
                      type="text"
                      required
                      disabled={!canProceed}
                      value={employeeId}
                      onChange={(e) => {
                        setEmployeeId(e.target.value);
                        setCheckEmpResult(null);
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={employeeId.length === 0 || checkingEmp || !canProceed}
                      onClick={async () => {
                        setCheckingEmp(true);
                        try {
                          const supabase = createClient();
                          
                          // ตรวจสอบว่ามี employee_code ซ้ำใน employee_profiles หรือไม่
                          const { data: existingProfile, error } = await supabase
                            .from('employee_profiles')
                            .select('employee_code')
                            .eq('employee_code', employeeId)
                            .single();

                          if (error && error.code !== 'PGRST116') {
                            throw error;
                          }

                          if (existingProfile) {
                            setCheckEmpResult("พบรหัสนี้ในระบบแล้ว - ไม่สามารถใช้ได้");
                          } else {
                            setCheckEmpResult("ไม่พบรหัสนี้ในระบบ - สามารถใช้ได้");
                          }
                        } catch (error) {
                          console.error('Error checking employee code:', error);
                          setCheckEmpResult("เกิดข้อผิดพลาดในการตรวจสอบ");
                        } finally {
                          setCheckingEmp(false);
                        }
                      }}
                    >
                      {checkingEmp ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
                    </Button>
                  </div>
                  {checkEmpResult && (
                    <div
                      className={
                        checkEmpResult === "ไม่พบรหัสนี้ในระบบ - สามารถใช้ได้"
                          ? "text-green-600 text-sm mt-1"
                          : "text-red-600 text-sm mt-1"
                      }
                    >
                      {checkEmpResult}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  ปิด
                </Button>
                <Button
                  variant="default"
                  type="submit"
                  disabled={
                    !canProceed ||
                    !isFormFilled ||
                    !isEmpIdChecked ||
                    hasError
                  }
                >
                  บันทึก
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
