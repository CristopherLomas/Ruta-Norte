import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;

    const { data: tickets, error } = await supabaseAdmin
      .from("tickets")
      .select("seat_number, status")
      .eq("trip_id", tripId)
      .in("status", ["PAID", "BOARDED", "PENDING_VERIFICATION"]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const occupiedSet = new Set((tickets || []).map((t: any) => t.seat_number));

    const seats = Array.from({ length: 40 }, (_, idx) => {
      const seatNumber = idx + 1;
      return {
        seatNumber,
        status: occupiedSet.has(seatNumber) ? "OCCUPIED" : "AVAILABLE",
      };
    });

    return NextResponse.json(seats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
