"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useUser } from "@/hooks/useUser";
import { toast } from "@/lib/toast";

// เพิ่ม keyframes สำหรับ animation
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

interface AddEmployeeButtonProps {
  onEmployeeAdded?: () => void;
}

export default function AddEmployeeButton({
  onEmployeeAdded,
}: AddEmployeeButtonProps) {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [personalId, setPersonalId] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [checkingEmp, setCheckingEmp] = useState(false);
  const [checkEmpResult, setCheckEmpResult] = useState<string | null>(null);
  const [canProceed, setCanProceed] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [poList, setPoList] = useState<{ po_id: string; po_number: string; job_position_name?: string }[]>(
    []
  );
  const [loadingPo, setLoadingPo] = useState(false);
  // Form data states
  const [formData, setFormData] = useState({
    prefix_th: "",
    first_name_th: "",
    last_name_th: "",
    prefix_en: "",
    first_name_en: "",
    last_name_en: "",
    birth_date: "",
    start_date: "",
  });
  // Helper to check if all required fields are filled
  const isFormFilled =
    formData.prefix_th &&
    formData.first_name_th &&
    formData.last_name_th &&
    formData.birth_date &&
    formData.start_date &&
    personalId.length === 13 &&
    employeeId.length > 0 &&
    selectedPoId.length > 0 &&
    poList.length > 0; // เพิ่มการตรวจสอบว่ามี PO หรือไม่

  // Helper to check if employeeId has been checked and is available
  const isEmpIdChecked = checkEmpResult === "สามารถใช้ได้";

  // Helper to check if there are any errors
  const hasError =
    (checkResult && !canProceed) ||
    (checkEmpResult && checkEmpResult.includes("ไม่สามารถใช้ได้")) ||
    checking ||
    checkingEmp;

  // Helper to clear all form and state data
  const clearAll = () => {
    setPersonalId("");
    setChecking(false);
    setCheckResult(null);
    setEmployeeId("");
    setCheckingEmp(false);
    setCheckEmpResult(null);
    setCanProceed(false);
    setSelectedPoId("");
    setPoList([]);
    setLoadingPo(false);
    setFormData({
      prefix_th: "",
      first_name_th: "",
      last_name_th: "",
      prefix_en: "",
      first_name_en: "",
      last_name_en: "",
      birth_date: "",
      start_date: "",
    });
  };

  const checkPersonalId = async () => {
    setChecking(true);
    setCanProceed(false);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkPersonalId: true,
          personalId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unknown error occurred");
      }

      if (!result.employeeData) {
        setCheckResult("ไม่พบเลขบัตรประชาชนนี้ในระบบ - สามารถเพิ่มพนักงานได้");
        setCanProceed(true);
        setFormData({
          prefix_th: "",
          first_name_th: "",
          last_name_th: "",
          prefix_en: "",
          first_name_en: "",
          last_name_en: "",
          birth_date: "",
          start_date: "",
        });
        setEmployeeId("");
        await loadPoList();
      } else if (result.hasActiveContract) {
        setCheckResult("พนักงานยังมีสัญญาที่ active อยู่ในระบบ - ไม่สามารถเพิ่มได้");
        setCanProceed(false);
      } else {
        setCheckResult("พบข้อมูลพนักงานในระบบ - สามารถเพิ่มได้");
        setCanProceed(true);
        setFormData({
          prefix_th: result.employeeData.prefix_th || "",
          first_name_th: result.employeeData.first_name_th || "",
          last_name_th: result.employeeData.last_name_th || "",
          prefix_en: result.employeeData.prefix_en || "",
          first_name_en: result.employeeData.first_name_en || "",
          last_name_en: result.employeeData.last_name_en || "",
          birth_date: result.employeeData.birth_date || "",
          start_date: "",
        });
        await loadPoList();
      }
    } catch (error) {
      console.error("Error checking personal ID:", error);
      setCheckResult("เกิดข้อผิดพลาดในการตรวจสอบ");
      setCanProceed(false);
    } finally {
      setChecking(false);
    }
  };

  const loadPoList = async () => {
    setLoadingPo(true);
    try {
      // รอให้ user data load เสร็จก่อน
      if (loading) {
        console.log("User still loading, waiting...");
        setPoList([]);
        return;
      }

      // ตรวจสอบว่ามี company_id หรือไม่
      if (!user?.company_id) {
        console.error("No company_id found for user:", user);
        setPoList([]);
        return;
      }

      console.log("Loading PO for company_id:", user.company_id);

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loadPoList: true,
          companyId: user.company_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to load PO list");
      }

      const poList = result.poList || [];
      setPoList(poList);
      
      if (poList.length === 0) {
        console.warn("No PO found for company_id:", user.company_id);
      } else {
        console.log("PO list loaded successfully:", poList.length, "items");
      }
    } catch (error) {
      console.error("Error loading PO list:", error);
      setPoList([]);
    } finally {
      setLoadingPo(false);
    }
  };

  // ตรวจสอบเลขบัตรประชาชนอัตโนมัติเมื่อครบ 13 หลัก (และเป็นตัวเลขเท่านั้น)
  useEffect(() => {
    if (personalId.length === 13 && !checking) {
      checkPersonalId();
    } else if (personalId.length < 13) {
      setCheckResult(null);
      setCanProceed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalId]);

  return (
    <>
      {/* เพิ่ม CSS animation */}
      <style jsx>{modalStyles}</style>

      <Button variant="default" onClick={() => setOpen(true)}>
        เพิ่มพนักงาน
      </Button>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-2xl p-8 min-w-[500px] max-w-2xl w-full relative transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
            style={{
              animation: "modalFadeIn 0.3s ease-out",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                เพิ่มพนักงาน
              </h2>
              <button
                onClick={() => {
                  setOpen(false);
                  clearAll();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canProceed || !isFormFilled || !isEmpIdChecked || hasError)
                  return;

                try {
                  const response = await fetch("/api/employees", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      personalId,
                      formData,
                      employeeId,
                      selectedPoId,
                      isUpdate: false,
                    }),
                  });

                  const result = await response.json();

                  console.log("API Response:", result);

                  if (!response.ok) {
                    const errorMessage = result?.error || "Unknown error occurred";
                    throw new Error(errorMessage);
                  }

                  toast.success("เพิ่มพนักงานสำเร็จ");

                  setOpen(false);
                  clearAll();

                  if (onEmployeeAdded) onEmployeeAdded();
                } catch (err: unknown) {
                  let errorMessage = "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
                  if (err instanceof Error) {
                    errorMessage = err.message;
                  }
                  console.error("Error saving employee:", err);
                  toast.error(errorMessage);
                }
              }}
            >
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50 mb-2">
                <Label htmlFor="personal_id" className="mb-1 block">
                  เลขบัตรประชาชน
                </Label>
                <div className="flex gap-2 items-end">
                  <Input
                    id="personal_id"
                    type="text"
                    maxLength={13}
                    required
                    value={personalId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setPersonalId(value);
                      setCheckResult(null);
                    }}
                  />
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
                    <Label htmlFor="prefix_th">คำนำหน้า</Label>
                    <Select
                      id="prefix_th"
                      required
                      disabled={!canProceed}
                      value={formData.prefix_th}
                      onChange={(e) =>
                        setFormData({ ...formData, prefix_th: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_name_th: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_name_th: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-20 flex-shrink-0">
                    <Label htmlFor="prefix_en">คำนำหน้า</Label>
                    <Select
                      id="prefix_en"
                      required
                      disabled={!canProceed}
                      value={formData.prefix_en}
                      onChange={(e) =>
                        setFormData({ ...formData, prefix_en: e.target.value })
                      }
                      className="border rounded py-1 text-sm w-20"
                    >
                      <option value="">-- เลือก --</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="first_name_en">First Name (EN)</Label>
                    <Input
                      id="first_name_en"
                      type="text"
                      required
                      disabled={!canProceed}
                      value={formData.first_name_en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_name_en: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="last_name_en">Last Name (EN)</Label>
                    <Input
                      id="last_name_en"
                      type="text"
                      required
                      disabled={!canProceed}
                      value={formData.last_name_en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_name_en: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="birth_date">วันเกิด</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    required
                    disabled={!canProceed}
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="">
                  <Label htmlFor="employee_id">รหัสพนักงาน</Label>
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
                      disabled={
                        employeeId.length === 0 || checkingEmp || !canProceed
                      }
                      onClick={async () => {
                        if (checkingEmp) return; // ป้องกัน double click
                        setCheckingEmp(true);
                        let ignore = false;
                        try {
                          if (!user?.company_id) {
                            setCheckEmpResult("ไม่สามารถตรวจสอบได้ - ไม่พบข้อมูลบริษัท");
                            return;
                          }
                          const response = await fetch("/api/employees", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              checkEmployeeCode: true,
                              employeeId,
                              companyId: user.company_id,
                            }),
                          });
                          const result = await response.json();
                          if (!response.ok) {
                            throw new Error(result?.error || "Unknown error occurred");
                          }
                          if (!ignore) {
                            setCheckEmpResult(result.duplicate ? "ไม่สามารถใช้ได้" : "สามารถใช้ได้");
                          }
                        } catch (error) {
                          if (!ignore) {
                            console.error("Error checking employee code:", error);
                            setCheckEmpResult("เกิดข้อผิดพลาดในการตรวจสอบ");
                          }
                        } finally {
                          if (!ignore) setCheckingEmp(false);
                        }
                        return () => { ignore = true; };
                      }}
                    >
                      {checkingEmp ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
                    </Button>
                  </div>
                  {checkEmpResult && (
                    <div
                      className={
                        checkEmpResult === "สามารถใช้ได้"
                          ? "text-green-600 text-sm mt-1"
                          : "text-red-600 text-sm mt-1"
                      }
                    >
                      {checkEmpResult}
                    </div>
                  )}
                </div>
                <div className="mt-1">
                  <Label htmlFor="po_number">PO Number</Label>
                  <Select
                    id="po_number"
                    required
                    disabled={!canProceed || loadingPo}
                    value={selectedPoId}
                    onChange={(e) => setSelectedPoId(e.target.value)}
                    className="border rounded py-1 text-sm w-full"
                  >
                    <option value="">
                      {loadingPo ? "กำลังโหลด..." : "-- เลือก PO --"}
                    </option>
                    {poList.map((po) => (
                      <option key={po.po_id} value={po.po_id}>
                        {po.po_number} - {po.job_position_name || "ไม่มีตำแหน่ง"}
                      </option>
                    ))}
                  </Select>
                  {!loadingPo && poList.length === 0 && canProceed && (
                    <div className="text-red-600 text-sm mt-1">
                      ไม่พบ PO สำหรับบริษัทนี้ กรุณาติดต่อผู้ดูแลระบบ
                    </div>
                  )}
                  {loadingPo && (
                    <div className="text-blue-600 text-sm mt-1">
                      กำลังโหลดรายการ PO...
                    </div>
                  )}
                </div>

                <div className="mt-1">
                  <Label htmlFor="start_date">วันที่เริ่มงาน</Label>
                  <Input
                    id="start_date"
                    type="date"
                    required
                    disabled={!canProceed}
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    clearAll();
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="default"
                  type="submit"
                  disabled={
                    !canProceed || !isFormFilled || !isEmpIdChecked || hasError
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
