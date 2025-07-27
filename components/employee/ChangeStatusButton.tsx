import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateEmployeeContractStatus } from "@/app/employee/actions.contract-status";
import { toast } from "@/lib/toast";

interface ChangeStatusButtonProps {
  employeeId: string;
  onStatusChange?: (status: string, reason: string, date: string) => void;
}

const statusOptions = [
  { value: "2", label: "ลาออก" },
  { value: "3", label: "เลิกจ้าง" },
  { value: "5", label: "เกษียณอายุ" },
];

export default function ChangeStatusButton({ employeeId, onStatusChange }: ChangeStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const handleOpen = () => {
    setShowModal(true);
    setStatus("");
    setReason("");
    setDate(new Date().toISOString().slice(0, 10));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!status) {
      setError("กรุณาเลือกสถานะใหม่");
      return;
    }
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผลการเปลี่ยนสถานะ");
      return;
    }
    if (!date) {
      setError("กรุณาเลือกวันที่เปลี่ยนสถานะ");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // เรียก server action เพื่ออัปเดต employee_contracts
      const result = await updateEmployeeContractStatus({
        employeeId,
        statusId: status,
        reason,
        date,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setShowModal(false);
      toast.success("เปลี่ยนสถานะพนักงานสำเร็จ");
      if (onStatusChange) onStatusChange(status, reason, date);
    } catch (e) {
      const errorMessage = (e instanceof Error && e.message) ? e.message : "เกิดข้อผิดพลาด";
      setError(errorMessage);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="edit"
        onClick={handleOpen}
        disabled={loading || success}
      >
        เปลี่ยนสถานะ
      </Button>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

      {/* Modal สำหรับเปลี่ยนสถานะ */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">เปลี่ยนสถานะพนักงาน</h2>
            <label className="block mb-2 font-medium">เลือกสถานะใหม่</label>
            <select
              className="w-full border rounded p-2 mb-4"
              value={status}
              onChange={e => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="">-- เลือกสถานะ --</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label className="block mb-2 font-medium">เหตุผล</label>
            <textarea
              className="w-full border rounded p-2 mb-2"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="เหตุผล..."
              disabled={loading}
            />
            <label className="block mb-2 font-medium">วันที่</label>
            <input
              type="date"
              className="w-full border rounded p-2 mb-2"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={loading}
              max={new Date().toISOString().slice(0, 10)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => { setShowModal(false); setStatus(""); setReason(""); setError(null); setDate(new Date().toISOString().slice(0, 10)); }}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={loading}
              >
                ยืนยัน
              </Button>
            </div>
            {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
