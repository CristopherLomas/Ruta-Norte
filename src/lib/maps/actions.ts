"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { ActionResult } from "@/types";
import {
  CalculateRouteOptions,
  DrivingCalculationResult,
  StopCoordinateUpdateInput,
} from "./types";
import { calculateDrivingRoute } from "./routing";
import { updateStopCoordinatesSchema } from "./validations";

/**
 * Server Action: Calcula el recorrido por carretera real entre origen y destino,
 * considerando las paradas intermedias de la ruta si existen.
 */
export async function getDrivingRouteAction(
  options: CalculateRouteOptions
): Promise<ActionResult<DrivingCalculationResult>> {
  try {
    const { origin, destination } = options;

    // Validación de coordenadas requeridas
    if (
      typeof origin.latitude !== "number" ||
      typeof origin.longitude !== "number" ||
      isNaN(origin.latitude) ||
      isNaN(origin.longitude)
    ) {
      return {
        success: false,
        error: `La parada de origen "${origin.name}" no tiene coordenadas geográficas configuradas.`,
      };
    }

    if (
      typeof destination.latitude !== "number" ||
      typeof destination.longitude !== "number" ||
      isNaN(destination.latitude) ||
      isNaN(destination.longitude)
    ) {
      return {
        success: false,
        error: `La parada de destino "${destination.name}" no tiene coordenadas geográficas configuradas.`,
      };
    }

    // Filtrar intermedias que tengan coordenadas válidas
    const validIntermediates = (options.intermediateStops || []).filter(
      (s) =>
        typeof s.latitude === "number" &&
        typeof s.longitude === "number" &&
        !isNaN(s.latitude) &&
        !isNaN(s.longitude)
    );

    const calculation = await calculateDrivingRoute({
      origin,
      destination,
      intermediateStops: validIntermediates,
    });

    if (!calculation.success) {
      return {
        success: false,
        error: calculation.error || "No fue posible calcular el trayecto vial por carretera.",
      };
    }

    return { success: true, data: calculation };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error inesperado al calcular la ruta";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Obtiene el recorrido completo de una ruta registrada en el sistema
 * consultando automáticamente su origen, destino y paradas intermedias (`route_stops`).
 */
export async function getRouteDetailedGeometryAction(
  routeId: string
): Promise<ActionResult<DrivingCalculationResult>> {
  try {
    const supabase = await createClient();

    // 1. Consultar ruta y paradas cabecera
    const { data: route, error: routeError } = await supabase
      .from("routes")
      .select("*, origin_stop:stops!origin_stop_id(*), destination_stop:stops!destination_stop_id(*)")
      .eq("id", routeId)
      .single();

    if (routeError || !route) {
      return { success: false, error: "Ruta no encontrada" };
    }

    // 2. Consultar paradas intermedias ordenadas
    const { data: routeStops } = await supabase
      .from("route_stops")
      .select("*, stop:stops(*)")
      .eq("route_id", routeId)
      .order("sequence_order", { ascending: true });

    const originStop = route.origin_stop;
    const destStop = route.destination_stop;

    if (!originStop?.latitude || !originStop?.longitude) {
      return {
        success: false,
        error: `La parada de origen "${originStop?.name || "Origen"}" requiere configuración de coordenadas.`,
      };
    }

    if (!destStop?.latitude || !destStop?.longitude) {
      return {
        success: false,
        error: `La parada de destino "${destStop?.name || "Destino"}" requiere configuración de coordenadas.`,
      };
    }

    const intermediateStops = (routeStops || [])
      .filter((rs) => rs.stop && rs.stop.latitude && rs.stop.longitude)
      .map((rs) => ({
        id: rs.stop.id,
        name: rs.stop.name,
        sequenceOrder: rs.sequence_order,
        latitude: rs.stop.latitude,
        longitude: rs.stop.longitude,
      }));

    return await getDrivingRouteAction({
      origin: {
        id: originStop.id,
        name: originStop.name,
        latitude: originStop.latitude,
        longitude: originStop.longitude,
      },
      destination: {
        id: destStop.id,
        name: destStop.name,
        latitude: destStop.latitude,
        longitude: destStop.longitude,
      },
      intermediateStops,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener recorrido de la ruta";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Actualiza las coordenadas geográficas (lat/lng) de una parada.
 * Restringido a usuarios con rol 'admin' u 'operator'.
 */
export async function updateStopCoordinatesAction(
  input: StopCoordinateUpdateInput
): Promise<ActionResult<{ stopId: string; latitude: number; longitude: number }>> {
  await requireRole(["admin", "operator"]);

  const parsed = updateStopCoordinatesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Coordenadas geográficas inválidas",
    };
  }

  try {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    };
    if (parsed.data.address) {
      updateData.address = parsed.data.address;
    }

    const { error } = await supabase
      .from("stops")
      .update(updateData)
      .eq("id", parsed.data.stopId);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        stopId: parsed.data.stopId,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al guardar coordenadas de la parada";
    return { success: false, error: msg };
  }
}
