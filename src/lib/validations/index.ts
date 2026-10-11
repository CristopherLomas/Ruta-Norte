import { z } from "zod";

/**
 * Esquema de autenticación (Login)
 */
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Esquema de registro de pasajero
 */
export const registerSchema = z.object({
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().regex(/^09\d{8}$/, "Número de celular ecuatoriano inválido (ej: 0991234567)").optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Esquema de creación de reserva de asientos
 */
export const createBookingSchema = z.object({
  tripId: z.string().uuid("ID de viaje inválido"),
  originStopId: z.string().uuid("ID de parada de origen inválido"),
  destinationStopId: z.string().uuid("ID de parada de destino inválido"),
  seatIds: z.array(z.string().uuid()).min(1, "Debe seleccionar al menos un asiento").max(4, "Máximo 4 asientos por reserva"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Esquema de confirmación y pago simulado
 */
export const processPaymentSchema = z.object({
  bookingId: z.string().uuid("ID de reserva inválido"),
  paymentMethod: z.enum(["simulated_card", "simulated_cash", "simulated_transfer"], {
    errorMap: () => ({ message: "Método de pago simulado no válido" }),
  }),
  cardLastFour: z.string().length(4, "Los últimos 4 dígitos son requeridos para simulación").optional(),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;

/**
 * Esquema de validación de boleto por inspector
 */
export const validateTicketSchema = z.object({
  qrCode: z.string().min(10, "Código QR de boleto inválido"),
  tripId: z.string().uuid("ID de viaje actual requerido"),
});

export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;

/**
 * Esquema de búsqueda de viajes
 */
export const searchTripsSchema = z.object({
  originStopId: z.string().uuid("Seleccione una parada de origen"),
  destinationStopId: z.string().uuid("Seleccione una parada de destino"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (AAAA-MM-DD)"),
});

export type SearchTripsInput = z.infer<typeof searchTripsSchema>;

/**
 * Esquema para reporte de incidencias
 */
export const createIncidentSchema = z.object({
  tripId: z.string().uuid("ID de viaje inválido"),
  type: z.enum(["delay", "breakdown", "accident", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
