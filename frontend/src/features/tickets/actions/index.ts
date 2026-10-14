"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentRole } from "@/lib/auth/session";
import { ActionResult } from "@/types";

export interface TicketDetail {
  id: string;
  booking_id: string;
  bus_seat_id: string;
  passenger_id: string;
  qr_code: string;
  qr_payload: any;
  status: "issued" | "used" | "cancelled";
  issued_at: string;
  boarded_at: string | null;
  seat_number: string;
  passenger_name: string;
  departure_time: string;
  arrival_time: string;
  route_name: string;
  origin_name: string;
  destination_name: string;
  cooperative_name: string;
  unit_number: string;
  plate: string;
  fare_price: number;
}

/**
 * Server Action: Consulta un boleto individual por su ID.
 * Respeta el principio de menor privilegio (RLS / comprobación de servidor):
 * Un pasajero solo puede ver sus propios boletos; roles operativos (admin, seller, inspector)
 * pueden ver cualquier boleto para fines de gestión o validación.
 */
export async function getTicketByIdAction(ticketId: string): Promise<ActionResult<TicketDetail>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Debes iniciar sesión para consultar el boleto." };
    }

    const role = await getCurrentRole();
    const supabase = await createClient();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        id, booking_id, bus_seat_id, passenger_id, qr_code, qr_payload, status, issued_at, boarded_at,
        seat:bus_seats(seat_number),
        passenger:profiles!passenger_id(full_name),
        booking:bookings(
          total_amount,
          trip:trips(
            departure_time, arrival_time,
            route:routes(name, base_fare, origin_stop:stops!origin_stop_id(name), destination_stop:stops!destination_stop_id(name)),
            bus:buses(plate, unit_number, cooperative:cooperatives(name))
          )
        )
      `)
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return { success: false, error: "Boleto no encontrado" };
    }

    // Comprobación de seguridad en servidor: si es pasajero, debe ser el titular
    const isOwner = ticket.passenger_id === user.id;
    const isStaff = role && ["admin", "seller", "inspector", "operator"].includes(role);

    if (!isOwner && !isStaff) {
      return {
        success: false,
        error: "Acceso no autorizado: No tienes permiso para visualizar este boleto.",
      };
    }

    const t = ticket as any;
    const booking = Array.isArray(t.booking) ? t.booking[0] : t.booking;
    const trip = booking?.trip;
    const route = trip?.route;
    const bus = trip?.bus;
    const seat = Array.isArray(t.seat) ? t.seat[0] : t.seat;
    const passenger = Array.isArray(t.passenger) ? t.passenger[0] : t.passenger;

    return {
      success: true,
      data: {
        id: t.id,
        booking_id: t.booking_id,
        bus_seat_id: t.bus_seat_id,
        passenger_id: t.passenger_id,
        qr_code: t.qr_code,
        qr_payload: t.qr_payload,
        status: t.status,
        issued_at: t.issued_at,
        boarded_at: t.boarded_at,
        seat_number: seat?.seat_number || "S/N",
        passenger_name: passenger?.full_name || "Pasajero",
        departure_time: trip?.departure_time || "",
        arrival_time: trip?.arrival_time || "",
        route_name: route?.name || "Ruta Norte",
        origin_name: route?.origin_stop?.name || "Origen",
        destination_name: route?.destination_stop?.name || "Destino",
        cooperative_name: bus?.cooperative?.name || "Cooperativa Asociada",
        unit_number: bus?.unit_number || "Unidad",
        plate: bus?.plate || "S/P",
        fare_price: route?.base_fare || 2.5,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener el boleto";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Lista todos los boletos comprados por el usuario autenticado.
 */
export async function getMyTicketsAction(): Promise<ActionResult<TicketDetail[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const supabase = await createClient();
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select(`
        id, booking_id, bus_seat_id, passenger_id, qr_code, qr_payload, status, issued_at, boarded_at,
        seat:bus_seats(seat_number),
        passenger:profiles!passenger_id(full_name),
        booking:bookings(
          total_amount,
          trip:trips(
            departure_time, arrival_time,
            route:routes(name, base_fare, origin_stop:stops!origin_stop_id(name), destination_stop:stops!destination_stop_id(name)),
            bus:buses(plate, unit_number, cooperative:cooperatives(name))
          )
        )
      `)
      .eq("passenger_id", user.id)
      .order("issued_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const mapped: TicketDetail[] = (tickets || []).map((t: any) => {
      const booking = Array.isArray(t.booking) ? t.booking[0] : t.booking;
      const trip = booking?.trip;
      const route = trip?.route;
      const bus = trip?.bus;
      const seat = Array.isArray(t.seat) ? t.seat[0] : t.seat;
      const passenger = Array.isArray(t.passenger) ? t.passenger[0] : t.passenger;

      return {
        id: t.id,
        booking_id: t.booking_id,
        bus_seat_id: t.bus_seat_id,
        passenger_id: t.passenger_id,
        qr_code: t.qr_code,
        qr_payload: t.qr_payload,
        status: t.status,
        issued_at: t.issued_at,
        boarded_at: t.boarded_at,
        seat_number: seat?.seat_number || "S/N",
        passenger_name: passenger?.full_name || "Pasajero",
        departure_time: trip?.departure_time || "",
        arrival_time: trip?.arrival_time || "",
        route_name: route?.name || "Ruta Norte",
        origin_name: route?.origin_stop?.name || "Origen",
        destination_name: route?.destination_stop?.name || "Destino",
        cooperative_name: bus?.cooperative?.name || "Cooperativa Asociada",
        unit_number: bus?.unit_number || "Unidad",
        plate: bus?.plate || "S/P",
        fare_price: route?.base_fare || 2.5,
      };
    });

    return { success: true, data: mapped };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener sus boletos";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Obtiene los boletos emitidos para una reserva confirmada específica.
 */
export async function getTicketsByBookingAction(bookingId: string): Promise<ActionResult<TicketDetail[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const supabase = await createClient();
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("id")
      .eq("booking_id", bookingId);

    if (error || !tickets || tickets.length === 0) {
      return { success: true, data: [] };
    }

    const results: TicketDetail[] = [];
    for (const item of tickets) {
      const res = await getTicketByIdAction(item.id);
      if (res.success && res.data) {
        results.push(res.data);
      }
    }

    return { success: true, data: results };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener boletos de la reserva";
    return { success: false, error: msg };
  }
}
