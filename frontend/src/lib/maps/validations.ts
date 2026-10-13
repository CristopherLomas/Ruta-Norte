import { z } from "zod";

/**
 * Validación para coordenadas geográficas en Ecuador.
 * Latitud: aproximadamente -5.0 a 1.5
 * Longitud: aproximadamente -81.5 a -75.0
 */
export const coordinateSchema = z.object({
  latitude: z
    .number({ invalid_type_error: "La latitud debe ser un número" })
    .min(-5.0, "Latitud fuera del rango de Ecuador (-5.0 a 1.5)")
    .max(2.0, "Latitud fuera del rango de Ecuador (-5.0 a 2.0)"),
  longitude: z
    .number({ invalid_type_error: "La longitud debe ser un número" })
    .min(-82.0, "Longitud fuera del rango de Ecuador (-82.0 a -75.0)")
    .max(-75.0, "Longitud fuera del rango de Ecuador (-82.0 a -75.0)"),
});

export const updateStopCoordinatesSchema = z.object({
  stopId: z.string().uuid("ID de parada inválido"),
  latitude: coordinateSchema.shape.latitude,
  longitude: coordinateSchema.shape.longitude,
  address: z.string().optional(),
});

export type UpdateStopCoordinatesInput = z.infer<typeof updateStopCoordinatesSchema>;
