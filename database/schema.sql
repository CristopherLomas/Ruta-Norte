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
-- ==============================================================================
-- RUTA NORTE — MIGRACIÓN 002: ROW LEVEL SECURITY & POLÍTICAS DE ACCESO
-- Motor: Supabase PostgreSQL 15+
-- ==============================================================================

-- 1. Funciones auxiliares de autorización
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT r.name INTO v_role
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
  LIMIT 1;

  RETURN COALESCE(v_role, 'passenger'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, VARIADIC p_roles user_role[])
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
BEGIN
  v_role := public.get_user_role(p_user_id);
  RETURN v_role = ANY(p_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Habilitar RLS en todas las tablas públicas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_fares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS: profiles
-- ==============================================================================
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- POLÍTICAS: roles & user_roles
-- ==============================================================================
CREATE POLICY "roles_select_authenticated" ON public.roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "user_roles_select_authenticated" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==============================================================================
-- POLÍTICAS: localities & stops (Catálogo público de paradas)
-- ==============================================================================
CREATE POLICY "localities_select_public" ON public.localities
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "localities_admin_operator_manage" ON public.localities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "stops_select_public" ON public.stops
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "stops_admin_operator_manage" ON public.stops
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

-- ==============================================================================
-- POLÍTICAS: routes & route_stops
-- ==============================================================================
CREATE POLICY "routes_select_public" ON public.routes
  FOR SELECT TO anon, authenticated
  USING ((is_active = true AND deleted_at IS NULL) OR public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "routes_admin_operator_manage" ON public.routes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "route_stops_select_public" ON public.route_stops
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "route_stops_admin_operator_manage" ON public.route_stops
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

-- ==============================================================================
-- POLÍTICAS: buses & bus_seats
-- ==============================================================================
CREATE POLICY "buses_select_authenticated" ON public.buses
  FOR SELECT TO authenticated, anon
  USING (is_active = true OR public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "buses_admin_operator_manage" ON public.buses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "bus_seats_select_public" ON public.bus_seats
  FOR SELECT TO authenticated, anon
  USING (is_active = true OR public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "bus_seats_admin_operator_manage" ON public.bus_seats
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

-- ==============================================================================
-- POLÍTICAS: drivers
-- ==============================================================================
CREATE POLICY "drivers_select_authenticated" ON public.drivers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "drivers_admin_operator_manage" ON public.drivers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

-- ==============================================================================
-- POLÍTICAS: trips & trip_fares (Búsqueda pública y programación)
-- ==============================================================================
CREATE POLICY "trips_select_public" ON public.trips
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL OR public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "trips_admin_operator_manage" ON public.trips
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "trip_fares_select_public" ON public.trip_fares
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "trip_fares_admin_operator_manage" ON public.trip_fares
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

-- ==============================================================================
-- POLÍTICAS: bookings & booking_seats (Aislamiento de pasajeros)
-- ==============================================================================
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    passenger_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin', 'operator', 'seller')
  );

CREATE POLICY "bookings_insert_authenticated" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    passenger_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin', 'seller')
  );

CREATE POLICY "bookings_update_own" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    passenger_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin', 'seller', 'operator')
  )
  WITH CHECK (
    passenger_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin', 'seller', 'operator')
  );

CREATE POLICY "booking_seats_select" ON public.booking_seats
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "booking_seats_insert" ON public.booking_seats
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (b.passenger_id = auth.uid() OR public.has_role(auth.uid(), 'admin', 'seller'))
    )
  );

-- ==============================================================================
-- POLÍTICAS: payments
-- ==============================================================================
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (b.passenger_id = auth.uid() OR public.has_role(auth.uid(), 'admin', 'seller'))
    )
  );

CREATE POLICY "payments_insert_authenticated" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (b.passenger_id = auth.uid() OR public.has_role(auth.uid(), 'admin', 'seller'))
    )
  );

-- ==============================================================================
-- POLÍTICAS: tickets (Inspección y Pasajeros - ADR-002)
-- ==============================================================================
CREATE POLICY "tickets_select_own_or_staff" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    passenger_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin', 'operator', 'seller', 'inspector')
  );

CREATE POLICY "tickets_inspector_update" ON public.tickets
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'inspector'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'inspector'));

