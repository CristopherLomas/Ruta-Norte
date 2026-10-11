"use server";

import { createClient } from "@/lib/supabase/server";
import { searchTripsSchema, SearchTripsInput } from "@/lib/validations";
import { ActionResult, Trip, Stop, Route } from "@/types";

export interface TripSearchResult extends Trip {
  route: Route & {
    origin_stop: Stop;
    destination_stop: Stop;
  };
  fare_price: number;
}

/**
 * Server Action: Búsqueda pública de viajes activos por origen, destino y fecha.
 * Filtra únicamente viajes programados ('scheduled' o 'boarding') con asientos disponibles.
 */
export async function searchTripsAction(
  input: SearchTripsInput
): Promise<ActionResult<TripSearchResult[]>> {
  const parsed = searchTripsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Criterios de búsqueda inválidos",
    };
  }

  try {
    const supabase = await createClient();
    const { originStopId, destinationStopId, departureDate } = parsed.data;

    // Rango de fecha en ISO (inicio y fin del día en hora local/UTC)
    const startOfDay = `${departureDate}T00:00:00.000Z`;
    const endOfDay = `${departureDate}T23:59:59.999Z`;

    // 1. Identificar rutas que coincidan con origen y destino
    const { data: routes, error: routeError } = await supabase
      .from("routes")
      .select("id, name, code, origin_stop_id, destination_stop_id, distance_km, duration_min, base_fare, is_active, origin_stop:stops!origin_stop_id(*), destination_stop:stops!destination_stop_id(*)")
      .eq("origin_stop_id", originStopId)
      .eq("destination_stop_id", destinationStopId)
      .eq("is_active", true);

    if (routeError) {
      return { success: false, error: routeError.message };
    }

    if (!routes || routes.length === 0) {
      return { success: true, data: [] };
    }

    const routeIds = routes.map((r) => r.id);

    // 2. Consultar viajes disponibles para las rutas identificadas en la fecha indicada
    const { data: trips, error: tripsError } = await supabase
      .from("trips")
      .select("*, bus:buses(*, cooperative:cooperatives(*)), driver:drivers(*)")
      .in("route_id", routeIds)
      .in("status", ["scheduled", "boarding"])
      .gte("departure_time", startOfDay)
      .lte("departure_time", endOfDay)
      .order("departure_time", { ascending: true });

    if (tripsError) {
      return { success: false, error: tripsError.message };
    }

    // 3. Mapear resultados agregando la información de la ruta y tarifa
    const results: TripSearchResult[] = (trips || []).map((t) => {
      const route = routes.find((r) => r.id === t.route_id);
      const farePrice = route?.base_fare ?? 2.5;

      return {
        ...t,
        route: route as unknown as TripSearchResult["route"],
        fare_price: farePrice,
      };
    });

    return { success: true, data: results };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al buscar viajes disponibles";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Obtiene los detalles de un viaje específico con su ruta, bus y cooperativa.
 */
export async function getTripDetailsAction(tripId: string): Promise<ActionResult<TripSearchResult>> {
  try {
    const supabase = await createClient();
    const { data: trip, error } = await supabase
      .from("trips")
      .select("*, route:routes(*, origin_stop:stops!origin_stop_id(*), destination_stop:stops!destination_stop_id(*)), bus:buses(*, cooperative:cooperatives(*)), driver:drivers(*)")
      .eq("id", tripId)
      .single();

    if (error || !trip) {
      return { success: false, error: "Viaje no encontrado" };
    }

    const farePrice = trip.route?.base_fare ?? 2.5;
    return {
      success: true,
      data: {
        ...trip,
        fare_price: farePrice,
      } as TripSearchResult,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener el viaje";
    return { success: false, error: msg };
  }
}
