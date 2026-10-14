import { describe, it, expect } from "vitest";

interface BookingRecord {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  expiresAt: Date;
  seatIds: string[];
}

/**
 * Simulación de la lógica transaccional de confirm_booking_on_payment() y expire_pending_bookings()
 */
class BookingConfirmationService {
  private bookings: Map<string, BookingRecord> = new Map();

  public createBooking(id: string, expiresAt: Date, seatIds: string[]): void {
    this.bookings.set(id, {
      id,
      status: "pending",
      expiresAt,
      seatIds,
    });
  }

  /**
   * Intenta confirmar una reserva. Falla si expiresAt <= now.
   */
  public confirmBooking(bookingId: string): { success: boolean; error?: string } {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return { success: false, error: "RESERVA_NO_ENCONTRADA" };
    }

    if (booking.status !== "pending") {
      return { success: false, error: `ESTADO_INVALIDO_${booking.status}` };
    }

    const now = new Date();
    if (booking.expiresAt.getTime() <= now.getTime()) {
      // Regla de integridad: marcar como expirada automáticamente
      booking.status = "expired";
      return { success: false, error: "RESERVA_EXPIRADA" };
    }

    booking.status = "confirmed";
    return { success: true };
  }

  /**
   * Proceso batch idempotente (equivalente a expire_pending_bookings)
   */
  public expireOverdueBookings(): number {
    const now = new Date();
    let expiredCount = 0;

    this.bookings.forEach((booking) => {
      if (booking.status === "pending" && booking.expiresAt.getTime() < now.getTime()) {
        booking.status = "expired";
        expiredCount++;
      }
    });

    return expiredCount;
  }

  public getBooking(id: string): BookingRecord | undefined {
    return this.bookings.get(id);
  }
}

describe("Lógica de Expiración de Reservas Temporales (ADR-001)", () => {
  it("debe rechazar la confirmación cuando una reserva ha expirado", () => {
    const service = new BookingConfirmationService();
    const expiredDate = new Date(Date.now() - 5000); // Expiró hace 5 segundos

    service.createBooking("booking-expired-1", expiredDate, ["seat-1"]);

    const result = service.confirmBooking("booking-expired-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("RESERVA_EXPIRADA");
    expect(service.getBooking("booking-expired-1")?.status).toBe("expired");
  });

  it("debe confirmar exitosamente una reserva mientras se encuentre dentro del tiempo límite", () => {
    const service = new BookingConfirmationService();
    const futureDate = new Date(Date.now() + 600000); // Expira en 10 minutos

    service.createBooking("booking-valid-1", futureDate, ["seat-1"]);

    const result = service.confirmBooking("booking-valid-1");

    expect(result.success).toBe(true);
    expect(service.getBooking("booking-valid-1")?.status).toBe("confirmed");
  });

  it("el proceso de expiración batch debe ser idempotente", () => {
    const service = new BookingConfirmationService();
    const past = new Date(Date.now() - 10000);

    service.createBooking("b-1", past, ["s-1"]);
    service.createBooking("b-2", past, ["s-2"]);

    // Primera ejecución: expira 2 reservas
    const count1 = service.expireOverdueBookings();
    expect(count1).toBe(2);

    // Segunda ejecución inmediata: no debe encontrar ninguna pendiente adicional (idempotente)
    const count2 = service.expireOverdueBookings();
    expect(count2).toBe(0);
  });
});
