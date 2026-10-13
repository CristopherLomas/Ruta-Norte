/**
 * Tipos de dominio y contratos globales para el sistema Ruta Norte.
 * Fuente de verdad establecida por el Arquitecto / Coordinador.
 */

export type UserRole = "admin" | "operator" | "seller" | "inspector" | "passenger";

export type TripStatus = "scheduled" | "boarding" | "in_progress" | "completed" | "cancelled";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired";

export type BookingSeatStatus = "reserved" | "sold" | "cancelled";

export type PaymentMethod = "simulated_card" | "simulated_cash" | "simulated_transfer";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type TicketStatus = "issued" | "used" | "cancelled";

export type IncidentType = "delay" | "breakdown" | "accident" | "other";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type SeatType = "standard" | "premium" | "accessibility";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string | null;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

export interface Locality {
  id: string;
  name: string;
  parish: string;
  canton: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Stop {
  id: string;
  locality_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  locality?: Locality;
}

export interface Cooperative {
  id: string;
  name: string;
  ruc: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  origin_stop_id: string;
  destination_stop_id: string;
  distance_km: number | null;
  duration_min: number | null;
  base_fare?: number;
  is_active: boolean;
  created_at: string;
  origin_stop?: Stop;
  destination_stop?: Stop;
}

export interface RouteStop {
  id: string;
  route_id: string;
  stop_id: string;
  sequence_order: number;
  distance_from_origin_km: number | null;
  time_from_origin_min: number | null;
  is_boarding_point: boolean;
  is_alighting_point: boolean;
  stop?: Stop;
}

export interface BusLayoutConfig {
  rows: number;
  columns: number;
  column_labels: string[]; // ej: ["A", "B", "_", "C", "D"] donde "_" es pasillo
  special_seats?: {
    seat_number: string;
    type: SeatType;
  }[];
}

export type BusStatus = "active" | "maintenance" | "inactive";

export interface Bus {
  id: string;
  cooperative_id?: string | null;
  plate: string;
  unit_number?: string | null;
  model: string | null;
  brand: string | null;
  chassis?: string | null;
  year: number | null;
  total_seats: number;
  layout_config: BusLayoutConfig;
  status?: BusStatus;
  is_active: boolean;
  created_at: string;
  cooperative?: Cooperative;
}

export interface BusSeat {
  id: string;
  bus_id: string;
  seat_number: string;
  seat_row: number;
  seat_column: number;
  seat_type: SeatType;
  is_active: boolean;
}

export type DriverStatus = "active" | "inactive" | "suspended";

export interface Driver {
  id: string;
  profile_id?: string;
  id_card?: string | null;
  full_name?: string | null;
  phone?: string | null;
  license_number: string;
  license_category: string;
  license_expiry: string;
  status?: DriverStatus;
  is_available: boolean;
  created_at: string;
  profile?: Profile;
}

export interface Trip {
  id: string;
  route_id: string;
  bus_id: string;
  driver_id: string;
  departure_time: string;
  arrival_time: string;
  status: TripStatus;
  available_seats: number;
  created_by: string | null;
  created_at: string;
  route?: Route;
  bus?: Bus;
  driver?: Driver;
}

export interface TripFare {
  id: string;
  trip_id: string;
  origin_stop_id: string;
  destination_stop_id: string;
  price: number;
  currency: string;
}

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  origin_stop_id: string;
  destination_stop_id: string;
  status: BookingStatus;
  expires_at: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  trip?: Trip;
  passenger?: Profile;
  seats?: BookingSeat[];
}

export interface BookingSeat {
  id: string;
  booking_id: string;
  bus_seat_id: string;
  status: BookingSeatStatus;
  bus_seat?: BusSeat;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  simulated_reference: string;
  processed_at: string | null;
  created_at: string;
}

export interface TicketQRPayload {
  ticket_id: string;
  trip_id: string;
  seat_number: string;
  valid_for_departure: string;
  checksum: string;
}

export interface Ticket {
  id: string;
  booking_id: string;
  bus_seat_id: string;
  passenger_id: string;
  qr_code: string;
  qr_payload: TicketQRPayload;
  status: TicketStatus;
  issued_at: string;
  boarded_at: string | null;
  boarded_by: string | null;
  seat?: BusSeat;
  booking?: Booking;
}

export interface Incident {
  id: string;
  trip_id: string;
  reported_by: string;
  type: IncidentType;
  description: string;
  severity: IncidentSeverity;
  reported_at: string;
  resolved_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Contrato de resultado estándar para Server Actions y mutaciones.
 */
export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; code?: string; data?: never };

/**
 * Contrato de resultado paginado.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
