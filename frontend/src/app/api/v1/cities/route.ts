import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("cities")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mapear con camelCase para compatibilidad
    const formatted = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      province: c.province,
      terminalName: c.terminal_name,
      imageUrl: c.image_url,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
