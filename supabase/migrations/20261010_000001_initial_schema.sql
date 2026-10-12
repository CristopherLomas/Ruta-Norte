-- ==============================================================================
-- RUTA NORTE — MIGRACIÓN 001: ESQUEMA INICIAL
-- Motor: Supabase PostgreSQL 15+
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Tipos Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'operator', 'seller', 'inspector', 'passenger');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_seat_status AS ENUM ('reserved', 'sold', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('simulated_card', 'simulated_cash', 'simulated_transfer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('issued', 'used', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE incident_type AS ENUM ('delay', 'breakdown', 'accident', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE seat_type AS ENUM ('standard', 'premium', 'accessibility');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Tabla: profiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_demo BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Tabla: roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role UNIQUE NOT NULL,
  description TEXT
);

-- 5. Tabla: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- 6. Tabla: localities (cantones y parroquias del norte ecuatoriano)
CREATE TABLE IF NOT EXISTS public.localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parish TEXT NOT NULL,
  canton TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'Imbabura',
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Tabla: stops (terminales, paraderos y estaciones)
CREATE TABLE IF NOT EXISTS public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locality_id UUID NOT NULL REFERENCES public.localities(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Tabla: routes (recorridos fijos)
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  origin_stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE RESTRICT,
  destination_stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE RESTRICT,
  distance_km NUMERIC(6, 2),
  duration_min INTEGER,
  is_active BOOLEAN DEFAULT true NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_routes_diff_stops CHECK (origin_stop_id <> destination_stop_id)
);

-- 9. Tabla: route_stops (secuencia ordenada de paradas intermedias)
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE RESTRICT,
  sequence_order INTEGER NOT NULL CHECK (sequence_order >= 1),
  distance_from_origin_km NUMERIC(6, 2) DEFAULT 0,
  time_from_origin_min INTEGER DEFAULT 0,
  is_boarding_point BOOLEAN DEFAULT true NOT NULL,
  is_alighting_point BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT uq_route_stop_seq UNIQUE (route_id, sequence_order),
  CONSTRAINT uq_route_stop UNIQUE (route_id, stop_id)
);

-- 10. Tabla: buses (unidades de transporte con layout_config JSONB - ADR-003)
CREATE TABLE IF NOT EXISTS public.buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT UNIQUE NOT NULL,
  model TEXT,
  brand TEXT,
  year INTEGER CHECK (year >= 1990 AND year <= 2030),
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  layout_config JSONB NOT NULL DEFAULT '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb,
  is_active BOOLEAN DEFAULT true NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. Tabla: bus_seats (inventario físico de asientos por unidad)
CREATE TABLE IF NOT EXISTS public.bus_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  seat_row INTEGER NOT NULL CHECK (seat_row >= 1),
  seat_column INTEGER NOT NULL CHECK (seat_column >= 1),
  seat_type seat_type DEFAULT 'standard' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT uq_bus_seat_number UNIQUE (bus_id, seat_number),
  CONSTRAINT uq_bus_seat_coords UNIQUE (bus_id, seat_row, seat_column)
);

-- 12. Tabla: drivers (conductores autorizados)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  license_number TEXT UNIQUE NOT NULL,
  license_category TEXT NOT NULL DEFAULT 'Tipo D',
  license_expiry DATE NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. Tabla: trips (salidas concretas en fecha y hora)
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE RESTRICT,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  status trip_status DEFAULT 'scheduled' NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_trip_times CHECK (arrival_time > departure_time)
);

-- 14. Tabla: trip_fares (tarifas por par origen-destino)
CREATE TABLE IF NOT EXISTS public.trip_fares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  origin_stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE RESTRICT,
  destination_stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency CHAR(3) DEFAULT 'USD' NOT NULL,
  CONSTRAINT uq_trip_fare_stops UNIQUE (trip_id, origin_stop_id, destination_stop_id),
  CONSTRAINT chk_fare_diff_stops CHECK (origin_stop_id <> destination_stop_id)
);

-- 15. Tabla: bookings (reservas temporales con expiración - ADR-001)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE RESTRICT,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  origin_stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE RESTRICT,
  destination_stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE RESTRICT,
  status booking_status DEFAULT 'pending' NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 16. Tabla: booking_seats (asientos reservados/vendidos por reserva)
CREATE TABLE IF NOT EXISTS public.booking_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  bus_seat_id UUID NOT NULL REFERENCES public.bus_seats(id) ON DELETE RESTRICT,
  status booking_seat_status DEFAULT 'reserved' NOT NULL,
  CONSTRAINT uq_booking_bus_seat UNIQUE (booking_id, bus_seat_id)
);

-- 17. Tabla: payments (pagos simulados académicos)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  simulated_reference TEXT NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 18. Tabla: tickets (derechos de embarque con QR único y opaco - ADR-002)
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  bus_seat_id UUID NOT NULL REFERENCES public.bus_seats(id) ON DELETE RESTRICT,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  qr_code TEXT UNIQUE NOT NULL,
  qr_payload JSONB NOT NULL,
  status ticket_status DEFAULT 'issued' NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  boarded_at TIMESTAMPTZ,
  boarded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT uq_ticket_seat_booking UNIQUE (booking_id, bus_seat_id)
);

-- 19. Tabla: incidents (incidencias operativas en viaje)
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  type incident_type NOT NULL,
  description TEXT NOT NULL,
  severity incident_severity DEFAULT 'medium' NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- 20. Tabla: audit_logs (registro inmutable de auditoría)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO CRÍTICOS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_stops_locality ON public.stops(locality_id);
CREATE INDEX IF NOT EXISTS idx_routes_code ON public.routes(code);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_bus_seats_bus ON public.bus_seats(bus_id);

-- Búsqueda de viajes por ruta, fecha y estado
CREATE INDEX IF NOT EXISTS idx_trips_search ON public.trips(route_id, departure_time, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trips_bus_schedule ON public.trips(bus_id, departure_time, arrival_time);
CREATE INDEX IF NOT EXISTS idx_trips_driver_schedule ON public.trips(driver_id, departure_time, arrival_time);

-- Expiración rápida de reservas (ADR-001)
CREATE INDEX IF NOT EXISTS idx_bookings_expires ON public.bookings(expires_at, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_bookings_trip_passenger ON public.bookings(trip_id, passenger_id, status);

-- Control de asientos ocupados por reserva
CREATE INDEX IF NOT EXISTS idx_booking_seats_seat_status ON public.booking_seats(bus_seat_id, status);

-- Validación instantánea de códigos QR (ADR-002)
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON public.tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_booking ON public.tickets(booking_id);

-- Auditoría
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
