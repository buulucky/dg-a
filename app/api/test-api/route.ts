import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const API_KEY = process.env.MY_API_KEY!;
const ALLOWED_ORIGINS = ["https://dg-a.vercel.app", "http://localhost:3000"]; // 👈 เพิ่ม origin ที่อนุญาตได้

export async function GET(req: Request) {
  try {
    const origin = req.headers.get("origin");
    const key = req.headers.get("x-api-key");

    console.log("🔐 Header API key:", key);
    console.log("🌐 Request origin:", origin);

    // ✅ ตรวจสอบ origin (เลือกใช้หรือไม่ก็ได้)
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    // ✅ ตรวจสอบ API key
    if (!key || key !== API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ สร้าง Supabase client (ใช้ Service Role Key สำหรับ bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("view_employee_contracts_relationship")
      .select("*");

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data?.length || 0 });

  } catch (err) {
    console.error("🔥 API Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
