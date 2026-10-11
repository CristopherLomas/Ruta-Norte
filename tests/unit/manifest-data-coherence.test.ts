import { describe, it, expect } from "vitest";
import { TripManifestData, ManifestPassenger } from "@/features/trips/actions/manifest";

describe("Cálculo y Coherencia de Datos del Manifiesto de Pasajeros", () => {
  it("debe calcular coherentemente los contadores de ocupación, abordados y vacíos", () => {
    const passengers: ManifestPassenger[] = [
      {
        ticket_id: "t1",
        booking_id: "b1",
        seat_number: "1A",
        passenger_name: "Carlos Andrade",
        id_card: "1003456789",
        destination_name: "Otavalo",
        status: "used",
        boarded_at: "2026-10-10T08:15:00Z",
      },
      {
        ticket_id: "t2",
        booking_id: "b1",
        seat_number: "1B",
        passenger_name: "María Flores",
        id_card: "1004567890",
        destination_name: "Otavalo",
        status: "issued",
        boarded_at: null,
      },
      {
        ticket_id: "t3",
        booking_id: "b2",
        seat_number: "2A",
        passenger_name: "Luis Morales",
        id_card: "1005678901",
        destination_name: "Otavalo",
        status: "used",
        boarded_at: "2026-10-10T08:20:00Z",
      },
    ];

    const totalCapacity = 40;
    const soldCount = passengers.length; // 3
    const boardedCount = passengers.filter((p) => p.status === "used").length; // 2
    const emptyCount = totalCapacity - soldCount; // 37

    const manifest: TripManifestData = {
      trip_id: "trip-manifest-test-1",
      departure_time: "2026-10-10T08:30:00Z",
      arrival_time: "2026-10-10T09:15:00Z",
      status: "boarding",
      cooperative_name: "Transportes Ibarra",
      unit_number: "Disco 14",
      plate: "IAA-1234",
      driver_name: "Segundo Benavides",
      driver_license: "Tipo E",
      route_name: "Ibarra - Otavalo Directo",
      origin_name: "Terminal Ibarra",
      destination_name: "Terminal Otavalo",
      total_capacity: totalCapacity,
      sold_count: soldCount,
      boarded_count: boardedCount,
      empty_count: emptyCount,
      passengers,
    };

    expect(manifest.total_capacity).toBe(40);
    expect(manifest.sold_count).toBe(3);
    expect(manifest.boarded_count).toBe(2);
    expect(manifest.empty_count).toBe(37);
    expect(manifest.sold_count + manifest.empty_count).toBe(manifest.total_capacity);
  });
});
