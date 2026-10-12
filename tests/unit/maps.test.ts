import { describe, it, expect } from "vitest";
import { formatDurationHoursMinutes, OSRMRoutingProvider } from "@/lib/maps/routing";
import { coordinateSchema, updateStopCoordinatesSchema } from "@/lib/maps/validations";

describe("Módulo de Mapas y Rutas Viales — Ruta Norte", () => {
  describe("Validaciones de Coordenadas Geográficas", () => {
    it("debe validar coordenadas correctas dentro del Ecuador", () => {
      const tulcan = { latitude: 0.8125, longitude: -77.718 };
      const parsed = coordinateSchema.safeParse(tulcan);
      expect(parsed.success).toBe(true);
    });

    it("debe rechazar coordenadas con latitud fuera de rango", () => {
      const invalido = { latitude: 45.123, longitude: -77.718 };
      const parsed = coordinateSchema.safeParse(invalido);
      expect(parsed.success).toBe(false);
    });

    it("debe rechazar coordenadas con longitud fuera de Ecuador", () => {
      const invalido = { latitude: 0.8125, longitude: 12.345 };
      const parsed = coordinateSchema.safeParse(invalido);
      expect(parsed.success).toBe(false);
    });

    it("debe validar schema de actualización de parada para operadores", () => {
      const input = {
        stopId: "20000000-0000-0000-0000-000000000001",
        latitude: 0.8125,
        longitude: -77.718,
        address: "Av. 24 de Mayo y Panamericana",
      };
      const parsed = updateStopCoordinatesSchema.safeParse(input);
      expect(parsed.success).toBe(true);
    });
  });

  describe("Formateador de Tiempos y Duración", () => {
    it("debe formatear minutos inferiores a una hora", () => {
      expect(formatDurationHoursMinutes(45)).toBe("45 min");
      expect(formatDurationHoursMinutes(15.2)).toBe("15 min");
    });

    it("debe formatear horas y minutos combinados", () => {
      expect(formatDurationHoursMinutes(90)).toBe("1 h 30 min");
      expect(formatDurationHoursMinutes(60)).toBe("1 h");
      expect(formatDurationHoursMinutes(145)).toBe("2 h 25 min");
    });
  });

  describe("Cálculo Vial OSRM (Rutas Viales y Waypoints)", () => {
    it("debe instanciar el proveedor OSRM con la URL configurada", () => {
      const provider = new OSRMRoutingProvider();
      expect(provider.name).toBe("osrm");
    });

    it("debe calcular una ruta entre paradas de Carchi (o devolver error controlado de red)", async () => {
      const provider = new OSRMRoutingProvider();
      const result = await provider.calculateRoute({
        origin: {
          id: "stop-tulcan",
          name: "Terminal Terrestre Tulcán",
          latitude: 0.8125,
          longitude: -77.718,
        },
        destination: {
          id: "stop-julio-andrade",
          name: "Parque Central Julio Andrade",
          latitude: 0.6725,
          longitude: -77.713,
        },
      });

      // Si hay conexión de red a OSRM
      if (result.success) {
        expect(result.distanceKm).toBeGreaterThan(15);
        expect(result.durationMin).toBeGreaterThan(10);
        expect(result.geometry).toBeDefined();
        expect(result.geometry?.type).toBe("LineString");
        expect(result.waypoints.length).toBe(2);
      } else {
        // En entorno offline o con firewall
        expect(result.error).toBeDefined();
        expect(result.provider).toBe("osrm");
      }
    });

    it("debe ordenar correctamente paradas intermedias sin duplicar", async () => {
      const provider = new OSRMRoutingProvider();
      const result = await provider.calculateRoute({
        origin: {
          id: "stop-1",
          name: "Tulcán",
          latitude: 0.8125,
          longitude: -77.718,
        },
        destination: {
          id: "stop-3",
          name: "San Gabriel",
          latitude: 0.6025,
          longitude: -77.831,
        },
        intermediateStops: [
          {
            id: "stop-2",
            name: "Huaca",
            sequenceOrder: 1,
            latitude: 0.636,
            longitude: -77.728,
          },
        ],
      });

      expect(result.waypoints.length).toBe(3);
      expect(result.waypoints[0].name).toBe("Tulcán");
      expect(result.waypoints[1].name).toBe("Huaca");
      expect(result.waypoints[2].name).toBe("San Gabriel");
    });
  });
});
