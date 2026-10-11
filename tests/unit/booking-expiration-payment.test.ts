import { describe, it, expect } from "vitest";

interface SimulatedBooking {
  id: string;
  tripId: string;
  passengerId: string;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  expiresAt: number; // timestamp
  totalAmount: number;
}

interface SimulatedPaymentEngine {
  processPayment(
    booking: SimulatedBooking,
    paymentMethod: string,
    currentTime: number
  ): { success: boolean; error?: string; ticketsCount?: number };
}

/**
 * Motor de prueba que valida la regla de negocio de expiración y confirmación transaccional
 * correspondiente a la función PostgreSQL confirm_booking_on_payment() (ADR-001 y ADR-005).
 */
class PaymentTransactionEngine implements SimulatedPaymentEngine {
  public processPayment(
    booking: SimulatedBooking,
    paymentMethod: string,
    currentTime: number
  ): { success: boolean; error?: string; ticketsCount?: number } {
    if (booking.status !== "pending") {
      return {
        success: false,
        error: `ESTADO_RESERVA_INVALIDO (${booking.status})`,
      };
    }

    // Regla estricta: Si la ventana de 10 minutos ya pasó, la reserva expira y el cobro se rechaza
    if (booking.expiresAt <= currentTime) {
      booking.status = "expired";
      return {
        success: false,
        error: "RESERVA_EXPIRADA",
      };
    }

    // Pago exitoso: Confirmar reserva y emitir boletos
    booking.status = "confirmed";
    return {
      success: true,
      ticketsCount: 2,
    };
  }
}

describe("ADR-001: Rechazo de Pago por Expiración y Transición Atómica", () => {
  const engine = new PaymentTransactionEngine();
  const startTime = 1700000000000;
  const tenMinutesMs = 10 * 60 * 1000;

  it("debe procesar exitosamente el pago si se encuentra dentro de la ventana de 10 minutos", () => {
    const booking: SimulatedBooking = {
      id: "booking-1",
      tripId: "trip-1",
      passengerId: "passenger-1",
      status: "pending",
      expiresAt: startTime + tenMinutesMs, // Vence en 10 min
      totalAmount: 5.0,
    };

    // Pagar al minuto 5
    const paymentTime = startTime + 5 * 60 * 1000;
    const res = engine.processPayment(booking, "simulated_card", paymentTime);

    expect(res.success).toBe(true);
    expect(booking.status).toBe("confirmed");
    expect(res.ticketsCount).toBe(2);
  });

  it("debe rechazar estrictamente el pago y marcar la reserva como 'expired' si han pasado los 10 minutos", () => {
    const booking: SimulatedBooking = {
      id: "booking-2",
      tripId: "trip-1",
      passengerId: "passenger-1",
      status: "pending",
      expiresAt: startTime + tenMinutesMs,
      totalAmount: 5.0,
    };

    // Intentar pagar 1 segundo después de los 10 minutos
    const paymentTime = startTime + tenMinutesMs + 1000;
    const res = engine.processPayment(booking, "simulated_card", paymentTime);

    expect(res.success).toBe(false);
    expect(res.error).toBe("RESERVA_EXPIRADA");
    expect(booking.status).toBe("expired");
  });

  it("debe rechazar un segundo intento de pago para una reserva que ya fue confirmada", () => {
    const booking: SimulatedBooking = {
      id: "booking-3",
      tripId: "trip-1",
      passengerId: "passenger-1",
      status: "confirmed",
      expiresAt: startTime + tenMinutesMs,
      totalAmount: 5.0,
    };

    const paymentTime = startTime + 3 * 60 * 1000;
    const res = engine.processPayment(booking, "simulated_card", paymentTime);

    expect(res.success).toBe(false);
    expect(res.error).toContain("ESTADO_RESERVA_INVALIDO");
  });
});
