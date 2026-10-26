import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("buses")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((b: any) => ({
      id: b.id,
      cooperativeName: b.cooperative_name,
      unitNumber: b.unit_number,
      plate: b.plate,
      photoUrl: b.photo_url,
      capacity: b.capacity || 40,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from("buses")
      .insert({
        cooperative_name: body.cooperativeName,
        unit_number: body.unitNumber,
        plate: body.plate,
        photo_url: body.photoUrl,
        capacity: body.capacity || 40,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      cooperativeName: data.cooperative_name,
      unitNumber: data.unit_number,
      plate: data.plate,
      photoUrl: data.photo_url,
      capacity: data.capacity,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
