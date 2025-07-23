import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const [user, setUser] = useState<{ role: string; status: string; company_id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    
    async function getUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (authUser) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role, status, company_id")
            .eq("id", authUser.id)
            .single();
          
          if (isMounted) {
            setUser(profile); // profile จะมี company_id ด้วย
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    getUser();
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        getUser();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // ไม่ต้องทำอะไร เพราะ user ยังคงเหมือนเดิม
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}