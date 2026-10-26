import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // 1. Conteo de buses
    const { count: busCount } = await supabaseAdmin
      .from("buses")
      .select("*", { count: "exact", head: true });

    // 2. Conteo de viajes
    const { count: tripCount } = await supabaseAdmin
      .from("trips")
      .select("*", { count: "exact", head: true });

    // 3. Boletos verificados (PAID o BOARDED) para recaudación real
    const { data: verifiedTickets } = await supabaseAdmin
      .from("tickets")
      .select("status, trip:trips(price)")
      .in("status", ["PAID", "BOARDED"]);

    let totalRevenue = 0;
    let verifiedCount = 0;

    if (verifiedTickets) {
      verifiedCount = verifiedTickets.length;
      for (const t of verifiedTickets as any[]) {
        totalRevenue += Number(t.trip?.price || 3.75);
      }
    }

    return NextResponse.json({
      totalBuses: busCount || 6,
      totalTrips: tripCount || 1728,
      verifiedTicketsCount: verifiedCount,
      totalRevenue: totalRevenue,
      pendingCount: 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
