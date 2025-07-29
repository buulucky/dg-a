"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton({ label = "ออกจากระบบ" }: { label?: string }) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-2 rounded"
    >
      {label}
    </button>
  );
}
