// ตัวอย่างไฟล์: components/ChangePasswordForm.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    // สมมติว่าใช้ supabase.auth.updateUser (reset password flow)
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error("เปลี่ยนรหัสผ่านไม่สำเร็จ: " + error.message);
    } else {
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <form
      onSubmit={handleChangePassword}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-lg font-bold mb-2">เปลี่ยนรหัสผ่าน</h2>
      <div>
        <label className="block mb-1 text-sm font-medium">รหัสผ่านใหม่</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">ยืนยันรหัสผ่านใหม่</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 rounded transition"
        disabled={loading}
      >
        {loading ? "กำลังเปลี่ยนรหัสผ่าน..." : "บันทึก"}
      </button>
    </form>
  );
}