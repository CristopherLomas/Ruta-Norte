import { describe, it, expect } from "vitest";
import {
  createBookingSchema,
  processPaymentSchema,
  searchTripsSchema,
} from "@/lib/validations";

describe("Validaciones Zod — Core de Negocio (Fase 4)", () => {
  describe("createBookingSchema", () => {
    const validBooking = {
      tripId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      originStopId: "b1b2c3d4-e5f6-7890-abcd-ef1234567890",
      destinationStopId: "c1b2c3d4-e5f6-7890-abcd-ef1234567890",
      seatIds: ["d1b2c3d4-e5f6-7890-abcd-ef1234567890"],
    };

    it("debe aceptar una reserva válida con 1 asiento", () => {
      const res = createBookingSchema.safeParse(validBooking);
      expect(res.success).toBe(true);
    });

    it("debe aceptar una reserva con exactamente 4 asientos", () => {
      const res = createBookingSchema.safeParse({
        ...validBooking,
        seatIds: [
          "d1b2c3d4-e5f6-7890-abcd-ef1234567891",
          "d1b2c3d4-e5f6-7890-abcd-ef1234567892",
          "d1b2c3d4-e5f6-7890-abcd-ef1234567893",
          "d1b2c3d4-e5f6-7890-abcd-ef1234567894",
        ],
      });
      expect(res.success).toBe(true);
    });

    it("debe rechazar una reserva sin asientos (array vacío)", () => {
      const res = createBookingSchema.safeParse({
        ...validBooking,
        seatIds: [],
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("al menos un asiento");
      }
    });

    it("debe rechazar una reserva que intente apartar más de 4 asientos", () => {
      const res = createBookingSchema.safeParse({
        ...validBooking,
        seatIds: [
          "d1b2c3d4-e5f6-7890-abcd-ef1234567891",
          "d1b2c3d4-e5f6-7890-abcd-ef1234567892",
          "d1b2c3d4-e5f6-7890-abcd-ef1234567893",
          "d1b2c3d4-e5f6-7890-abcd-ef1234567894",
          "d1b2c3d4-e5f6-7890-abcd-ef1234567895", // 5to asiento
        ],
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("Máximo 4 asientos");
      }
    });

    it("debe rechazar IDs que no sean UUIDs válidos", () => {
      const res = createBookingSchema.safeParse({
        tripId: "not-a-uuid",
        originStopId: "invalid",
        destinationStopId: "invalid",
        seatIds: ["invalid-uuid"],
      });
      expect(res.success).toBe(false);
    });
  });

  describe("searchTripsSchema", () => {
    it("debe validar correctamente fecha en formato AAAA-MM-DD y UUIDs de parada", () => {
      const res = searchTripsSchema.safeParse({
        originStopId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        destinationStopId: "b1b2c3d4-e5f6-7890-abcd-ef1234567890",
        departureDate: "2026-10-15",
      });
      expect(res.success).toBe(true);
    });

    it("debe rechazar formatos de fecha no estándar", () => {
      const res = searchTripsSchema.safeParse({
        originStopId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        destinationStopId: "b1b2c3d4-e5f6-7890-abcd-ef1234567890",
        departureDate: "15/10/2026", // Formato incorrecto
      });
      expect(res.success).toBe(false);
    });
  });

  describe("processPaymentSchema", () => {
    it("debe aceptar un método de pago simulado válido", () => {
      const res = processPaymentSchema.safeParse({
        bookingId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        paymentMethod: "simulated_card",
        cardLastFour: "4567",
      });
      expect(res.success).toBe(true);
    });

    it("debe rechazar métodos de pago no definidos en el enum", () => {
      const res = processPaymentSchema.safeParse({
        bookingId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        paymentMethod: "crypto_bitcoin" as unknown as "simulated_card",
      });
      expect(res.success).toBe(false);
    });
  });
});
