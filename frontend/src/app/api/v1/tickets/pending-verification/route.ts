import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // Obtener boletos con sus viajes
    const { data: tickets, error } = await supabaseAdmin
      .from("tickets")
      .select(`
        *,
        trip:trips(
          departure_time,
          departure_date,
          price,
          origin:cities!origin_city_id(name),
          destination:cities!destination_city_id(name),
          bus:buses(cooperative_name, unit_number)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (tickets || []).map((t: any) => ({
      id: t.id,
      passengerName: t.passenger_name,
      passengerDni: "1004567890",
      seatNumber: t.seat_number,
      qrToken: t.qr_token,
      status: t.status,
      paymentMethod: "TRANSFERENCIA",
      paymentReference: "TR-" + t.qr_token.replace("RN-", "").slice(0, 8),
      bankName: "Banco Pichincha",
      originCity: t.trip?.origin?.name || "Tulcán",
      destinationCity: t.trip?.destination?.name || "Ibarra",
      departureTime: t.trip?.departure_time?.slice(0, 5) || "08:00",
      departureDate: t.trip?.departure_date || "Hoy",
      cooperativeName: t.trip?.bus?.cooperative_name || "Velotax del Norte",
      unitNumber: t.trip?.bus?.unit_number || "Disco 12",
      price: Number(t.trip?.price || 3.75),
      createdAt: t.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