-- ==============================================================================
-- POLÍTICAS: incidents
-- ==============================================================================
CREATE POLICY "incidents_select_staff" ON public.incidents
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator', 'inspector'));

CREATE POLICY "incidents_insert_staff" ON public.incidents
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator', 'inspector'));

CREATE POLICY "incidents_update_staff" ON public.incidents
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

-- ==============================================================================
-- POLÍTICAS: audit_logs (Solo administradores)
-- ==============================================================================
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_logs_insert_system" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);
-- ==============================================================================
-- RUTA NORTE — MIGRACIÓN 003: FUNCIONES TRANSACCIONALES Y TRIGGERS
-- Motor: Supabase PostgreSQL 15+
-- ==============================================================================

-- 1. Función trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Función trigger para vincular nuevos usuarios de auth.users a profiles con rol passenger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_passenger_role_id UUID;
BEGIN
  -- Crear perfil en public.profiles
  INSERT INTO public.profiles (id, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Asignar rol passenger por defecto
  SELECT id INTO v_passenger_role_id FROM public.roles WHERE name = 'passenger' LIMIT 1;
  IF v_passenger_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, v_passenger_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sobre auth.users (Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. FUNCIÓN TRANSACCIONAL: reserve_seats (Anti Doble Venta y Bloqueo Seguro)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.reserve_seats(
  p_trip_id UUID,
  p_passenger_id UUID,
  p_origin_stop_id UUID,
  p_destination_stop_id UUID,
  p_seat_ids UUID[],
  p_expires_minutes INTEGER DEFAULT 10
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_fare_price NUMERIC(10, 2);
  v_total_amount NUMERIC(10, 2);
  v_seat_count INTEGER;
  v_occupied_count INTEGER;
  v_seat_id UUID;
  v_trip_status trip_status;
BEGIN
  -- Validar que el viaje exista y esté programado
  SELECT status INTO v_trip_status
  FROM public.trips
  WHERE id = p_trip_id AND deleted_at IS NULL;

  IF v_trip_status IS NULL THEN
    RAISE EXCEPTION 'VIAJE_NO_ENCONTRADO';
  END IF;

  IF v_trip_status <> 'scheduled' AND v_trip_status <> 'boarding' THEN
    RAISE EXCEPTION 'VIAJE_NO_DISPONIBLE_PARA_VENTA';
  END IF;

  v_seat_count := array_length(p_seat_ids, 1);
  IF v_seat_count IS NULL OR v_seat_count < 1 OR v_seat_count > 4 THEN
    RAISE EXCEPTION 'CANTIDAD_ASIENTOS_INVALIDA (Debe ser entre 1 y 4)';
  END IF;

  -- Obtener tarifa del tramo
  SELECT price INTO v_fare_price
  FROM public.trip_fares
  WHERE trip_id = p_trip_id
    AND origin_stop_id = p_origin_stop_id
    AND destination_stop_id = p_destination_stop_id
  LIMIT 1;

  IF v_fare_price IS NULL THEN
    -- Tarifa por defecto de respaldo si no hay tarifa específica por tramo
    v_fare_price := 2.50;
  END IF;

  v_total_amount := v_fare_price * v_seat_count;

  -- BLOQUEO TRANSACCIONAL: Bloquear los asientos físicos correspondientes en bus_seats
  PERFORM bs.id
  FROM public.bus_seats bs
  WHERE bs.id = ANY(p_seat_ids)
  FOR UPDATE;

  -- Comprobar si alguno de los asientos ya está vendido o tiene una reserva pendiente activa
  SELECT COUNT(*) INTO v_occupied_count
  FROM public.booking_seats bs
  JOIN public.bookings b ON bs.booking_id = b.id
  WHERE b.trip_id = p_trip_id
    AND bs.bus_seat_id = ANY(p_seat_ids)
    AND (
      bs.status = 'sold'
      OR (bs.status = 'reserved' AND b.status = 'pending' AND b.expires_at > now())
    );

  IF v_occupied_count > 0 THEN
    RAISE EXCEPTION 'ASIENTO_YA_OCUPADO';
  END IF;

  -- Crear la reserva con expiración temporal (ADR-001)
  INSERT INTO public.bookings (
    trip_id,
    passenger_id,
    origin_stop_id,
    destination_stop_id,
    status,
    expires_at,
    total_amount
  ) VALUES (
    p_trip_id,
    p_passenger_id,
    p_origin_stop_id,
    p_destination_stop_id,
    'pending',
    now() + (p_expires_minutes || ' minutes')::INTERVAL,
    v_total_amount
  ) RETURNING id INTO v_booking_id;

  -- Insertar los asientos asociados a la reserva
  FOREACH v_seat_id IN ARRAY p_seat_ids LOOP
    INSERT INTO public.booking_seats (booking_id, bus_seat_id, status)
    VALUES (v_booking_id, v_seat_id, 'reserved');
  END LOOP;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. FUNCIÓN TRANSACCIONAL: confirm_booking_on_payment (Venta y Emisión de Boletos)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.confirm_booking_on_payment(
  p_booking_id UUID,
  p_payment_method payment_method,
  p_simulated_reference TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_booking RECORD;
  v_seat RECORD;
  v_qr_token TEXT;
  v_qr_payload JSONB;
  v_ticket_count INTEGER := 0;
BEGIN
  -- Bloquear la reserva para actualización
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RESERVA_NO_ENCONTRADA';
  END IF;

  -- Validar que esté pendiente
  IF v_booking.status <> 'pending' THEN
    RAISE EXCEPTION 'ESTADO_RESERVA_INVALIDO (%)', v_booking.status;
  END IF;

  -- Validar expiración (ADR-001)
  IF v_booking.expires_at <= now() THEN
    UPDATE public.bookings SET status = 'expired' WHERE id = p_booking_id;
    UPDATE public.booking_seats SET status = 'cancelled' WHERE booking_id = p_booking_id;
    RAISE EXCEPTION 'RESERVA_EXPIRADA';
  END IF;

  -- Confirmar la reserva
  UPDATE public.bookings
  SET status = 'confirmed', updated_at = now()
  WHERE id = p_booking_id;

  -- Actualizar asientos a 'sold'
  UPDATE public.booking_seats
  SET status = 'sold'
  WHERE booking_id = p_booking_id;

  -- Registrar pago simulado
  INSERT INTO public.payments (
    booking_id,
    amount,
    method,
    status,
    simulated_reference,
    processed_at
  ) VALUES (
    p_booking_id,
    v_booking.total_amount,
    p_payment_method,
    'completed',
    p_simulated_reference,
    now()
  );

  -- Emisión de boletos con token opaco seguro (ADR-002)
  FOR v_seat IN (
    SELECT bs.bus_seat_id, s.seat_number
    FROM public.booking_seats bs
    JOIN public.bus_seats s ON bs.bus_seat_id = s.id
    WHERE bs.booking_id = p_booking_id
  ) LOOP
    -- Generar token opaco de verificación (UUID v4 + sha256)
    v_qr_token := 'RN-' || upper(substr(encode(gen_random_bytes(16), 'hex'), 1, 16));

    -- Payload mínimo sin PII
    v_qr_payload := jsonb_build_object(
      'trip_id', v_booking.trip_id,
      'seat_number', v_seat.seat_number,
      'valid_for_departure', (SELECT departure_time FROM public.trips WHERE id = v_booking.trip_id),
      'checksum', encode(digest(v_qr_token || v_booking.trip_id::text, 'sha256'), 'hex')
    );

    INSERT INTO public.tickets (
      booking_id,
      bus_seat_id,
      passenger_id,
      qr_code,
      qr_payload,
      status
    ) VALUES (
      p_booking_id,
      v_seat.bus_seat_id,
      v_booking.passenger_id,
      v_qr_token,
      v_qr_payload,
      'issued'
    );

    v_ticket_count := v_ticket_count + 1;
  END LOOP;

  -- Actualizar asientos disponibles en el viaje
  PERFORM public.sync_trip_available_seats(v_booking.trip_id);

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'tickets_issued', v_ticket_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 5. FUNCIÓN IDEMPOTENTE: expire_pending_bookings (ADR-001)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.expire_pending_bookings()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_trip_rec RECORD;
BEGIN
  -- Actualizar reservas expiradas utilizando SKIP LOCKED para no colisionar con reservas en confirmación
  WITH expired AS (
    SELECT id, trip_id
    FROM public.bookings
    WHERE status = 'pending'
      AND expires_at < now()
    FOR UPDATE SKIP LOCKED
  ),
  updated_bookings AS (
    UPDATE public.bookings b
    SET status = 'expired', updated_at = now()
    FROM expired e
    WHERE b.id = e.id
    RETURNING b.id, b.trip_id
  ),
  cancelled_seats AS (
    UPDATE public.booking_seats bs
    SET status = 'cancelled'
    FROM updated_bookings ub
    WHERE bs.booking_id = ub.id
    RETURNING bs.id
  )
  SELECT count(*) INTO v_expired_count FROM updated_bookings;

  -- Sincronizar available_seats para los viajes afectados
  FOR v_trip_rec IN (
    SELECT DISTINCT trip_id FROM public.bookings WHERE status = 'expired' AND updated_at >= now() - interval '1 minute'
  ) LOOP
    PERFORM public.sync_trip_available_seats(v_trip_rec.trip_id);
  END LOOP;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. FUNCIÓN DE VALIDACIÓN DE EMBARQUE (ADR-002: Anti Doble Uso)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.validate_ticket_qr(
  p_qr_code TEXT,
  p_trip_id UUID,
  p_inspector_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_ticket RECORD;
BEGIN
  -- Buscar y bloquear el boleto
  SELECT t.*, s.seat_number, p.full_name as passenger_name
  INTO v_ticket
  FROM public.tickets t
  JOIN public.bus_seats s ON t.bus_seat_id = s.id
  LEFT JOIN public.profiles p ON t.passenger_id = p.id
  WHERE t.qr_code = p_qr_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', 'BOLETO_NO_ENCONTRADO',
      'message', 'El código QR no corresponde a ningún boleto registrado.'
    );
  END IF;

  -- Comprobar si corresponde a este viaje
  IF (v_ticket.qr_payload->>'trip_id')::UUID <> p_trip_id THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', 'VIAJE_NO_COINCIDE',
      'message', 'El boleto no corresponde al viaje en curso.'
    );
  END IF;

  -- Comprobar si ya fue utilizado (Anti doble embarque)
  IF v_ticket.status = 'used' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', 'BOLETO_YA_UTILIZADO',
      'message', 'Este boleto ya fue validado previamente el ' || to_char(v_ticket.boarded_at, 'DD/MM/YYYY HH24:MI'),
      'boarded_at', v_ticket.boarded_at
    );
  END IF;

  -- Comprobar si fue cancelado
  IF v_ticket.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'code', 'BOLETO_CANCELADO',
      'message', 'Este boleto se encuentra cancelado.'
    );
  END IF;

  -- Validar y marcar embarque
  UPDATE public.tickets
  SET
    status = 'used',
    boarded_at = now(),
    boarded_by = p_inspector_id
  WHERE id = v_ticket.id;

  RETURN jsonb_build_object(
    'valid', true,
    'code', 'EMBARQUE_EXITOSO',
    'message', 'Embarque validado correctamente.',
    'seat_number', v_ticket.seat_number,
    'boarded_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. FUNCIÓN AUXILIAR: Sincronización de available_seats en viajes
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.sync_trip_available_seats(p_trip_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_bus_seats INTEGER;
  v_occupied_seats INTEGER;
BEGIN
  -- Obtener capacidad total del bus asignado al viaje
  SELECT b.total_seats INTO v_total_bus_seats
  FROM public.trips t
  JOIN public.buses b ON t.bus_id = b.id
  WHERE t.id = p_trip_id;

  IF v_total_bus_seats IS NULL THEN
    RETURN;
  END IF;

  -- Contar asientos vendidos o con reserva pendiente vigente
  SELECT count(*) INTO v_occupied_seats
  FROM public.booking_seats bs
  JOIN public.bookings b ON bs.booking_id = b.id
  WHERE b.trip_id = p_trip_id
    AND (
      bs.status = 'sold'
      OR (bs.status = 'reserved' AND b.status = 'pending' AND b.expires_at > now())
    );

  -- Actualizar columna available_seats
  UPDATE public.trips
  SET available_seats = GREATEST(0, v_total_bus_seats - v_occupied_seats)
  WHERE id = p_trip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==============================================================================
-- RUTA NORTE — MIGRACIÓN 004: COOPERATIVAS Y MEJORAS DE GESTIÓN OPERATIVA
-- ==============================================================================

-- 1. Tabla: cooperatives (Cooperativas de transporte interparroquial)
CREATE TABLE IF NOT EXISTS public.cooperatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ruc TEXT UNIQUE NOT NULL CHECK (length(ruc) = 13),
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS para cooperatives
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cooperatives_select_public" ON public.cooperatives
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin', 'operator'));

CREATE POLICY "cooperatives_admin_operator_manage" ON public.cooperatives
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin', 'operator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin', 'operator'));

-- Asegurar columna is_demo en profiles si la tabla ya fue creada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false NOT NULL;

-- 2. Añadir columnas a buses para vinculación de cooperativa, disco y estado operativo
ALTER TABLE public.buses
  ADD COLUMN IF NOT EXISTS cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_number TEXT,
  ADD COLUMN IF NOT EXISTS chassis TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive'));

-- 3. Añadir columnas a drivers para cédula, nombre directo y estado operativo
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS id_card TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- Permitir que profile_id sea opcional para choferes registrados directamente por la cooperativa
ALTER TABLE public.drivers ALTER COLUMN profile_id DROP NOT NULL;

-- 4. Añadir columna base_fare a routes si no existe
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS base_fare NUMERIC(10, 2) DEFAULT 2.50 CHECK (base_fare >= 0);

-- 5. Función SQL para generar automáticamente asientos a partir de layout_config JSONB (ADR-003)
CREATE OR REPLACE FUNCTION public.generate_bus_seats(p_bus_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_bus RECORD;
  v_rows INT;
  v_cols INT;
  v_col_labels JSONB;
  v_r INT;
  v_c INT;
  v_col_name TEXT;
  v_seat_num TEXT;
  v_seat_type seat_type;
  v_created_count INT := 0;
BEGIN
  SELECT * INTO v_bus FROM public.buses WHERE id = p_bus_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'BUS_NO_ENCONTRADO';
  END IF;

  v_rows := COALESCE((v_bus.layout_config->>'rows')::INT, 10);
  v_cols := COALESCE((v_bus.layout_config->>'columns')::INT, 4);
  v_col_labels := v_bus.layout_config->'column_labels';

  -- Iterar por filas y columnas
  FOR v_r IN 1..v_rows LOOP
    FOR v_c IN 1..v_cols LOOP
      -- Obtener letra de columna si existe en el JSONB
      IF v_col_labels IS NOT NULL AND jsonb_array_length(v_col_labels) >= v_c THEN
        v_col_name := v_col_labels->>(v_c - 1);
      ELSE
        IF v_c = 1 THEN v_col_name := 'A';
        ELSIF v_c = 2 THEN v_col_name := 'B';
        ELSIF v_c = 3 THEN v_col_name := 'C';
        ELSE v_col_name := 'D';
        END IF;
      END IF;

      -- Saltar si es pasillo ("_")
      IF v_col_name <> '_' THEN
        v_seat_num := v_r || v_col_name;

        -- Determinar tipo de asiento
        IF v_r = 1 AND (v_col_name = 'A' OR v_col_name = 'B') THEN
          v_seat_type := 'accessibility';
        ELSE
          v_seat_type := 'standard';
        END IF;

        INSERT INTO public.bus_seats (
          bus_id,
          seat_number,
          seat_row,
          seat_column,
          seat_type,
          is_active
        ) VALUES (
          p_bus_id,
          v_seat_num,
          v_r,
          v_c,
          v_seat_type,
          true
        )
        ON CONFLICT (bus_id, seat_number) DO NOTHING;

        v_created_count := v_created_count + 1;
      END IF;
    END LOOP;
  END LOOP;

  -- Actualizar capacidad total calculada
  UPDATE public.buses
  SET total_seats = (SELECT COUNT(*) FROM public.bus_seats WHERE bus_id = p_bus_id)
  WHERE id = p_bus_id;

  RETURN v_created_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
