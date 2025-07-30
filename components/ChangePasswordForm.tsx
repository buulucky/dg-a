// ตัวอย่างไฟล์: components/ChangePasswordForm.tsx
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
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
      setNewPassword("");
      setConfirmPassword("");
      if (onSuccess) onSuccess(); // ปิด popup ทันที
    }
  };

  return (
    <form
      onSubmit={handleChangePassword}
      className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">เปลี่ยนรหัสผ่าน</h2>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">รหัสผ่านใหม่</label>
        <input
          type="password"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">ยืนยันรหัสผ่านใหม่</label>
        <input
          type="password"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "กำลังเปลี่ยนรหัสผ่าน..." : "บันทึก"}
      </button>
    </form>
  );
}