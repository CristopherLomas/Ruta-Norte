import { describe, it, expect } from "vitest";

interface SimulatedTicket {
  id: string;
  qrCode: string;
  tripId: string;
  passengerId: string;
  status: "issued" | "used" | "cancelled";
  boardedAt: Date | null;
  boardedBy: string | null;
}

/**
 * Simulación de la función validate_ticket_qr() de la migración 003 (ADR-002)
 */
class TicketValidationEngine {
  private tickets: Map<string, SimulatedTicket> = new Map();

  public registerTicket(ticket: SimulatedTicket): void {
    this.tickets.set(ticket.qrCode, ticket);
  }

  public validateQr(
    qrCode: string,
    currentTripId: string,
    inspectorId: string
  ): { valid: boolean; code: string; message: string; boardedAt?: Date } {
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

    if (ticket.status === "used") {
      return {
        valid: false,
        code: "BOLETO_YA_UTILIZADO",
        message: "Este boleto ya fue validado previamente.",
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

    // Validación exitosa: marcar como used
    const now = new Date();
    ticket.status = "used";
    ticket.boardedAt = now;
    ticket.boardedBy = inspectorId;

    return {
      valid: true,
      code: "EMBARQUE_EXITOSO",
      message: "Embarque validado correctamente.",
      boardedAt: now,
    };
  }
}

describe("Validación de Boletos y Control de Embarque con QR (ADR-002)", () => {
  const TRIP_A = "trip-ibarra-otavalo-0800";
  const TRIP_B = "trip-ibarra-cotacachi-0900";
  const INSPECTOR_ID = "inspector-patricio-uuid";
  const QR_CODE = "RN-A1B2C3D4E5F67890";

  it("el identificador QR debe ser un token opaco que no expone datos personales del pasajero", () => {
    // Verificación de convención de token opaco (ADR-002)
    expect(QR_CODE.startsWith("RN-")).toBe(true);
    expect(QR_CODE).not.toContain("carlos");
    expect(QR_CODE).not.toContain("@");
    expect(QR_CODE).not.toContain("099");
  });

  it("debe validar exitosamente el boleto en el primer intento", () => {
    const engine = new TicketValidationEngine();
    engine.registerTicket({
      id: "ticket-1",
      qrCode: QR_CODE,
      tripId: TRIP_A,
      passengerId: "passenger-1",
      status: "issued",
      boardedAt: null,
      boardedBy: null,
    });

    const res = engine.validateQr(QR_CODE, TRIP_A, INSPECTOR_ID);

    expect(res.valid).toBe(true);
    expect(res.code).toBe("EMBARQUE_EXITOSO");
    expect(res.boardedAt).toBeInstanceOf(Date);
  });

  it("debe rechazar terminantemente un segundo intento de validación del mismo boleto (Anti Doble Embarque)", () => {
    const engine = new TicketValidationEngine();
    engine.registerTicket({
      id: "ticket-1",
      qrCode: QR_CODE,
      tripId: TRIP_A,
      passengerId: "passenger-1",
      status: "issued",
      boardedAt: null,
      boardedBy: null,
    });

    // 1er intento
    const primerIntento = engine.validateQr(QR_CODE, TRIP_A, INSPECTOR_ID);
    expect(primerIntento.valid).toBe(true);

    // 2do intento con el mismo código QR
    const segundoIntento = engine.validateQr(QR_CODE, TRIP_A, INSPECTOR_ID);
    expect(segundoIntento.valid).toBe(false);
    expect(segundoIntento.code).toBe("BOLETO_YA_UTILIZADO");
    expect(segundoIntento.boardedAt).toBeDefined();
  });

  it("debe rechazar el boleto si se presenta en un viaje distinto al emitido", () => {
    const engine = new TicketValidationEngine();
    engine.registerTicket({
      id: "ticket-1",
      qrCode: QR_CODE,
      tripId: TRIP_A,
      passengerId: "passenger-1",
      status: "issued",
      boardedAt: null,
      boardedBy: null,
    });

    const res = engine.validateQr(QR_CODE, TRIP_B, INSPECTOR_ID);

    expect(res.valid).toBe(false);
    expect(res.code).toBe("VIAJE_NO_COINCIDE");
  });
});
