"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { validateTicketSchema } from "@/lib/validations";
import { ActionResult } from "@/types";

export interface BoardingValidationResult {
  valid: boolean;
  code: string;
  message: string;
  seat_number?: string;
  passenger_name?: string;
  destination_name?: string;
  route_name?: string;
  boarded_at?: string;
  trip_id?: string;
}

/**
 * Server Action: Valida el embarque de un boleto (ADR-002).
 * Exclusivo para roles 'inspector' y 'admin'.
 * Invoca la función SQL transaccional `validate_ticket_qr()`, previniendo
 * doble embarque de forma atómica y registrando al inspector y fecha de abordaje.
 */
export async function validateBoardingAction(
  token: string,
  tripId?: string
): Promise<ActionResult<BoardingValidationResult>> {
  // 1. Verificación estricta de permisos de rol (ADR-002)
  const { user } = await requireRole(["admin", "inspector"]);

  const cleanToken = token.trim();
  if (!cleanToken) {
    return {
      success: false,
      error: "Debe ingresar o escanear un código QR válido",
    };
  }

  try {
    const supabase = await createClient();

    // 2. Si no se especificó un tripId, obtener el viaje asociado directamente al boleto
    let targetTripId = tripId;
    if (!targetTripId) {
      const { data: ticketRef, error: refError } = await supabase
        .from("tickets")
        .select("qr_payload")
        .eq("qr_code", cleanToken)
        .maybeSingle();

      if (refError || !ticketRef || !ticketRef.qr_payload?.trip_id) {
        return {
          success: true,
          data: {
            valid: false,
            code: "BOLETO_NO_ENCONTRADO",
            message: "El código QR no corresponde a ningún boleto registrado.",
          },
        };
      }
      targetTripId = ticketRef.qr_payload.trip_id;
    }

    // 3. Obtener el estado del viaje para verificar que esté en despacho operativo ('scheduled' o 'boarding')
    const { data: tripData } = await supabase
      .from("trips")
      .select("id, status, route:routes(name, destination_stop:stops!destination_stop_id(name))")
      .eq("id", targetTripId)
      .single();

    if (!tripData) {
      return {
        success: true,
        data: {
          valid: false,
          code: "VIAJE_NO_ENCONTRADO",
          message: "El viaje asociado al boleto no existe.",
        },
      };
    }

    if (tripData.status !== "boarding" && tripData.status !== "scheduled") {
      return {
        success: true,
        data: {
          valid: false,
          code: "VIAJE_NO_DISPONIBLE",
          message: `El viaje no está en proceso de embarque (Estado actual: '${tripData.status}').`,
        },
      };
    }

    // 4. Invocar la función RPC transaccional validate_ticket_qr de PostgreSQL
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "validate_ticket_qr",
      {
        p_qr_code: cleanToken,
        p_trip_id: targetTripId,
        p_inspector_id: user.id,
      }
    );

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    const res = rpcResult as any;

    // 5. Enriquecer el resultado con datos del pasajero y destino para la UI del inspector
    let passengerName = "Pasajero Registrado";
    let seatNumber = res.seat_number || "S/N";
    const route = tripData.route as any;
    const destinationName = route?.destination_stop?.name || "Destino";
    const routeName = route?.name || "Ruta";

    if (res.valid) {
      const { data: ticketDetails } = await supabase
        .from("tickets")
        .select("passenger:profiles!passenger_id(full_name), seat:bus_seats(seat_number)")
        .eq("qr_code", cleanToken)
        .maybeSingle();

      if (ticketDetails) {
        const pass = Array.isArray(ticketDetails.passenger) ? ticketDetails.passenger[0] : ticketDetails.passenger;
        const s = Array.isArray(ticketDetails.seat) ? ticketDetails.seat[0] : ticketDetails.seat;
        if (pass?.full_name) passengerName = pass.full_name;
        if (s?.seat_number) seatNumber = s.seat_number;
      }
    }

    return {
      success: true,
      data: {
        valid: Boolean(res.valid),
        code: res.code || (res.valid ? "EMBARQUE_EXITOSO" : "ERROR"),
        message: res.message || "",
        seat_number: seatNumber,
        passenger_name: passengerName,
        destination_name: destinationName,
        route_name: routeName,
        boarded_at: res.boarded_at || new Date().toISOString(),
        trip_id: targetTripId,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al validar el boleto";
    return { success: false, error: msg };
  }
}
