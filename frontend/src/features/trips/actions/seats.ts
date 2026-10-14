"use server";

import { createClient } from "@/lib/supabase/server";
import { BusSeat } from "@/types";

export interface TripSeatAvailability extends BusSeat {
  status: "free" | "reserved" | "sold";
}

/**
 * Server Action: Obtiene el estado en tiempo real de todos los asientos de un viaje.
 * Cruza la tabla bus_seats del bus asignado con bookings y booking_seats del viaje.
 */
export async function getTripSeatsAction(tripId: string): Promise<{
  success: boolean;
  data?: TripSeatAvailability[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Obtener el viaje para saber qué bus tiene asignado
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, bus_id, status")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return { success: false, error: "Viaje no encontrado" };
    }

    // 2. Obtener todos los asientos físicos del bus
    const { data: busSeats, error: busSeatsError } = await supabase
      .from("bus_seats")
      .select("*")
      .eq("bus_id", trip.bus_id)
      .eq("is_active", true)
      .order("seat_row", { ascending: true })
      .order("seat_column", { ascending: true });

    if (busSeatsError || !busSeats) {
      return { success: false, error: "Error al obtener los asientos del bus" };
    }

    // 3. Consultar reservas activas y asientos vendidos para este viaje
    // (Excluye reservas expiradas o canceladas)
    const { data: occupiedSeats, error: occupiedError } = await supabase
      .from("booking_seats")
      .select("bus_seat_id, status, booking:bookings!booking_id(status, expires_at)")
      .eq("booking.trip_id", tripId);

    const now = new Date().toISOString();
    const occupiedMap = new Map<string, "reserved" | "sold">();

    if (!occupiedError && occupiedSeats) {
      for (const item of occupiedSeats) {
        const booking = Array.isArray(item.booking) ? item.booking[0] : item.booking;
        if (!booking) continue;

        if (item.status === "sold" || booking.status === "confirmed") {
          occupiedMap.set(item.bus_seat_id, "sold");
        } else if (
          item.status === "reserved" &&
          booking.status === "pending" &&
          booking.expires_at > now
        ) {
          occupiedMap.set(item.bus_seat_id, "reserved");
        }
      }
    }

    // 4. Mapear cada asiento físico con su estado calculado
    const availability: TripSeatAvailability[] = busSeats.map((seat) => {
      const state = occupiedMap.get(seat.id) || "free";
      return {
        ...seat,
        status: state,
      };
    });

    return { success: true, data: availability };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener la disponibilidad de asientos";
    return { success: false, error: msg };
  }
}
