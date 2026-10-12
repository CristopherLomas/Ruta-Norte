import { CalculateRouteOptions, DrivingCalculationResult, RouteStopWaypoint } from "./types";

/**
 * Interfaz desacoplada para proveedores de cálculo de rutas viales.
 */
export interface RoutingProvider {
  name: "osrm" | "openrouteservice" | "google";
  calculateRoute(options: CalculateRouteOptions): Promise<DrivingCalculationResult>;
}

/**
 * Formatea minutos a formato legible "X h Y min" o "Y min".
 */
export function formatDurationHoursMinutes(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Proveedor OSRM (Open Source Routing Machine) basado en OpenStreetMap.
 * Calcula rutas sobre la red vial real sin requerir API key para uso estándar,
 * o usando un servidor OSRM propio configurado mediante OSRM_SERVER_URL.
 */
export class OSRMRoutingProvider implements RoutingProvider {
  name = "osrm" as const;
  private baseUrl: string;

  constructor(customUrl?: string) {
    this.baseUrl = customUrl || process.env.OSRM_SERVER_URL || "https://router.project-osrm.org";
  }

  async calculateRoute(options: CalculateRouteOptions): Promise<DrivingCalculationResult> {
    const { origin, destination, intermediateStops = [] } = options;

    // Ordenar paradas intermedias por sequenceOrder
    const sortedIntermediates = [...intermediateStops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    // Lista de waypoints ordenada
    const allWaypoints: RouteStopWaypoint[] = [
      {
        id: origin.id,
        name: origin.name,
        sequenceOrder: 0,
        latitude: origin.latitude,
        longitude: origin.longitude,
        isOrigin: true,
      },
      ...sortedIntermediates.map((s) => ({
        id: s.id,
        name: s.name,
        sequenceOrder: s.sequenceOrder,
        latitude: s.latitude,
        longitude: s.longitude,
      })),
      {
        id: destination.id,
        name: destination.name,
        sequenceOrder: 9999,
        latitude: destination.latitude,
        longitude: destination.longitude,
        isDestination: true,
      },
    ];

    // OSRM espera coordenadas en formato: lon,lat;lon,lat;...
    const coordsQuery = allWaypoints.map((w) => `${w.longitude.toFixed(6)},${w.latitude.toFixed(6)}`).join(";");
    const endpoint = `${this.baseUrl}/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson&steps=false`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(endpoint, {
        headers: {
          "User-Agent": "RutaNorte-TransportSystem/1.0",
          Accept: "application/json",
        },
        signal: controller.signal,
        next: { revalidate: 3600 }, // Caché por 1 hora en Next.js
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          success: false,
          distanceKm: 0,
          durationMin: 0,
          durationFormatted: "",
          geometry: null,
          waypoints: allWaypoints,
          provider: "osrm",
          trafficConsidered: false,
          error: `El servicio de cálculo vial OSRM respondió con error HTTP ${res.status}.`,
        };
      }

      const data = await res.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        return {
          success: false,
          distanceKm: 0,
          durationMin: 0,
          durationFormatted: "",
          geometry: null,
          waypoints: allWaypoints,
          provider: "osrm",
          trafficConsidered: false,
          error: data.message || "No se encontró una ruta vial continua entre las paradas seleccionadas.",
        };
      }

      const primaryRoute = data.routes[0];
      const distanceKm = Number((primaryRoute.distance / 1000).toFixed(1));
      const durationMin = Math.round(primaryRoute.duration / 60);

      return {
        success: true,
        distanceKm,
        durationMin,
        durationFormatted: formatDurationHoursMinutes(durationMin),
        geometry: primaryRoute.geometry,
        waypoints: allWaypoints,
        provider: "osrm",
        trafficConsidered: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el proveedor de rutas";
      return {
        success: false,
        distanceKm: 0,
        durationMin: 0,
        durationFormatted: "",
        geometry: null,
        waypoints: allWaypoints,
        provider: "osrm",
        trafficConsidered: false,
        error: `Fallo al calcular la ruta en carreteras: ${msg}`,
      };
    }
  }
}

/**
 * Proveedor OpenRouteService (ORS). Requiere clave OPENROUTESERVICE_API_KEY.
 */
export class OpenRouteServiceProvider implements RoutingProvider {
  name = "openrouteservice" as const;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTESERVICE_API_KEY;
  }

  async calculateRoute(options: CalculateRouteOptions): Promise<DrivingCalculationResult> {
    const { origin, destination, intermediateStops = [] } = options;

    if (!this.apiKey) {
      return {
        success: false,
        distanceKm: 0,
        durationMin: 0,
        durationFormatted: "",
        geometry: null,
        waypoints: [],
        provider: "openrouteservice",
        trafficConsidered: false,
        error: "OPENROUTESERVICE_API_KEY no está configurada en el entorno.",
      };
    }

    const sortedIntermediates = [...intermediateStops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const coordinates = [
      [origin.longitude, origin.latitude],
      ...sortedIntermediates.map((s) => [s.longitude, s.latitude]),
      [destination.longitude, destination.latitude],
    ];

    try {
      const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coordinates }),
      });

      if (!res.ok) {
        return {
          success: false,
          distanceKm: 0,
          durationMin: 0,
          durationFormatted: "",
          geometry: null,
          waypoints: [],
          provider: "openrouteservice",
          trafficConsidered: false,
          error: `Error de OpenRouteService: ${res.statusText}`,
        };
      }

      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature) {
        return {
          success: false,
          distanceKm: 0,
          durationMin: 0,
          durationFormatted: "",
          geometry: null,
          waypoints: [],
          provider: "openrouteservice",
          trafficConsidered: false,
          error: "Respuesta de ruta vacía de OpenRouteService.",
        };
      }

      const distanceKm = Number((feature.properties.summary.distance / 1000).toFixed(1));
      const durationMin = Math.round(feature.properties.summary.duration / 60);

      return {
        success: true,
        distanceKm,
        durationMin,
        durationFormatted: formatDurationHoursMinutes(durationMin),
        geometry: feature.geometry,
        waypoints: [
          { id: origin.id, name: origin.name, sequenceOrder: 0, latitude: origin.latitude, longitude: origin.longitude, isOrigin: true },
          ...sortedIntermediates.map((s) => ({ id: s.id, name: s.name, sequenceOrder: s.sequenceOrder, latitude: s.latitude, longitude: s.longitude })),
          { id: destination.id, name: destination.name, sequenceOrder: 9999, latitude: destination.latitude, longitude: destination.longitude, isDestination: true },
        ],
        provider: "openrouteservice",
        trafficConsidered: false,
      };
    } catch (err: unknown) {
      return {
        success: false,
        distanceKm: 0,
        durationMin: 0,
        durationFormatted: "",
        geometry: null,
        waypoints: [],
        provider: "openrouteservice",
        trafficConsidered: false,
        error: err instanceof Error ? err.message : "Error al conectar con OpenRouteService",
      };
    }
  }
}

