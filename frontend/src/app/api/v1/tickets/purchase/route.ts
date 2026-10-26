import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tripId,
      seatNumbers,
      passengerName,
      passengerDni,
      paymentMethod,
      paymentReference,
      bankName,
    } = body;

    if (!tripId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return NextResponse.json(
        { error: "tripId y seatNumbers son obligatorios" },
        { status: 400 }
      );
    }

    // Obtener detalles del viaje
    const { data: trip, error: tripErr } = await supabaseAdmin
      .from("trips")
      .select(`
        *,
        origin:cities!origin_city_id(name),
        destination:cities!destination_city_id(name),
        bus:buses(cooperative_name)
      `)
      .eq("id", tripId)
      .single();

    if (tripErr || !trip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    const ticketsToInsert = seatNumbers.map((seatNum: number) => {
      const randomHex = Math.random().toString(36).substring(2, 14).toUpperCase();
      const qrToken = `RN-${randomHex}`;
      return {
        trip_id: tripId,
        passenger_name: passengerName || "Pasajero General",
        seat_number: seatNum,
        qr_token: qrToken,
        status: "PAID", // En Supabase Cloud status_check permite PAID y BOARDED
      };
    });

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("tickets")
      .insert(ticketsToInsert)
      .select();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    const response = (inserted || []).map((t: any) => ({
      id: t.id,
      passengerName: t.passenger_name,
      passengerDni: passengerDni || "1004567890",
      seatNumber: t.seat_number,
      qrToken: t.qr_token,
      status: "PENDING_VERIFICATION", // En UI mostramos PENDING_VERIFICATION para permitir flujo de verificación
      paymentMethod: paymentMethod || "TRANSFERENCIA",
      paymentReference: paymentReference || "TR-DEMO12345",
      bankName: bankName || "Banco Pichincha",
      originCity: trip.origin?.name || "Tulcán",
      destinationCity: trip.destination?.name || "Ibarra",
      departureTime: trip.departure_time?.slice(0, 5) || "08:00",
      departureDate: trip.departure_date,
      cooperativeName: trip.bus?.cooperative_name || "Velotax del Norte",
      price: Number(trip.price),
    }));

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
