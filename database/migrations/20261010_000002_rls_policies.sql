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
