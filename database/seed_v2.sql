-- ==============================================================================
-- RUTA NORTE 2.0 (VISUAL EDITION) — DATOS SEMILLA MAESTROS (5 TABLAS)
-- Carchi e Imbabura, Ecuador
-- ==============================================================================

-- 1. USUARIOS DE DEMOSTRACIÓN (3 ROLES)
-- Contraseñas hasheadas con bcrypt o texto para auth rápida
INSERT INTO public.users (id, full_name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Administrador General', 'admin@rutanorte.ec', crypt('Admin123!', gen_salt('bf')), 'ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'Taquillero de Estación', 'taquilla@rutanorte.ec', crypt('Staff123!', gen_salt('bf')), 'STAFF'),
  ('00000000-0000-0000-0000-000000000003', 'Pasajero Frecuente', 'pasajero@rutanorte.ec', crypt('Pasajero123!', gen_salt('bf')), 'PASSENGER')
ON CONFLICT (email) DO NOTHING;

-- 2. 9 CIUDADES CON TERMINALES (CORREDOR NORTE E35)
INSERT INTO public.cities (id, name, province, terminal_name, image_url) VALUES
  -- CARCHI
  (1, 'Tulcán', 'Carchi', 'Terminal Terrestre de Tulcán', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Tulcan-Cemetery-1.jpg/800px-Tulcan-Cemetery-1.jpg'),
  (2, 'Julio Andrade', 'Carchi', 'Terminal Parroquial Julio Andrade', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vista_desde_Julio_Andrade%2C_Provincia_de_Carchi%2C_Ecuador%2C_2015-07-21%2C_DD_41.JPG/800px-Vista_desde_Julio_Andrade%2C_Provincia_de_Carchi%2C_Ecuador%2C_2015-07-21%2C_DD_41.JPG'),
  (3, 'San Gabriel', 'Carchi', 'Terminal Terrestre San Gabriel', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Parque_de_San_Gabriel%2C_Carchi%2C_Ecuador.jpg/800px-Parque_de_San_Gabriel%2C_Carchi%2C_Ecuador.jpg'),
  (4, 'Bolívar', 'Carchi', 'Terminal Cantonal Bolívar', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Monumento_a_Sim%C3%B3n_Bol%C3%ADvar_en_parque_de_Bol%C3%ADvar%2C_Carchi-_Ecuador.jpg/800px-Monumento_a_Sim%C3%B3n_Bol%C3%ADvar_en_parque_de_Bol%C3%ADvar%2C_Carchi-_Ecuador.jpg'),
  (5, 'El Ángel', 'Carchi', 'Terminal Terrestre El Ángel', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Frailejones_Reserva_Ecol%C3%B3gica_El_%C3%81ngel_-_panoramio.jpg/800px-Frailejones_Reserva_Ecol%C3%B3gica_El_%C3%81ngel_-_panoramio.jpg'),
  -- IMBABURA
  (6, 'Ibarra', 'Imbabura', 'Terminal Terrestre de Ibarra', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Yahuarcocha.jpg/800px-Yahuarcocha.jpg'),
  (7, 'Atuntaqui', 'Imbabura', 'Terminal Intercantonal Atuntaqui', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/F%C3%A1brica_Imbabura%2C_Atuntaqui.jpg/800px-F%C3%A1brica_Imbabura%2C_Atuntaqui.jpg'),
  (8, 'Otavalo', 'Imbabura', 'Terminal Terrestre de Otavalo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Mercado_de_los_Ponchos.jpg/800px-Mercado_de_los_Ponchos.jpg'),
  (9, 'Cotacachi', 'Imbabura', 'Terminal Terrestre Cotacachi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Cuicocha%2C_Ecuador.jpg/800px-Cuicocha%2C_Ecuador.jpg')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  province = EXCLUDED.province,
  terminal_name = EXCLUDED.terminal_name,
  image_url = EXCLUDED.image_url;

-- Ajustar secuencia serial de cities
SELECT setval('cities_id_seq', (SELECT MAX(id) FROM public.cities));

-- 3. 6 BUSES DE COOPERATIVAS REALES DEL NORTE (40 ASIENTOS ESTÁNDAR)
INSERT INTO public.buses (id, cooperative_name, unit_number, plate, photo_url, capacity) VALUES
  (1, 'Velotax del Norte', 'Disco 12', 'CAA-1020', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80', 40),
  (2, 'Expreso Tulcán', 'Disco 05', 'CAA-2345', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80', 40),
  (3, 'Flota Imbabura', 'Disco 44', 'IAC-3456', 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=800&q=80', 40),
  (4, 'Cooperativa Espejo', 'Disco 08', 'CAA-4567', 'https://images.unsplash.com/photo-1520105072000-f44fc083e508?auto=format&fit=crop&w=800&q=80', 40),
  (5, '24 de Septiembre', 'Disco 19', 'CAA-5678', 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=800&q=80', 40),
  (6, 'Transportes Otavalo', 'Disco 27', 'IAC-6789', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', 40)
ON CONFLICT (id) DO UPDATE SET
  cooperative_name = EXCLUDED.cooperative_name,
  unit_number = EXCLUDED.unit_number,
  plate = EXCLUDED.plate,
  photo_url = EXCLUDED.photo_url,
  capacity = 40;

-- Ajustar secuencia serial de buses
SELECT setval('buses_id_seq', (SELECT MAX(id) FROM public.buses));

-- 4. SALIDAS DINÁMICAS (TRIPS) PARA HOY Y LOS PRÓXIMOS 7 DÍAS
DO $$
DECLARE
  day_offset INT;
  curr_date DATE;
  t_id UUID;
  b_id INT;
  orig INT;
  dest INT;
  trip_price NUMERIC(6,2);
  s_num INT;
  token_str TEXT;
BEGIN
  -- Limpiar salidas previas de prueba si existen
  DELETE FROM public.tickets;
  DELETE FROM public.trips;

  FOR day_offset IN 0..7 LOOP
    curr_date := CURRENT_DATE + day_offset;

    -- Par 1: Tulcán (1) -> Ibarra (6)
    -- MAÑANA (07:30)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 1, 6, 1, curr_date, '07:30:00', 'MORNING', 3.75);

    -- Vender algunos asientos de muestra para poblar el mapa
    INSERT INTO public.tickets (trip_id, passenger_name, seat_number, qr_token, status) VALUES
      (t_id, 'Carlos Morales', 3, 'RN-' || upper(substr(md5(random()::text), 1, 12)), 'PAID'),
      (t_id, 'María Benavides', 4, 'RN-' || upper(substr(md5(random()::text), 1, 12)), 'PAID'),
      (t_id, 'Juan Carlos Ruano', 12, 'RN-' || upper(substr(md5(random()::text), 1, 12)), 'BOARDED'),
      (t_id, 'Lucía Chuga', 15, 'RN-' || upper(substr(md5(random()::text), 1, 12)), 'PAID');

    -- TARDE (14:15)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 1, 6, 2, curr_date, '14:15:00', 'AFTERNOON', 3.75);

    INSERT INTO public.tickets (trip_id, passenger_name, seat_number, qr_token, status) VALUES
      (t_id, 'Ana Fueltala', 7, 'RN-' || upper(substr(md5(random()::text), 1, 12)), 'PAID'),
      (t_id, 'Pedro Cuasquer', 8, 'RN-' || upper(substr(md5(random()::text), 1, 12)), 'PAID');

    -- NOCHE (19:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 1, 6, 3, curr_date, '19:00:00', 'NIGHT', 4.00);

    -- Par 2: Ibarra (6) -> Otavalo (8)
    -- MAÑANA (08:30)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 8, 4, curr_date, '08:30:00', 'MORNING', 1.50);

    -- TARDE (15:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 8, 5, curr_date, '15:00:00', 'AFTERNOON', 1.50);

    -- NOCHE (18:45)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 8, 6, curr_date, '18:45:00', 'NIGHT', 1.75);

    -- Par 3: Tulcán (1) -> San Gabriel (3)
    -- MAÑANA (06:45)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 1, 3, 2, curr_date, '06:45:00', 'MORNING', 1.75);

    -- TARDE (13:30)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 1, 3, 1, curr_date, '13:30:00', 'AFTERNOON', 1.75);

    -- Par 4: Otavalo (8) -> Cotacachi (9)
    -- MAÑANA (09:15)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 8, 9, 6, curr_date, '09:15:00', 'MORNING', 1.50);

    -- TARDE (16:30)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 8, 9, 5, curr_date, '16:30:00', 'AFTERNOON', 1.50);

    -- Par 5: Ibarra (6) -> Tulcán (1) Retorno
    -- MAÑANA (08:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 1, 3, curr_date, '08:00:00', 'MORNING', 3.75);

    -- TARDE (14:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 1, 4, curr_date, '14:00:00', 'AFTERNOON', 3.75);

    -- NOCHE (19:30)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 1, 1, curr_date, '19:30:00', 'NIGHT', 4.00);

    -- Par 6: Ibarra (6) -> Atuntaqui (7)
    -- MAÑANA (10:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 7, 5, curr_date, '10:00:00', 'MORNING', 1.50);

    -- TARDE (17:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 6, 7, 6, curr_date, '17:00:00', 'AFTERNOON', 1.50);

    -- Par 7: San Gabriel (3) -> Bolívar (4)
    -- MAÑANA (09:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 3, 4, 2, curr_date, '09:00:00', 'MORNING', 1.50);

    -- Par 8: El Ángel (5) -> Ibarra (6)
    -- MAÑANA (07:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 5, 6, 4, curr_date, '07:00:00', 'MORNING', 2.50);

    -- TARDE (13:00)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 5, 6, 3, curr_date, '13:00:00', 'AFTERNOON', 2.50);

    -- Par 9: Tulcán (1) -> Julio Andrade (2)
    -- MAÑANA (06:30)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 1, 2, 1, curr_date, '06:30:00', 'MORNING', 1.50);

    -- TARDE (15:30)
    t_id := gen_random_uuid();
    INSERT INTO public.trips (id, origin_city_id, destination_city_id, bus_id, departure_date, departure_time, shift, price)
    VALUES (t_id, 1, 2, 2, curr_date, '15:30:00', 'AFTERNOON', 1.50);

  END LOOP;
END $$;
