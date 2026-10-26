import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const action = body.action || "APPROVE"; // 'APPROVE' -> PAID, 'REJECT' -> REJECTED

    const newStatus = action === "APPROVE" ? "PAID" : "REJECTED";

    if (newStatus === "REJECTED") {
      // Si se rechaza, podemos eliminar el boleto para liberar el asiento
      await supabaseAdmin.from("tickets").delete().eq("id", params.id);
      return NextResponse.json({
        id: params.id,
        status: "REJECTED",
        message: "Pago rechazado. Asiento liberado exitosamente.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("tickets")
      .update({ status: "PAID" })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: params.id,
      status: "PAID",
      message: "Pago aprobado. Boleto y código QR activados para abordar.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
