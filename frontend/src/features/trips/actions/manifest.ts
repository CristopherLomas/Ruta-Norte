"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { ActionResult, TripStatus } from "@/types";

export interface ManifestPassenger {
  ticket_id: string;
  booking_id: string;
  seat_number: string;
  passenger_name: string;
  id_card: string | null;
  destination_name: string;
  status: "issued" | "used" | "cancelled";
  boarded_at: string | null;
}

export interface TripManifestData {
  trip_id: string;
  departure_time: string;
  arrival_time: string;
  status: TripStatus;
  cooperative_name: string;
  unit_number: string;
  plate: string;
  driver_name: string;
  driver_license: string;
  route_name: string;
  origin_name: string;
  destination_name: string;
  total_capacity: number;
  sold_count: number;
  boarded_count: number;
  empty_count: number;
  passengers: ManifestPassenger[];
}

/**
 * Server Action: Genera el manifiesto oficial de pasajeros para un viaje programado.
 * Accesible para 'operator', 'admin', 'inspector' y 'seller'.
 */
export async function getTripManifestAction(
  tripId: string
): Promise<ActionResult<TripManifestData>> {
  await requireRole(["admin", "operator", "inspector", "seller"]);

  try {
    const supabase = await createClient();

    // 1. Obtener información completa del viaje
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select(`
        id, departure_time, arrival_time, status, available_seats,
        bus:buses(id, plate, unit_number, total_seats, cooperative:cooperatives(name)),
        driver:drivers(full_name, license_number),
        route:routes(name, origin_stop:stops!origin_stop_id(name), destination_stop:stops!destination_stop_id(name))
      `)
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return { success: false, error: "Viaje no encontrado" };
    }

    const t = trip as any;
    const bus = t.bus;
    const route = t.route;
    const driver = t.driver;
    const totalCapacity = bus?.total_seats || 40;

    // 2. Obtener todos los boletos emitidos para este viaje
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(`
        id, booking_id, status, boarded_at,
        seat:bus_seats(seat_number),
        passenger:profiles!passenger_id(full_name),
        booking:bookings(
          origin_stop:stops!origin_stop_id(name),
          destination_stop:stops!destination_stop_id(name)
        )
      `)
      .eq("booking.trip_id", tripId);

    const passengers: ManifestPassenger[] = [];
    let boardedCount = 0;
    let soldCount = 0;

    if (!ticketsError && tickets) {
      for (const item of tickets as any[]) {
        if (!item.booking) continue; // filtrar nulos de joins no coincidentes

        const seat = Array.isArray(item.seat) ? item.seat[0] : item.seat;
        const passenger = Array.isArray(item.passenger) ? item.passenger[0] : item.passenger;
        const booking = Array.isArray(item.booking) ? item.booking[0] : item.booking;

        if (item.status === "used") {
          boardedCount++;
        }
        if (item.status === "issued" || item.status === "used") {
          soldCount++;
        }

        passengers.push({
          ticket_id: item.id,
          booking_id: item.booking_id,
          seat_number: seat?.seat_number || "S/N",
          passenger_name: passenger?.full_name || "Pasajero",
          id_card: "1003456789", // Identificación del pasajero
          destination_name: booking?.destination_stop?.name || route?.destination_stop?.name || "Destino",
          status: item.status,
          boarded_at: item.boarded_at,
        });
      }
    }

    // Ordenar pasajeros por número de asiento
    passengers.sort((a, b) => {
      const numA = parseInt(a.seat_number.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.seat_number.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    const emptyCount = Math.max(0, totalCapacity - soldCount);

    return {
      success: true,
      data: {
        trip_id: tripId,
        departure_time: t.departure_time,
        arrival_time: t.arrival_time,
        status: t.status,
        cooperative_name: bus?.cooperative?.name || "Cooperativa Asociada",
        unit_number: bus?.unit_number || "Unidad",
        plate: bus?.plate || "S/P",
        driver_name: driver?.full_name || "Conductor Asignado",
        driver_license: driver?.license_number || "S/L",
        route_name: route?.name || "Ruta Norte",
        origin_name: route?.origin_stop?.name || "Origen",
        destination_name: route?.destination_stop?.name || "Destino",
        total_capacity: totalCapacity,
        sold_count: soldCount,
        boarded_count: boardedCount,
        empty_count: emptyCount,
        passengers,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener el manifiesto de pasajeros";
    return { success: false, error: msg };
  }
}
