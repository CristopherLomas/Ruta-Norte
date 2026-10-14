import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createBookingSchema,
  processPaymentSchema,
  validateTicketSchema,
} from "@/lib/validations";

describe("Validaciones Zod — Sistema Ruta Norte", () => {
  describe("loginSchema", () => {
    it("debe aceptar credenciales válidas", () => {
      const result = loginSchema.safeParse({
        email: "demo+passenger@rutanorte.ec",
        password: "Password123!",
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar correos electrónicos con formato incorrecto", () => {
      const result = loginSchema.safeParse({
        email: "correo-invalido",
        password: "Password123!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("inválido");
      }
    });

    it("debe rechazar contraseñas de menos de 6 caracteres", () => {
      const result = loginSchema.safeParse({
        email: "usuario@ejemplo.com",
        password: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("debe validar teléfono móvil ecuatoriano formato 09XXXXXXXX", () => {
      const valido = registerSchema.safeParse({
        fullName: "Carlos Imbaquingo",
        email: "carlos@ejemplo.com",
        password: "Password123!",
        phone: "0991234567",
      });
      expect(valido.success).toBe(true);

      const invalido = registerSchema.safeParse({
        fullName: "Carlos Imbaquingo",
        email: "carlos@ejemplo.com",
        password: "Password123!",
        phone: "12345678", // Teléfono no ecuatoriano
      });
      expect(invalido.success).toBe(false);
    });
  });

  describe("createBookingSchema", () => {
    const validUuid = "11111111-1111-1111-1111-111111111111";

    it("debe aceptar entre 1 y 4 asientos por reserva", () => {
      const unaPlaza = createBookingSchema.safeParse({
        tripId: validUuid,
        originStopId: validUuid,
        destinationStopId: validUuid,
        seatIds: [validUuid],
      });
      expect(unaPlaza.success).toBe(true);

      const cuatroPlazas = createBookingSchema.safeParse({
        tripId: validUuid,
        originStopId: validUuid,
        destinationStopId: validUuid,
        seatIds: [validUuid, validUuid, validUuid, validUuid],
      });
      expect(cuatroPlazas.success).toBe(true);
    });

    it("debe rechazar reservas con 0 asientos seleccionados", () => {
      const sinAsientos = createBookingSchema.safeParse({
        tripId: validUuid,
        originStopId: validUuid,
        destinationStopId: validUuid,
        seatIds: [],
      });
      expect(sinAsientos.success).toBe(false);
    });

    it("debe rechazar reservas con más de 4 asientos (anti acaparamiento)", () => {
      const cincoAsientos = createBookingSchema.safeParse({
        tripId: validUuid,
        originStopId: validUuid,
        destinationStopId: validUuid,
        seatIds: [validUuid, validUuid, validUuid, validUuid, validUuid],
      });
      expect(cincoAsientos.success).toBe(false);
    });
  });

  describe("processPaymentSchema", () => {
    it("debe validar métodos de pago simulados autorizados", () => {
      const tarjeta = processPaymentSchema.safeParse({
        bookingId: "11111111-1111-1111-1111-111111111111",
        paymentMethod: "simulated_card",
        cardLastFour: "4242",
      });
      expect(tarjeta.success).toBe(true);

      const efectivo = processPaymentSchema.safeParse({
        bookingId: "11111111-1111-1111-1111-111111111111",
        paymentMethod: "simulated_cash",
      });
      expect(efectivo.success).toBe(true);

      const invalido = processPaymentSchema.safeParse({
        bookingId: "11111111-1111-1111-1111-111111111111",
        paymentMethod: "stripe_real", // Prohibido por regla del sistema
      });
      expect(invalido.success).toBe(false);
    });
  });

  describe("validateTicketSchema", () => {
    it("debe requerir un código QR de longitud mínima y UUID de viaje", () => {
      const valido = validateTicketSchema.safeParse({
        qrCode: "RN-A1B2C3D4E5F6G7H8",
        tripId: "11111111-1111-1111-1111-111111111111",
      });
      expect(valido.success).toBe(true);

      const corto = validateTicketSchema.safeParse({
        qrCode: "123",
        tripId: "11111111-1111-1111-1111-111111111111",
      });
      expect(corto.success).toBe(false);
    });
  });
});
