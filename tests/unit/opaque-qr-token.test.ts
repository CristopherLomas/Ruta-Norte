import { describe, it, expect } from "vitest";
import {
  generateTicketQrToken,
  generateTicketQrPayload,
  isValidQrTokenFormat,
} from "@/features/tickets/utils";

describe("ADR-002: Generación y Validación de Token QR Criptográfico Opaco", () => {
  it("debe generar un token con el formato estricto 'RN-XXXXXXXXXXXXXXXX'", () => {
    const token = generateTicketQrToken();

    expect(token).toBeDefined();
    expect(token.startsWith("RN-")).toBe(true);
    expect(token.length).toBe(19); // 'RN-' (3) + 16 caracteres hex = 19
    expect(isValidQrTokenFormat(token)).toBe(true);
  });

  it("debe generar tokens únicos de alta entropía en llamadas sucesivas", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateTicketQrToken());
    }

    expect(tokens.size).toBe(100);
  });

  it("debe rechazar tokens con formato malicioso o manipulado", () => {
    expect(isValidQrTokenFormat("")).toBe(false);
    expect(isValidQrTokenFormat("RN-12345")).toBe(false);
    expect(isValidQrTokenFormat("RN-ZZZZZZZZZZZZZZZZ")).toBe(false); // No hex
    expect(isValidQrTokenFormat("RN-1234567890abcdef")).toBe(false); // Minúsculas
    expect(isValidQrTokenFormat("TICKET-1234567890ABCDEF")).toBe(false);
  });

  it("debe generar un payload sin datos personales sensibles (PII) con firma SHA-256", () => {
    const ticketId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const tripId = "f1e2d3c4-b5a6-7890-fedc-ba0987654321";
    const seatNumber = "4B";
    const departureTime = "2026-10-15T08:30:00Z";

    const payload = generateTicketQrPayload(ticketId, tripId, seatNumber, departureTime);

    expect(payload.ticket_id).toBe(ticketId);
    expect(payload.trip_id).toBe(tripId);
    expect(payload.seat_number).toBe("4B");
    expect(payload.valid_for_departure).toBe(departureTime);
    expect(payload.checksum).toBeDefined();
    expect(payload.checksum.length).toBe(64); // SHA-256 hex digest

    // Verificar que no expone PII
    const rawPayload = JSON.stringify(payload);
    expect(rawPayload).not.toContain("passenger_name");
    expect(rawPayload).not.toContain("dni");
    expect(rawPayload).not.toContain("cedula");
    expect(rawPayload).not.toContain("phone");
  });
});
