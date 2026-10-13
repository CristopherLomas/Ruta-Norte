import crypto from "crypto";
import { TicketQRPayload } from "@/types";

/**
 * Genera un token opaco inmutable con formato 'RN-XXXXXXXXXXXXXXXX'.
 * Utiliza 16 caracteres hexadecimales criptográficamente seguros en mayúsculas (ADR-002).
 */
export function generateTicketQrToken(): string {
  const randomBytes = crypto.randomBytes(8).toString("hex").toUpperCase();
  return `RN-${randomBytes}`;
}

/**
 * Genera el payload estructurado no sensible del código QR (ADR-002).
 * Sin PII (sin nombres, teléfonos ni cédulas expuestas públicamente).
 */
export function generateTicketQrPayload(
  ticketId: string,
  tripId: string,
  seatNumber: string,
  departureTime: string
): TicketQRPayload {
  // Checksum HMAC/SHA256 sobre los metadatos del boleto
  const checksum = crypto
    .createHash("sha256")
    .update(`${ticketId}:${tripId}:${seatNumber}:${departureTime}`)
    .digest("hex");

  return {
    ticket_id: ticketId,
    trip_id: tripId,
    seat_number: seatNumber,
    valid_for_departure: departureTime,
    checksum,
  };
}

/**
 * Valida si un string cumple el formato de token QR de Ruta Norte.
 */
export function isValidQrTokenFormat(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  return /^RN-[0-9A-F]{16}$/.test(token);
}
