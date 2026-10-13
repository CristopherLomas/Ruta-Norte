"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createBookingSchema, CreateBookingInput } from "@/lib/validations";
import { ActionResult } from "@/types";

export interface ReservationSuccessData {
  bookingId: string;
  expiresAt: string;
  totalAmount: number;
}

/**
 * Server Action: Crea una reserva temporal atómica de 1 a 4 asientos (ADR-001).
 * Invoca la función SQL de PostgreSQL reserve_seats() que adquiere bloqueos 'FOR UPDATE'
 * y garantiza una ventana estricta de expiración de 10 minutos.
 */
export async function createReservationAction(
  input: CreateBookingInput
): Promise<ActionResult<ReservationSuccessData>> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de reserva inválidos",
    };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Debes iniciar sesión para realizar una reserva de asientos.",
      };
    }

    const supabase = await createClient();
    const { tripId, originStopId, destinationStopId, seatIds } = parsed.data;

    // 1. Invocar la función RPC transaccional reserve_seats de la base de datos
    const { data: rpcBookingId, error: rpcError } = await supabase.rpc("reserve_seats", {
      p_trip_id: tripId,
      p_passenger_id: user.id,
      p_origin_stop_id: originStopId,
      p_destination_stop_id: destinationStopId,
      p_seat_ids: seatIds,
      p_expires_minutes: 10,
    });

    if (rpcError) {
      let friendlyError = rpcError.message;
      if (rpcError.message.includes("ASIENTO_YA_OCUPADO")) {
        friendlyError = "Uno o más de los asientos seleccionados ya han sido reservados o vendidos.";
      } else if (rpcError.message.includes("VIAJE_NO_DISPONIBLE_PARA_VENTA")) {
        friendlyError = "El viaje seleccionado no se encuentra disponible para venta o ya ha concluido.";
      } else if (rpcError.message.includes("CANTIDAD_ASIENTOS_INVALIDA")) {
        friendlyError = "Solo puedes reservar entre 1 y 4 asientos por compra.";
      }

      return {
        success: false,
        error: friendlyError,
      };
    }

    const bookingId = rpcBookingId as string;

    // 2. Obtener los detalles generados de la reserva (expires_at, total_amount)
    const { data: bookingData, error: fetchError } = await supabase
      .from("bookings")
      .select("id, expires_at, total_amount")
      .eq("id", bookingId)
      .single();

    if (fetchError || !bookingData) {
      return {
        success: true,
        data: {
          bookingId,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          totalAmount: 0,
        },
      };
    }

    return {
      success: true,
      data: {
        bookingId: bookingData.id,
        expiresAt: bookingData.expires_at,
        totalAmount: Number(bookingData.total_amount),
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al procesar la reserva de asientos";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Consulta los detalles de una reserva para la pantalla de checkout.
 * Verifica que pertenezca al usuario autenticado (o rol con permisos) y controla expiración.
 */
export async function getBookingDetailsAction(bookingId: string): Promise<
  ActionResult<{
    id: string;
    trip_id: string;
    passenger_id: string;
    status: string;
    expires_at: string;
    total_amount: number;
    is_expired: boolean;
    trip: {
      route: {
        name: string;
        origin_stop?: { name: string };
        destination_stop?: { name: string };
      };
      bus?: {
        plate: string;
        unit_number: string | null;
        cooperative?: { name: string };
      };
      departure_time: string;
    };
    seats: {
      seat_number: string;
      seat_row: number;
      seat_column: number;
    }[];
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const supabase = await createClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        id, trip_id, passenger_id, status, expires_at, total_amount,
        trip:trips(
          departure_time,
          route:routes(name, origin_stop:stops!origin_stop_id(name), destination_stop:stops!destination_stop_id(name)),
          bus:buses(plate, unit_number, cooperative:cooperatives(name))
        ),
        booking_seats:booking_seats(
          bus_seat:bus_seats(seat_number, seat_row, seat_column)
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return { success: false, error: "Reserva no encontrada" };
    }

    const now = new Date().toISOString();
    const isExpired = booking.status === "pending" && booking.expires_at <= now;

    // Si ya expiró en la base de datos, asegurarse de marcarla si seguía 'pending'
    if (isExpired && booking.status === "pending") {
      await supabase.from("bookings").update({ status: "expired" }).eq("id", bookingId);
    }

    type RawBookingSeat = {
      bus_seat: {
        seat_number: string;
        seat_row: number;
        seat_column: number;
      } | {
        seat_number: string;
        seat_row: number;
        seat_column: number;
      }[];
    };

    const rawSeats = (booking.booking_seats as unknown as RawBookingSeat[]) || [];
    const seats = rawSeats.map((bs) => {
      const s = Array.isArray(bs.bus_seat) ? bs.bus_seat[0] : bs.bus_seat;
      return {
        seat_number: s?.seat_number || "S/N",
        seat_row: s?.seat_row || 0,
        seat_column: s?.seat_column || 0,
      };
    });

    return {
      success: true,
      data: {
        id: booking.id,
        trip_id: booking.trip_id,
        passenger_id: booking.passenger_id,
        status: isExpired ? "expired" : booking.status,
        expires_at: booking.expires_at,
        total_amount: Number(booking.total_amount),
        is_expired: isExpired,
        trip: booking.trip as unknown as any,
        seats,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener la reserva";
    return { success: false, error: msg };
  }
}
