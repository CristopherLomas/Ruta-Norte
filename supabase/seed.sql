-- ==============================================================================
-- RUTA NORTE — SEED DATA OFICIAL Y REALISTA (NORTE DE ECUADOR / CARCHI & IMBABURA)
-- ADR-004: Cuentas de demostración seguras identificadas como demo
-- ==============================================================================

-- 1. ROLES CON UUIDS FIJOS
INSERT INTO public.roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrador general del sistema con control total'),
  ('00000000-0000-0000-0000-000000000002', 'operator', 'Operador de flota, rutas, buses, conductores y programación de viajes'),
  ('00000000-0000-0000-0000-000000000003', 'seller', 'Vendedor de taquilla y emisión presencial de boletos'),
  ('00000000-0000-0000-0000-000000000004', 'inspector', 'Inspector de ruta y control de embarque mediante escaneo QR'),
  ('00000000-0000-0000-0000-000000000005', 'passenger', 'Pasajero con acceso a búsqueda, reserva y sus propios boletos')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. COOPERATIVAS DE TRANSPORTE REALES DEL NORTE DE ECUADOR
INSERT INTO public.cooperatives (id, name, ruc, phone, address, is_active) VALUES
  ('11000000-0000-0000-0000-000000000001', 'Cooperativa Pullman Carchi', '0490012345001', '062980123', 'Av. Veintimilla y Pichincha, Tulcán', true),
  ('11000000-0000-0000-0000-000000000002', 'Transportes Norte', '1091723456001', '062951456', 'Av. Mariano Acosta y Fray Vacas Galindo, Ibarra', true),
  ('11000000-0000-0000-0000-000000000003', 'Expreso Tulcán', '0490078912001', '062981789', 'Terminal Terrestre de Tulcán, Andén 4', true),
  ('11000000-0000-0000-0000-000000000004', 'Cooperativa de Transportes Mira', '0490034567001', '062280234', 'Calle Eugenio Espejo y Bolívar, Mira', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  ruc = EXCLUDED.ruc;

-- 3. LOCALIDADES Y PARROQUIAS
INSERT INTO public.localities (id, name, parish, canton, province, latitude, longitude, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Tulcán Centro', 'González Suárez', 'Tulcán', 'Carchi', 0.8119, -77.7173, true),
  ('10000000-0000-0000-0000-000000000002', 'Julio Andrade', 'Julio Andrade', 'Tulcán', 'Carchi', 0.6722, -77.7125, true),
  ('10000000-0000-0000-0000-000000000003', 'San Gabriel', 'San Gabriel', 'Montúfar', 'Carchi', 0.6019, -77.8306, true),
  ('10000000-0000-0000-0000-000000000004', 'El Ángel', 'El Ángel', 'Espejo', 'Carchi', 0.6231, -77.9397, true),
  ('10000000-0000-0000-0000-000000000005', 'San Pedro de Huaca', 'Huaca', 'Huaca', 'Carchi', 0.6358, -77.7275, true),
  ('10000000-0000-0000-0000-000000000006', 'Mira', 'Mira', 'Mira', 'Carchi', 0.5519, -78.0397, true),
  ('10000000-0000-0000-0000-000000000007', 'Bolívar', 'Bolívar', 'Bolívar', 'Carchi', 0.5028, -77.9042, true)
ON CONFLICT (id) DO NOTHING;

-- 4. PARADAS Y TERMINALES
INSERT INTO public.stops (id, locality_id, name, address, latitude, longitude, is_active) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Terminal Terrestre de Tulcán', 'Av. 24 de Mayo y Panamericana Norte', 0.8125, -77.7180, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Parque Central Julio Andrade', 'Calle Sucre y Panamericana Sur', 0.6725, -77.7130, true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Terminal Terrestre San Gabriel', 'Calle González Suárez y Montúfar', 0.6025, -77.8310, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Terminal Cantonal El Ángel', 'Av. Espejo y 10 de Agosto', 0.6235, -77.9400, true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Parada Panamericana Huaca', 'Panamericana Norte km 24', 0.6360, -77.7280, true),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Parque Central de Mira', 'Calle Eugenio Espejo y Bolívar', 0.5522, -77.0400, true),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Parada Principal Bolívar', 'Calle García Moreno y Sucre', 0.5030, -77.9050, true)
ON CONFLICT (id) DO NOTHING;

-- 5. RUTAS INTERPARROQUIALES DEL CARCHI
INSERT INTO public.routes (id, name, code, origin_stop_id, destination_stop_id, distance_km, duration_min, base_fare, is_active) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Tulcán – Julio Andrade', 'RN-C01', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 18.5, 30, 0.75, true),
  ('30000000-0000-0000-0000-000000000002', 'Tulcán – San Gabriel', 'RN-C02', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 42.0, 50, 1.50, true),
  ('30000000-0000-0000-0000-000000000003', 'Tulcán – El Ángel', 'RN-C03', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 65.0, 75, 2.25, true),
  ('30000000-0000-0000-0000-000000000004', 'Tulcán – Huaca', 'RN-C04', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 26.0, 35, 1.00, true),
  ('30000000-0000-0000-0000-000000000005', 'Tulcán – Mira', 'RN-C05', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 78.0, 90, 2.50, true),
  ('30000000-0000-0000-0000-000000000006', 'Tulcán – Bolívar', 'RN-C06', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 52.0, 60, 1.75, true)
ON CONFLICT (id) DO NOTHING;

-- 6. UNIDADES / BUSES CON PLACAS ECUATORIANAS Y MATRIZ JSONB
INSERT INTO public.buses (id, cooperative_id, plate, unit_number, model, brand, year, total_seats, layout_config, status, is_active) VALUES
  ('40000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'CAA-0123', 'Disco 05', 'OF 1721', 'Mercedes-Benz', 2022, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"], "special_seats": [{"seat_number": "1A", "type": "accessibility"}, {"seat_number": "1B", "type": "accessibility"}]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'CAA-0456', 'Disco 12', 'AK8JRSA', 'Hino', 2023, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', 'PBC-4567', 'Disco 22', '17.230 OD', 'Volkswagen', 2021, 36, '{"rows": 9, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000002', 'PBC-8901', 'Disco 34', 'OF 1721', 'Mercedes-Benz', 2024, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000003', 'CAA-0789', 'Disco 03', 'AK8JRSA', 'Hino', 2022, 32, '{"rows": 8, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000003', 'CAA-0912', 'Disco 18', 'OF 1724', 'Mercedes-Benz', 2023, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000004', 'CAA-0345', 'Disco 08', 'AK8JRSA', 'Hino', 2021, 32, '{"rows": 8, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000008', '11000000-0000-0000-0000-000000000004', 'CAA-0678', 'Disco 15', '17.230 OD', 'Volkswagen', 2022, 36, '{"rows": 9, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 7. GENERACIÓN DE ASIENTOS FÍSICOS PARA LA UNIDAD 1 (CAA-0123)
DO $$
DECLARE
  r INT;
  c INT;
  c_label TEXT;
  seat_num TEXT;
  s_type seat_type;
BEGIN
  FOR r IN 1..10 LOOP
    FOR c IN 1..4 LOOP
      IF c = 1 THEN c_label := 'A';
      ELSIF c = 2 THEN c_label := 'B';
      ELSIF c = 3 THEN c_label := 'C';
      ELSE c_label := 'D';
      END IF;

      seat_num := r || c_label;
      IF r = 1 AND (c = 1 OR c = 2) THEN
        s_type := 'accessibility';
      ELSE
        s_type := 'standard';
      END IF;

      INSERT INTO public.bus_seats (bus_id, seat_number, seat_row, seat_column, seat_type, is_active)
      VALUES ('40000000-0000-0000-0000-000000000001', seat_num, r, c, s_type, true)
      ON CONFLICT (bus_id, seat_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 8. CONDUCTORES PROFESIONALES
INSERT INTO public.drivers (id, id_card, full_name, phone, license_number, license_category, license_expiry, status, is_available) VALUES
  ('50000000-0000-0000-0000-000000000001', '0401234567', 'Manuel Benalcázar', '0991234567', 'LIC-04012345', 'Tipo E', '2028-12-31', 'active', true),
  ('50000000-0000-0000-0000-000000000002', '0401876543', 'Carlos Chuga', '0987654321', 'LIC-04018765', 'Tipo D', '2027-06-30', 'active', true),
  ('50000000-0000-0000-0000-000000000003', '0401567890', 'Segundo Ruano', '0995551234', 'LIC-04015678', 'Tipo E', '2029-03-15', 'active', true),
  ('50000000-0000-0000-0000-000000000004', '1002345678', 'Geovanny Narváez', '0983334455', 'LIC-10023456', 'Tipo D', '2028-09-20', 'active', true),
  ('50000000-0000-0000-0000-000000000005', '0401998877', 'Wilson Portilla', '0997778899', 'LIC-04019988', 'Tipo E', '2027-11-10', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 9. PROGRAMACIÓN DE VIAJES CALENDARIZADOS (Salidas para hoy y los próximos días)
INSERT INTO public.trips (id, route_id, bus_id, driver_id, departure_time, arrival_time, status, available_seats) VALUES
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', now() + interval '1 hour', now() + interval '1 hour 30 minutes', 'scheduled', 40),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', now() + interval '2 hours', now() + interval '2 hours 50 minutes', 'boarding', 38),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', now() + interval '4 hours', now() + interval '5 hours 15 minutes', 'scheduled', 36),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', now() + interval '1 day', now() + interval '1 day 30 minutes', 'scheduled', 40),
  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', now() + interval '2 days', now() + interval '2 days 50 minutes', 'scheduled', 32)
ON CONFLICT (id) DO NOTHING;

-- 10. CUENTAS DEMO INICIALIZADAS CONFORME A ADR-004
-- Insertar primero en auth.users para satisfacer la clave foránea de profiles
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@rutanorte.ec', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Administrador General"}', now(), now()),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'operador@rutanorte.ec', crypt('Operador123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Operador de Flota"}', now(), now()),
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vendedor@rutanorte.ec', crypt('Vendedor123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vendedor Taquilla"}', now(), now()),
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'inspector@rutanorte.ec', crypt('Inspector123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Inspector de Ruta"}', now(), now()),
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pasajero@rutanorte.ec', crypt('Pasajero123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pasajero Frecuente"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Inserción / actualización en public.profiles
INSERT INTO public.profiles (id, full_name, phone, is_demo) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Administrador General (Demo)', '0990000001', true),
  ('00000000-0000-0000-0000-000000000020', 'Operador de Flota (Demo)', '0990000002', true),
  ('00000000-0000-0000-0000-000000000030', 'Vendedor Taquilla (Demo)', '0990000003', true),
  ('00000000-0000-0000-0000-000000000040', 'Inspector de Ruta (Demo)', '0990000004', true),
  ('00000000-0000-0000-0000-000000000050', 'Pasajero Frecuente (Demo)', '0990000005', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_demo = true;

-- Asignación explícita de roles de sistema
INSERT INTO public.user_roles (user_id, role_id) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001'), -- admin
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000002'), -- operator
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000003'), -- seller
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000004'), -- inspector
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000005')  -- passenger
ON CONFLICT (user_id, role_id) DO NOTHING;
