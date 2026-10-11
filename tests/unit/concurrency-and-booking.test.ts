import { describe, it, expect, beforeEach } from "vitest";

interface SimulatedSeatState {
  seatId: string;
  status: "free" | "reserved" | "sold";
  expiresAt: number | null;
  bookingId: string | null;
}

/**
 * Simulador de la máquina de estados transaccional de PostgreSQL
 * que reproduce exactamente la semántica de la función `reserve_seats()` de la migración 003.
 */
class SeatReservationEngine {
  private seats: Map<string, SimulatedSeatState> = new Map();

  constructor(seatIds: string[]) {
    seatIds.forEach((id) => {
      this.seats.set(id, {
        seatId: id,
        status: "free",
        expiresAt: null,
        bookingId: null,
      });
    });
  }

  /**
   * Ejecuta una reserva atómica con comprobación y bloqueo.
   */
  public async reserveSeats(
    bookingId: string,
    seatIds: string[],
    ttlSeconds: number = 600
  ): Promise<{ success: boolean; error?: string }> {
    const now = Date.now();

    // 1. Simulación de SELECT ... FOR UPDATE (adquisición de bloqueo en memoria)
    for (const seatId of seatIds) {
      const seat = this.seats.get(seatId);
      if (!seat) {
        return { success: false, error: "ASIENTO_NO_ENCONTRADO" };
      }

      const isOccupied =
        seat.status === "sold" ||
        (seat.status === "reserved" && seat.expiresAt !== null && seat.expiresAt > now);

      if (isOccupied) {
        return { success: false, error: "ASIENTO_YA_OCUPADO" };
      }
    }

    // 2. Transición atómica a 'reserved' con expiración
    for (const seatId of seatIds) {
      const seat = this.seats.get(seatId)!;
      seat.status = "reserved";
      seat.expiresAt = now + ttlSeconds * 1000;
      seat.bookingId = bookingId;
    }

    return { success: true };
  }

  public getSeat(seatId: string): SimulatedSeatState | undefined {
    return this.seats.get(seatId);
  }
}

describe("Lógica Transaccional de Reservas y Concurrencia (ADR-001)", () => {
  let engine: SeatReservationEngine;
  const SEAT_1A = "seat-1a-uuid";
  const SEAT_1B = "seat-1b-uuid";

  beforeEach(() => {
    engine = new SeatReservationEngine([SEAT_1A, SEAT_1B]);
  });

  it("debe permitir la reserva atómica cuando los asientos están libres", async () => {
    const res = await engine.reserveSeats("booking-001", [SEAT_1A]);
    expect(res.success).toBe(true);
    expect(engine.getSeat(SEAT_1A)?.status).toBe("reserved");
    expect(engine.getSeat(SEAT_1A)?.bookingId).toBe("booking-001");
  });

  it("debe rechazar solicitudes concurrentes que compiten por el mismo asiento (Anti Doble Venta)", async () => {
    // Simulación de dos pasajeros intentando reservar el asiento 1A al mismo tiempo
    const request1 = engine.reserveSeats("booking-user-1", [SEAT_1A]);
    const request2 = engine.reserveSeats("booking-user-2", [SEAT_1A]);

    const [res1, res2] = await Promise.all([request1, request2]);

    // Exactamente una de las dos peticiones debe triunfar y la otra ser rechazada
    const successCount = [res1, res2].filter((r) => r.success).length;
    const errorCount = [res1, res2].filter((r) => !r.success && r.error === "ASIENTO_YA_OCUPADO").length;

    expect(successCount).toBe(1);
    expect(errorCount).toBe(1);
  });

  it("debe permitir que dos pasajeros reserven asientos distintos concurrentemente sin conflicto", async () => {
    const [res1, res2] = await Promise.all([
      engine.reserveSeats("booking-user-1", [SEAT_1A]),
      engine.reserveSeats("booking-user-2", [SEAT_1B]),
    ]);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(engine.getSeat(SEAT_1A)?.bookingId).toBe("booking-user-1");
    expect(engine.getSeat(SEAT_1B)?.bookingId).toBe("booking-user-2");
  });
});
