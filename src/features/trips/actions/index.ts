"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { tripScheduleSchema, TripScheduleInput } from "@/lib/validations";
import { ActionResult, Trip } from "@/types";

/**
 * Server Action: Listar viajes programados con detalles de ruta, bus y conductor.
 */
export async function getTripsAction(): Promise<ActionResult<Trip[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trips")
      .select("*, route:routes(*), bus:buses(*), driver:drivers(*)")
      .order("departure_time", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as unknown as Trip[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener los viajes";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Programar un nuevo viaje calendarizado con restricciones de flota y conductor.
 */
export async function scheduleTripAction(input: TripScheduleInput): Promise<ActionResult<Trip>> {
  await requireRole(["admin", "operator"]);

  const parsed = tripScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de programación de viaje inválidos",
    };
  }

  try {
    const supabase = await createClient();

    // 1. RESTRICCIÓN DE NEGOCIO OBLIGATORIA: Verificar estado del Bus
    const { data: bus, error: busError } = await supabase
      .from("buses")
      .select("id, status, is_active, total_seats")
      .eq("id", parsed.data.busId)
      .single();

    if (busError || !bus) {
      return { success: false, error: "La unidad seleccionada no existe." };
    }

    if (!bus.is_active || bus.status === "maintenance" || bus.status === "inactive") {
      return {
        success: false,
        error: `No se puede programar el viaje: La unidad seleccionada se encuentra en estado '${bus.status || "inactivo"}'.`,
      };
    }

    // 2. RESTRICCIÓN DE NEGOCIO OBLIGATORIA: Verificar estado del Conductor
    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select("id, status, is_available")
      .eq("id", parsed.data.driverId)
      .single();

    if (driverError || !driver) {
      return { success: false, error: "El conductor seleccionado no existe." };
    }

    if (!driver.is_available || driver.status === "inactive" || driver.status === "suspended") {
      return {
        success: false,
        error: `No se puede programar el viaje: El conductor seleccionado se encuentra '${driver.status || "no disponible"}'.`,
      };
    }

    // 3. Crear el viaje en estado 'scheduled' e inicializar available_seats
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .insert({
        route_id: parsed.data.routeId,
        bus_id: parsed.data.busId,
        driver_id: parsed.data.driverId,
        departure_time: parsed.data.departureTime,
        arrival_time: parsed.data.arrivalTime,
        status: "scheduled",
        available_seats: bus.total_seats,
      })
      .select("*, route:routes(*), bus:buses(*), driver:drivers(*)")
      .single();

    if (tripError) {
      return { success: false, error: tripError.message };
    }

    return { success: true, data: tripData as unknown as Trip };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al programar el viaje";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Cancelar un viaje programado por incidencia operativa.
 */
export async function cancelTripAction(
  tripId: string,
  reason: string
): Promise<ActionResult<void>> {
  await requireRole(["admin", "operator"]);

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: "Debe especificar un motivo de cancelación de al menos 5 caracteres." };
  }

  try {
    const supabase = await createClient();

    // Actualizar estado a 'cancelled'
    const { error } = await supabase
      .from("trips")
      .update({ status: "cancelled" })
      .eq("id", tripId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al cancelar el viaje";
    return { success: false, error: msg };
  }
}
