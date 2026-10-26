import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const originId = searchParams.get("originId");
    const destinationId = searchParams.get("destinationId");
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");

    if (!originId || !destinationId) {
      return NextResponse.json(
        { error: "originId y destinationId son requeridos" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("trips")
      .select(`
        *,
        origin:cities!origin_city_id(*),
        destination:cities!destination_city_id(*),
        bus:buses(*)
      `)
      .eq("origin_city_id", Number(originId))
      .eq("destination_city_id", Number(destinationId));

    if (date) {
      query = query.eq("departure_date", date);
    }
    if (shift && shift !== "ALL") {
      query = query.eq("shift", shift);
    }

    query = query.order("departure_time", { ascending: true });

    const { data: trips, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Para cada viaje, obtener conteo de asientos ocupados
    const tripIds = (trips || []).map((t: any) => t.id);
    let occupiedMap: Record<string, number> = {};

    if (tripIds.length > 0) {
      const { data: tickets } = await supabaseAdmin
        .from("tickets")
        .select("trip_id, seat_number, status")
        .in("trip_id", tripIds)
        .in("status", ["PAID", "BOARDED", "PENDING_VERIFICATION"]);

      if (tickets) {
        for (const t of tickets) {
          occupiedMap[t.trip_id] = (occupiedMap[t.trip_id] || 0) + 1;
        }
      }
    }

    const formatted = (trips || []).map((t: any) => {
      const totalSeats = t.bus?.capacity || 40;
      const occupied = occupiedMap[t.id] || 0;
      return {
        id: t.id,
        originCityId: t.origin_city_id,
        originCityName: t.origin?.name || "Origen",
        originTerminal: t.origin?.terminal_name || "Terminal",
        destinationCityId: t.destination_city_id,
        destinationCityName: t.destination?.name || "Destino",
        destinationTerminal: t.destination?.terminal_name || "Terminal",
        busId: t.bus_id,
        cooperativeName: t.bus?.cooperative_name || "Cooperativa Norte",
        unitNumber: t.bus?.unit_number || "Unidad",
        plate: t.bus?.plate || "CAA-0000",
        photoUrl: t.bus?.photo_url || "/images/cities/tulcan.jpg",
        departureDate: t.departure_date,
        departureTime: t.departure_time?.slice(0, 5) || "08:00",
        shift: t.shift,
        price: Number(t.price),
        totalSeats,
        occupiedSeats: occupied,
        availableSeats: Math.max(0, totalSeats - occupied),
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from("trips")
      .insert({
        origin_city_id: body.originCityId || body.originId,
        destination_city_id: body.destinationCityId || body.destinationId,
        bus_id: body.busId,
        departure_date: body.departureDate,
        departure_time: body.departureTime,
        shift: body.shift || "MORNING",
        price: body.price,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
