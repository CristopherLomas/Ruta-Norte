"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { routeSchema, RouteInput, routeStopSchema, RouteStopInput } from "@/lib/validations";
import { ActionResult, Route, Stop, RouteStop } from "@/types";

/**
 * Server Action: Listar rutas interparroquiales registradas.
 */
export async function getRoutesAction(): Promise<ActionResult<Route[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routes")
      .select("*, origin_stop:stops!origin_stop_id(*), destination_stop:stops!destination_stop_id(*)")
      .order("code", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as unknown as Route[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener las rutas";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Listar paradas y terminales disponibles.
 */
export async function getStopsAction(): Promise<ActionResult<Stop[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stops")
      .select("*, locality:localities(*)")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as unknown as Stop[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener las paradas";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Crear una nueva ruta.
 */
export async function createRouteAction(input: RouteInput): Promise<ActionResult<Route>> {
  await requireRole(["admin", "operator"]);

  const parsed = routeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de ruta inválidos",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routes")
      .insert({
        name: parsed.data.name,
        code: parsed.data.code.toUpperCase(),
        origin_stop_id: parsed.data.originStopId,
        destination_stop_id: parsed.data.destinationStopId,
        distance_km: parsed.data.distanceKm,
        duration_min: parsed.data.durationMin,
        base_fare: parsed.data.baseFare,
        is_active: parsed.data.isActive,
      })
      .select("*, origin_stop:stops!origin_stop_id(*), destination_stop:stops!destination_stop_id(*)")
      .single();

    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate key")) {
        return { success: false, error: "Ya existe una ruta registrada con este código." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as unknown as Route };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al crear la ruta";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Cambiar estado (baja lógica) de una ruta.
 */
export async function toggleRouteStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  await requireRole(["admin", "operator"]);

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("routes")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar la ruta";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Asociar una parada intermedia a la secuencia de una ruta.
 */
export async function addRouteStopAction(
  input: RouteStopInput
): Promise<ActionResult<RouteStop>> {
  await requireRole(["admin", "operator"]);

  const parsed = routeStopSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de parada intermedia inválidos",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("route_stops")
      .insert({
        route_id: parsed.data.routeId,
        stop_id: parsed.data.stopId,
        sequence_order: parsed.data.sequenceOrder,
        distance_from_origin_km: parsed.data.distanceFromOriginKm,
        time_from_origin_min: parsed.data.timeFromOriginMin,
        is_boarding_point: parsed.data.isBoardingPoint,
        is_alighting_point: parsed.data.isAlightingPoint,
      })
      .select("*, stop:stops(*)")
      .single();

    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate key")) {
        return { success: false, error: "Ya existe una parada asignada con este orden de secuencia en la ruta." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as unknown as RouteStop };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al agregar la parada intermedia";
    return { success: false, error: msg };
  }
}
