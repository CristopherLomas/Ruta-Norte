import { describe, it, expect, beforeEach } from "vitest";

interface SimulatedTicketRecord {
  id: string;
  qrCode: string;
  tripId: string;
  passengerId: string;
  status: "issued" | "used" | "cancelled";
  boardedAt: string | null;
  boardedBy: string | null;
}

/**
 * Motor transaccional que reproduce la lógica de `validate_ticket_qr()` (ADR-002).
 */
class BoardingValidationEngine {
  private tickets: Map<string, SimulatedTicketRecord> = new Map();

  public registerTicket(ticket: SimulatedTicketRecord): void {
    this.tickets.set(ticket.qrCode, ticket);
  }

  public validateBoarding(
    qrCode: string,
    currentTripId: string,
    inspectorId: string,
    currentTime: string = new Date().toISOString()
  ): { valid: boolean; code: string; message: string; boardedAt?: string } {
    const ticket = this.tickets.get(qrCode);

    if (!ticket) {
      return {
        valid: false,
        code: "BOLETO_NO_ENCONTRADO",
        message: "El código QR no corresponde a ningún boleto registrado.",
      };
    }

    if (ticket.tripId !== currentTripId) {
      return {
        valid: false,
        code: "VIAJE_NO_COINCIDE",
        message: "El boleto no corresponde al viaje en curso.",
      };
    }

    // Regla de Anti Doble Embarque (Anti Double-Use)
    if (ticket.status === "used") {
      return {
        valid: false,
        code: "BOLETO_YA_UTILIZADO",
        message: `Este boleto ya fue validado previamente el ${ticket.boardedAt}`,
        boardedAt: ticket.boardedAt || undefined,
      };
    }

    if (ticket.status === "cancelled") {
      return {
        valid: false,
        code: "BOLETO_CANCELADO",
        message: "Este boleto se encuentra cancelado.",
      };
    }

    // Transición atómica a 'used'
    ticket.status = "used";
    ticket.boardedAt = currentTime;
    ticket.boardedBy = inspectorId;

    return {
      valid: true,
      code: "EMBARQUE_EXITOSO",
      message: "Embarque validado correctamente.",
      boardedAt: currentTime,
    };
  }
}

describe("ADR-002: Validación de Embarque y Prevención de Doble Abordaje", () => {
  let engine: BoardingValidationEngine;
  const tripId = "trip-ibarra-otavalo-101";
  const inspectorId = "inspector-user-777";
  const validToken = "RN-4A7B9C1E2F3D4567";

  beforeEach(() => {
    engine = new BoardingValidationEngine();
    engine.registerTicket({
      id: "ticket-001",
      qrCode: validToken,
      tripId,
      passengerId: "passenger-123",
      status: "issued",
      boardedAt: null,
      boardedBy: null,
    });
  });

  it("debe validar con éxito un boleto emitido ('issued') por primera vez", () => {
    const res = engine.validateBoarding(validToken, tripId, inspectorId);

    expect(res.valid).toBe(true);
    expect(res.code).toBe("EMBARQUE_EXITOSO");
    expect(res.boardedAt).toBeDefined();
  });

  it("debe bloquear de forma estricta un segundo intento de abordaje (Doble Uso)", () => {
    // 1er intento: Exitoso
    const firstAttempt = engine.validateBoarding(
      validToken,
      tripId,
      inspectorId,
      "2026-10-10 08:30:00"
    );
    expect(firstAttempt.valid).toBe(true);

    // 2do intento: Rechazado
    const secondAttempt = engine.validateBoarding(
      validToken,
      tripId,
      inspectorId,
      "2026-10-10 08:31:00"
    );
    expect(secondAttempt.valid).toBe(false);
    expect(secondAttempt.code).toBe("BOLETO_YA_UTILIZADO");
    expect(secondAttempt.message).toContain("validado previamente");
  });

  it("debe rechazar un token inexistente con código BOLETO_NO_ENCONTRADO", () => {
    const res = engine.validateBoarding("RN-9999999999999999", tripId, inspectorId);

    expect(res.valid).toBe(false);
    expect(res.code).toBe("BOLETO_NO_ENCONTRADO");
  });

  it("debe rechazar un boleto emitido para otro viaje", () => {
    const otherTripId = "trip-otavalo-zuleta-202";
    const res = engine.validateBoarding(validToken, otherTripId, inspectorId);

    expect(res.valid).toBe(false);
    expect(res.code).toBe("VIAJE_NO_COINCIDE");
  });

  it("debe rechazar un boleto que haya sido cancelado", () => {
    const cancelledToken = "RN-CANCELLED000000";
    engine.registerTicket({
      id: "ticket-002",
      qrCode: cancelledToken,
      tripId,
      passengerId: "passenger-456",
      status: "cancelled",
      boardedAt: null,
      boardedBy: null,
    });

    const res = engine.validateBoarding(cancelledToken, tripId, inspectorId);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("BOLETO_CANCELADO");
  });
});