/**
 * Proveedor Google Routes API. Requiere GOOGLE_MAPS_API_KEY.
 */
export class GoogleRoutesProvider implements RoutingProvider {
  name = "google" as const;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY;
  }

  async calculateRoute(options: CalculateRouteOptions): Promise<DrivingCalculationResult> {
    const { origin, destination, intermediateStops = [] } = options;

    if (!this.apiKey) {
      return {
        success: false,
        distanceKm: 0,
        durationMin: 0,
        durationFormatted: "",
        geometry: null,
        waypoints: [],
        provider: "google",
        trafficConsidered: false,
        error: "GOOGLE_MAPS_API_KEY no está configurada.",
      };
    }

    const sortedIntermediates = [...intermediateStops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    const body = {
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },
      intermediates: sortedIntermediates.map((s) => ({
        location: {
          latLng: {
            latitude: s.latitude,
            longitude: s.longitude,
          },
        },
      })),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: true,
      },
    };

    try {
      const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.geoJsonLinestring",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          distanceKm: 0,
          durationMin: 0,
          durationFormatted: "",
          geometry: null,
          waypoints: [],
          provider: "google",
          trafficConsidered: false,
          error: `Google Routes API error ${res.status}: ${errText}`,
        };
      }

      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) {
        return {
          success: false,
          distanceKm: 0,
          durationMin: 0,
          durationFormatted: "",
          geometry: null,
          waypoints: [],
          provider: "google",
          trafficConsidered: false,
          error: "No se encontraron rutas con Google Routes API.",
        };
      }

      const distanceKm = Number(((route.distanceMeters || 0) / 1000).toFixed(1));
      const seconds = parseInt((route.duration || "0s").replace("s", ""), 10);
      const durationMin = Math.round(seconds / 60);

      return {
        success: true,
        distanceKm,
        durationMin,
        durationFormatted: formatDurationHoursMinutes(durationMin),
        geometry: route.polyline?.geoJsonLinestring || null,
        waypoints: [
          { id: origin.id, name: origin.name, sequenceOrder: 0, latitude: origin.latitude, longitude: origin.longitude, isOrigin: true },
          ...sortedIntermediates.map((s) => ({ id: s.id, name: s.name, sequenceOrder: s.sequenceOrder, latitude: s.latitude, longitude: s.longitude })),
          { id: destination.id, name: destination.name, sequenceOrder: 9999, latitude: destination.latitude, longitude: destination.longitude, isDestination: true },
        ],
        provider: "google",
        trafficConsidered: true,
      };
    } catch (err: unknown) {
      return {
        success: false,
        distanceKm: 0,
        durationMin: 0,
        durationFormatted: "",
        geometry: null,
        waypoints: [],
        provider: "google",
        trafficConsidered: false,
        error: err instanceof Error ? err.message : "Error al conectar con Google Routes",
      };
    }
  }
}

/**
 * Factory / Servicio principal: selecciona el proveedor activo según la configuración de entorno.
 * Por defecto utiliza OSRM (OpenStreetMap carreteras reales).
 * Si está configurada GOOGLE_MAPS_API_KEY y ROUTING_PROVIDER="google", se usa Google.
 * Si está configurada OPENROUTESERVICE_API_KEY y ROUTING_PROVIDER="openrouteservice", se usa ORS.
 */
export function getRoutingProvider(): RoutingProvider {
  const chosen = (process.env.ROUTING_PROVIDER || "").toLowerCase();

  if (chosen === "google" && process.env.GOOGLE_MAPS_API_KEY) {
    return new GoogleRoutesProvider();
  }

  if (chosen === "openrouteservice" && process.env.OPENROUTESERVICE_API_KEY) {
    return new OpenRouteServiceProvider();
  }

  // Proveedor por defecto: OSRM
  return new OSRMRoutingProvider();
}

/**
 * Función de entrada para calcular rutas entre paradas.
 */
export async function calculateDrivingRoute(options: CalculateRouteOptions): Promise<DrivingCalculationResult> {
  const provider = getRoutingProvider();
  return provider.calculateRoute(options);
}
