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
