import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qrToken } = body;

    if (!qrToken) {
      return NextResponse.json({ valid: false, message: "Token QR no provisto" });
    }

    const { data: ticket, error } = await supabaseAdmin
      .from("tickets")
      .select(`
        *,
        trip:trips(
          departure_time,
          origin:cities!origin_city_id(name),
          destination:cities!destination_city_id(name)
        )
      `)
      .eq("qr_token", qrToken.trim())
      .single();

    if (error || !ticket) {
      return NextResponse.json({
        valid: false,
        message: "Boleto inexistente o token inválido.",
      });
    }

    if (ticket.status === "BOARDED") {
      return NextResponse.json({
        valid: false,
        message: "¡ALERTA! Este boleto YA FUE USADO para abordar previamente.",
        seatNumber: ticket.seat_number,
        passengerName: ticket.passenger_name,
        origin: ticket.trip?.origin?.name,
        destination: ticket.trip?.destination?.name,
        departureTime: ticket.trip?.departure_time?.slice(0, 5),
        status: "BOARDED",
      });
    }

    // Actualizar a BOARDED
    const { error: updErr } = await supabaseAdmin
      .from("tickets")
      .update({ status: "BOARDED", boarded_at: new Date().toISOString() })
      .eq("id", ticket.id);

    if (updErr) {
      return NextResponse.json({ valid: false, message: updErr.message });
    }

    return NextResponse.json({
      valid: true,
      message: "¡Boleto VÁLIDO! Abordaje registrado correctamente.",
      seatNumber: ticket.seat_number,
      passengerName: ticket.passenger_name,
      origin: ticket.trip?.origin?.name,
      destination: ticket.trip?.destination?.name,
      departureTime: ticket.trip?.departure_time?.slice(0, 5),
      status: "BOARDED",
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: err.message }, { status: 500 });
  }
}
