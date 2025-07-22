import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const [user, setUser] = useState<{ role: string; status: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, status")
          .eq("id", authUser.id)
          .single();
        if (isMounted) setUser(profile);
      } else {
        if (isMounted) setUser(null);
      }
    }
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return user;
}