/**
 * Tipos para el módulo de mapas y cálculo de rutas de Ruta Norte.
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteStopWaypoint {
  id: string;
  name: string;
  sequenceOrder: number;
  latitude: number;
  longitude: number;
  isOrigin?: boolean;
  isDestination?: boolean;
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][]; // [longitude, latitude]
}

export interface DrivingCalculationResult {
  success: boolean;
  distanceKm: number;
  durationMin: number;
  durationFormatted: string;
  geometry: RouteGeometry | null;
  waypoints: RouteStopWaypoint[];
  provider: "osrm" | "openrouteservice" | "google" | "offline";
  trafficConsidered: boolean;
  error?: string;
  warnings?: string[];
}

export interface CalculateRouteOptions {
  origin: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  intermediateStops?: Array<{
    id: string;
    name: string;
    sequenceOrder: number;
    latitude: number;
    longitude: number;
  }>;
}

export interface StopCoordinateUpdateInput {
  stopId: string;
  latitude: number;
  longitude: number;
  address?: string;
}
