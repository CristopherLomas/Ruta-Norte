import { z } from "zod";
import {
  validateEcuadorianIdCard,
  validateEcuadorianRuc,
  validateEcuadorianPlate,
} from "./ecuador";

export * from "./ecuador";

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
 * Esquema de Cooperativa (Fase 3)
 */
export const cooperativeSchema = z.object({
  name: z.string().min(3, "El nombre de la cooperativa debe tener al menos 3 caracteres"),
  ruc: z.string().refine((val) => validateEcuadorianRuc(val), {
    message: "RUC ecuatoriano inválido (debe tener 13 dígitos y formato válido)",
  }),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  logoUrl: z.string().url("URL de logo inválida").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type CooperativeInput = z.infer<typeof cooperativeSchema>;

/**
 * Esquema de Buses / Unidades (Fase 3)
 */
export const busSchema = z.object({
  cooperativeId: z.string().uuid("Debe seleccionar una cooperativa válida").optional().nullable(),
  plate: z.string().refine((val) => validateEcuadorianPlate(val), {
    message: "Formato de placa inválido (ej: IAA-1234 o PBH-456)",
  }),
  unitNumber: z.string().min(1, "El número de disco es requerido (ej: Disco 12)"),
  model: z.string().optional().or(z.literal("")),
  brand: z.string().optional().or(z.literal("")),
  chassis: z.string().optional().or(z.literal("")),
  year: z.number().int().min(1990, "Año mínimo: 1990").max(2030, "Año máximo: 2030"),
  totalSeats: z.number().int().min(10, "Mínimo 10 asientos").max(60, "Máximo 60 asientos"),
  rows: z.number().int().min(3).max(15).default(10),
  columns: z.number().int().min(2).max(5).default(4),
  status: z.enum(["active", "maintenance", "inactive"]).default("active"),
  isActive: z.boolean().default(true),
});

export type BusInput = z.infer<typeof busSchema>;

/**
 * Esquema de Chofer / Conductor (Fase 3)
 */
export const driverSchema = z.object({
  idCard: z.string().refine((val) => validateEcuadorianIdCard(val), {
    message: "Cédula de identidad ecuatoriana inválida (10 dígitos con dígito verificador)",
  }),
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  phone: z.string().regex(/^09\d{8}$/, "Número celular ecuatoriano inválido (ej: 0991234567)").optional().or(z.literal("")),
  licenseNumber: z.string().min(5, "El número de licencia debe tener al menos 5 caracteres"),
  licenseCategory: z.enum(["Tipo C", "Tipo D", "Tipo E"], {
    errorMap: () => ({ message: "Seleccione una categoría profesional válida (Tipo C, D o E)" }),
  }),
  licenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de caducidad inválida (AAAA-MM-DD)"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  isAvailable: z.boolean().default(true),
});

export type DriverInput = z.infer<typeof driverSchema>;

/**
 * Esquema de Rutas (Fase 3)
 */
export const routeSchema = z.object({
  name: z.string().min(3, "El nombre de la ruta debe tener al menos 3 caracteres"),
  code: z.string().min(2, "El código de ruta es requerido (ej: RN-101)").toUpperCase(),
  originStopId: z.string().uuid("Seleccione la parada de origen"),
  destinationStopId: z.string().uuid("Seleccione la parada de destino"),
  distanceKm: z.number().positive("La distancia debe ser un valor positivo en kilómetros"),
  durationMin: z.number().int().positive("La duración estimada debe ser un número entero positivo de minutos"),
  baseFare: z.number().nonnegative("La tarifa base debe ser mayor o igual a 0.00 USD"),
  isActive: z.boolean().default(true),
}).refine((data) => data.originStopId !== data.destinationStopId, {
  message: "La parada de origen y destino no pueden ser la misma",
  path: ["destinationStopId"],
});

export type RouteInput = z.infer<typeof routeSchema>;

/**
 * Esquema de Paradas Intermedias (Fase 3)
 */
export const routeStopSchema = z.object({
  routeId: z.string().uuid("ID de ruta inválido"),
  stopId: z.string().uuid("Seleccione una parada válida"),
  sequenceOrder: z.number().int().positive("El orden de secuencia debe ser un entero positivo (1, 2, 3...)"),
  distanceFromOriginKm: z.number().nonnegative("La distancia debe ser mayor o igual a 0").default(0),
  timeFromOriginMin: z.number().int().nonnegative("El tiempo debe ser mayor o igual a 0").default(0),
  isBoardingPoint: z.boolean().default(true),
  isAlightingPoint: z.boolean().default(true),
});

export type RouteStopInput = z.infer<typeof routeStopSchema>;

/**
 * Esquema de Programación de Viajes (Fase 3)
 */
export const tripScheduleSchema = z.object({
  routeId: z.string().uuid("Seleccione una ruta válida"),
  busId: z.string().uuid("Seleccione una unidad/bus válida"),
  driverId: z.string().uuid("Seleccione un conductor válido"),
  departureTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha y hora de salida inválida",
  }),
  arrivalTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha y hora de llegada estimada inválida",
  }),
  status: z.enum(["scheduled", "boarding", "in_progress", "completed", "cancelled"]).default("scheduled"),
}).refine((data) => new Date(data.arrivalTime) > new Date(data.departureTime), {
  message: "La hora estimada de llegada debe ser posterior a la hora de salida",
  path: ["arrivalTime"],
});

export type TripScheduleInput = z.infer<typeof tripScheduleSchema>;

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
