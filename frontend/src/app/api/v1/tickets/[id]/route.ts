import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ticket, error } = await supabaseAdmin
      .from("tickets")
      .select(`
        *,
        trip:trips(
          departure_time,
          departure_date,
          price,
          origin:cities!origin_city_id(name),
          destination:cities!destination_city_id(name),
          bus:buses(cooperative_name)
        )
      `)
      .eq("id", params.id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: "Boleto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: ticket.id,
      passengerName: ticket.passenger_name,
      seatNumber: ticket.seat_number,
      qrToken: ticket.qr_token,
      status: ticket.status,
      originCity: ticket.trip?.origin?.name || "Tulcán",
      destinationCity: ticket.trip?.destination?.name || "Ibarra",
      departureTime: ticket.trip?.departure_time?.slice(0, 5) || "08:00",
      departureDate: ticket.trip?.departure_date || "Hoy",
      cooperativeName: ticket.trip?.bus?.cooperative_name || "Velotax del Norte",
      price: Number(ticket.trip?.price || 3.75),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
