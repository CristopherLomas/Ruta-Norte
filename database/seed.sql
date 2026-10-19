-- ==============================================================================
-- RUTA NORTE — SEED DATA MAESTRO Y REALISTA (NORTE DE ECUADOR / CARCHI & IMBABURA)
-- Generación completa de datos de demostración para 1 mes (hoy y próximos 30 días)
-- Incluye 14 rutas, 18 localidades, 18 paradas, 11 buses con 440 asientos,
-- 14 conductores, 260+ viajes dinámicos, tarifas, reservas, boletos QR, incidencias y auditoría.
-- ADR-001 (Reservas), ADR-002 (QR Opaco), ADR-003 (Asientos JSONB), ADR-004 (Cuentas Demo)
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

-- 3. LOCALIDADES Y PARROQUIAS (18 LOCALIDADES: 9 EN CARCHI Y 9 EN IMBABURA)
INSERT INTO public.localities (id, name, parish, canton, province, latitude, longitude, is_active) VALUES
  -- CARCHI
  ('10000000-0000-0000-0000-000000000001', 'Tulcán Centro', 'González Suárez', 'Tulcán', 'Carchi', 0.8119, -77.7173, true),
  ('10000000-0000-0000-0000-000000000002', 'Julio Andrade', 'Julio Andrade', 'Tulcán', 'Carchi', 0.6722, -77.7125, true),
  ('10000000-0000-0000-0000-000000000003', 'San Gabriel', 'San Gabriel', 'Montúfar', 'Carchi', 0.6019, -77.8306, true),
  ('10000000-0000-0000-0000-000000000004', 'El Ángel', 'El Ángel', 'Espejo', 'Carchi', 0.6231, -77.9397, true),
  ('10000000-0000-0000-0000-000000000005', 'San Pedro de Huaca', 'Huaca', 'Huaca', 'Carchi', 0.6358, -77.7275, true),
  ('10000000-0000-0000-0000-000000000006', 'Mira', 'Mira', 'Mira', 'Carchi', 0.5519, -78.0397, true),
  ('10000000-0000-0000-0000-000000000007', 'Bolívar', 'Bolívar', 'Bolívar', 'Carchi', 0.5028, -77.9042, true),
  ('10000000-0000-0000-0000-000000000008', 'La Paz', 'La Paz', 'Montúfar', 'Carchi', 0.5361, -77.8683, true),
  ('10000000-0000-0000-0000-000000000009', 'El Carmelo', 'El Carmelo', 'Tulcán', 'Carchi', 0.7258, -77.6186, true),
  -- IMBABURA
  ('10000000-0000-0000-0000-000000000010', 'Ibarra Centro', 'San Francisco', 'Ibarra', 'Imbabura', 0.3517, -78.1222, true),
  ('10000000-0000-0000-0000-000000000011', 'Otavalo', 'San Luis', 'Otavalo', 'Imbabura', 0.2339, -78.2622, true),
  ('10000000-0000-0000-0000-000000000012', 'Cotacachi', 'Sagrario', 'Cotacachi', 'Imbabura', 0.3014, -78.2644, true),
  ('10000000-0000-0000-0000-000000000013', 'San Antonio de Ibarra', 'San Antonio', 'Ibarra', 'Imbabura', 0.3236, -78.1469, true),
  ('10000000-0000-0000-0000-000000000014', 'Zuleta', 'Angochagua', 'Ibarra', 'Imbabura', 0.2458, -78.0778, true),
  ('10000000-0000-0000-0000-000000000015', 'Atuntaqui', 'Atuntaqui', 'Antonio Ante', 'Imbabura', 0.3325, -78.2144, true),
  ('10000000-0000-0000-0000-000000000016', 'Pimampiro', 'Pimampiro', 'Pimampiro', 'Imbabura', 0.3958, -77.9403, true),
  ('10000000-0000-0000-0000-000000000017', 'Ambuquí', 'Ambuquí', 'Ibarra', 'Imbabura', 0.4431, -78.0053, true),
  ('10000000-0000-0000-0000-000000000018', 'Ilumán', 'San Juan de Ilumán', 'Otavalo', 'Imbabura', 0.2717, -78.2433, true)
ON CONFLICT (id) DO NOTHING;

-- 4. PARADAS Y TERMINALES (18 PARADAS GEORREFERENCIADAS)
INSERT INTO public.stops (id, locality_id, name, address, latitude, longitude, is_active) VALUES
  -- Carchi
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Terminal Terrestre de Tulcán', 'Av. 24 de Mayo y Panamericana Norte', 0.8125, -77.7180, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Parque Central Julio Andrade', 'Calle Sucre y Panamericana Sur', 0.6725, -77.7130, true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Terminal Terrestre San Gabriel', 'Calle González Suárez y Montúfar', 0.6025, -77.8310, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Terminal Cantonal El Ángel', 'Av. Espejo y 10 de Agosto', 0.6235, -77.9400, true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Parada Panamericana Huaca', 'Panamericana Norte km 24', 0.6360, -77.7280, true),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Parque Central de Mira', 'Calle Eugenio Espejo y Bolívar', 0.5522, -78.0400, true),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Parada Principal Bolívar', 'Calle García Moreno y Sucre', 0.5030, -77.9050, true),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Santuario La Gruta de La Paz', 'Vía Interparroquial La Paz', 0.5372, -77.8655, true),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'Parada Fronteriza El Carmelo', 'Calle Principal El Carmelo', 0.7265, -77.6190, true),
  -- Imbabura
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'Terminal Terrestre de Ibarra', 'Av. Teodoro Gómez y Av. Eugenio Espejo', 0.3542, -78.1189, true),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'Terminal Terrestre de Otavalo', 'Calle Atahualpa y Av. Los Corazas', 0.2315, -78.2650, true),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'Terminal Intercantonal Cotacachi', 'Av. 10 de Agosto y Bolívar', 0.3022, -78.2635, true),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 'Plaza Central San Antonio de Ibarra', 'Calle Ramón Teanga y Bolívar', 0.3240, -78.1472, true),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000014', 'Parada Comunal Zuleta', 'Vía Principal Angochagua - Zuleta', 0.2465, -78.0772, true),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 'Parada Textil Atuntaqui', 'Av. Julio Miguel Aguinaga', 0.3330, -78.2140, true),
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'Parque Central de Pimampiro', 'Calle Bolívar y Flores', 0.3962, -77.9410, true),
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'Parador Turístico Ambuquí', 'Panamericana Norte Valle del Chota', 0.4435, -78.0060, true),
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'Parada Artesanal Ilumán', 'Panamericana Norte Entrada a Ilumán', 0.2720, -78.2430, true)
ON CONFLICT (id) DO NOTHING;

-- 5. RUTAS INTERPARROQUIALES (14 RUTAS REALES ENTRE CARCHI E IMBABURA)
INSERT INTO public.routes (id, name, code, origin_stop_id, destination_stop_id, distance_km, duration_min, base_fare, is_active) VALUES
  -- Corredores Carchi
  ('30000000-0000-0000-0000-000000000001', 'Tulcán – Julio Andrade', 'RN-C01', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 18.5, 30, 0.75, true),
  ('30000000-0000-0000-0000-000000000002', 'Tulcán – San Gabriel', 'RN-C02', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 42.0, 50, 1.50, true),
  ('30000000-0000-0000-0000-000000000003', 'Tulcán – El Ángel', 'RN-C03', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 65.0, 75, 2.25, true),
  ('30000000-0000-0000-0000-000000000004', 'Tulcán – Huaca', 'RN-C04', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 26.0, 35, 1.00, true),
  ('30000000-0000-0000-0000-000000000005', 'Tulcán – Mira', 'RN-C05', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 78.0, 90, 2.50, true),
  ('30000000-0000-0000-0000-000000000006', 'Tulcán – Bolívar', 'RN-C06', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 52.0, 60, 1.75, true),
  -- Corredores Interprovinciales Carchi - Imbabura
  ('30000000-0000-0000-0000-000000000007', 'Tulcán – Ibarra (Directo E35)', 'RN-CI01', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 125.0, 135, 3.75, true),
  ('30000000-0000-0000-0000-000000000008', 'San Gabriel – Ibarra', 'RN-CI02', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000010', 83.0, 90, 2.50, true),
  -- Corredores Imbabura
  ('30000000-0000-0000-0000-000000000009', 'Ibarra – Otavalo', 'RN-I01', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000011', 25.0, 30, 0.80, true),
  ('30000000-0000-0000-0000-000000000010', 'Ibarra – Cotacachi', 'RN-I02', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000012', 26.5, 35, 0.90, true),
  ('30000000-0000-0000-0000-000000000011', 'Ibarra – San Antonio de Ibarra', 'RN-I03', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000013', 7.0, 15, 0.45, true),
  ('30000000-0000-0000-0000-000000000012', 'Ibarra – Zuleta (Ruta Bordados)', 'RN-I04', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000014', 19.5, 40, 0.75, true),
  ('30000000-0000-0000-0000-000000000013', 'Otavalo – Cotacachi', 'RN-I05', '20000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000012', 12.0, 20, 0.50, true),
  ('30000000-0000-0000-0000-000000000014', 'Ibarra – Pimampiro', 'RN-I06', '20000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000016', 48.0, 65, 1.50, true)
ON CONFLICT (id) DO NOTHING;

-- 6. SECUENCIA DE PARADAS INTERMEDIAS (route_stops)
INSERT INTO public.route_stops (route_id, stop_id, sequence_order, distance_from_origin_km, time_from_origin_min, is_boarding_point, is_alighting_point) VALUES
  -- Tulcán – San Gabriel pasa por Huaca
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 1, 26.0, 30, true, true),
  -- Tulcán – Ibarra pasa por Huaca, San Gabriel, Bolívar y Ambuquí
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 1, 26.0, 30, true, true),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 2, 42.0, 50, true, true),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 3, 52.0, 65, true, true),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000017', 4, 95.0, 105, true, true),
  -- Ibarra – Otavalo pasa por San Antonio, Atuntaqui e Ilumán
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000013', 1, 7.0, 10, true, true),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000015', 2, 14.0, 18, true, true),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000018', 3, 20.0, 24, true, true)
ON CONFLICT (route_id, stop_id) DO NOTHING;

-- 7. UNIDADES / BUSES CON PLACAS ECUATORIANAS Y MATRIZ JSONB
INSERT INTO public.buses (id, cooperative_id, plate, unit_number, model, brand, year, total_seats, layout_config, status, is_active) VALUES
  ('40000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'CAA-0123', 'Disco 05', 'OF 1721', 'Mercedes-Benz', 2022, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"], "special_seats": [{"seat_number": "1A", "type": "accessibility"}, {"seat_number": "1B", "type": "accessibility"}]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'CAA-0456', 'Disco 12', 'AK8JRSA', 'Hino', 2023, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', 'PBC-4567', 'Disco 22', '17.230 OD', 'Volkswagen', 2021, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000002', 'PBC-8901', 'Disco 34', 'OF 1721', 'Mercedes-Benz', 2024, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000003', 'CAA-0789', 'Disco 03', 'AK8JRSA', 'Hino', 2022, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000003', 'CAA-0912', 'Disco 18', 'OF 1724', 'Mercedes-Benz', 2023, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000004', 'CAA-0345', 'Disco 08', 'AK8JRSA', 'Hino', 2021, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000008', '11000000-0000-0000-0000-000000000004', 'CAA-0678', 'Disco 15', '17.230 OD', 'Volkswagen', 2022, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000009', '11000000-0000-0000-0000-000000000002', 'IAC-1024', 'Disco 41', 'OF 1721', 'Mercedes-Benz', 2023, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000010', '11000000-0000-0000-0000-000000000001', 'CAA-1122', 'Disco 07', 'AK8JRSA', 'Hino', 2024, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'active', true),
  ('40000000-0000-0000-0000-000000000011', '11000000-0000-0000-0000-000000000003', 'CAA-3344', 'Disco 25', '17.230 OD', 'Volkswagen', 2020, 40, '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb, 'maintenance', true)
ON CONFLICT (id) DO NOTHING;

-- 8. GENERACIÓN AUTOMÁTICA DE ASIENTOS FÍSICOS (1A..10D = 440 ASIENTOS)
DO $$
DECLARE
  b_rec RECORD;
  r INT;
  c INT;
  c_label TEXT;
  seat_num TEXT;
  s_type seat_type;
BEGIN
  FOR b_rec IN SELECT id FROM public.buses LOOP
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
        VALUES (b_rec.id, seat_num, r, c, s_type, true)
        ON CONFLICT (bus_id, seat_number) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- 9. CONDUCTORES PROFESIONALES (14 CONDUCTORES)
INSERT INTO public.drivers (id, id_card, full_name, phone, license_number, license_category, license_expiry, status, is_available) VALUES
  ('50000000-0000-0000-0000-000000000001', '0401234567', 'Manuel Benalcázar', '0991234567', 'LIC-04012345', 'Tipo E', '2028-12-31', 'active', true),
  ('50000000-0000-0000-0000-000000000002', '0401876543', 'Carlos Fueltala', '0987654321', 'LIC-04018765', 'Tipo D', '2027-06-30', 'active', true),
  ('50000000-0000-0000-0000-000000000003', '0401567890', 'Segundo Cuasquer', '0995551234', 'LIC-04015678', 'Tipo E', '2029-03-15', 'active', true),
  ('50000000-0000-0000-0000-000000000004', '1002345678', 'Geovanny Narváez', '0983334455', 'LIC-10023456', 'Tipo D', '2028-09-20', 'active', true),
  ('50000000-0000-0000-0000-000000000005', '0401998877', 'Wilson Portilla', '0997778899', 'LIC-04019988', 'Tipo E', '2027-11-10', 'active', true),
  ('50000000-0000-0000-0000-000000000006', '1001928374', 'Héctor Maldonado', '0982223344', 'LIC-10019283', 'Tipo E', '2028-04-12', 'active', true),
  ('50000000-0000-0000-0000-000000000007', '0402837465', 'Luis Fernando Chuga', '0994445566', 'LIC-04028374', 'Tipo D', '2029-01-18', 'active', true),
  ('50000000-0000-0000-0000-000000000008', '1003847562', 'Jorge Imbaquingo', '0986667788', 'LIC-10038475', 'Tipo E', '2028-07-25', 'active', true),
  ('50000000-0000-0000-0000-000000000009', '0403728192', 'Marcelo Ruano', '0998889900', 'LIC-04037281', 'Tipo D', '2027-10-05', 'active', true),
  ('50000000-0000-0000-0000-000000000010', '1004928173', 'Franklin Anrango', '0981112233', 'LIC-10049281', 'Tipo E', '2029-05-30', 'active', true),
  ('50000000-0000-0000-0000-000000000011', '0404839201', 'Byron Revelo', '0993332211', 'LIC-04048392', 'Tipo D', '2028-08-14', 'active', true),
  ('50000000-0000-0000-0000-000000000012', '1005829103', 'Edgar Otavalo', '0985556677', 'LIC-10058291', 'Tipo E', '2027-12-22', 'active', true),
  ('50000000-0000-0000-0000-000000000013', '0405928174', 'Ramiro Cadena', '0996665544', 'LIC-04059281', 'Tipo D', '2028-11-03', 'active', true),
  ('50000000-0000-0000-0000-000000000014', '1006938201', 'Patricio Morales', '0987776655', 'LIC-10069382', 'Tipo E', '2029-02-28', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 10. CUENTAS DEMO INICIALIZADAS CONFORME A ADR-004
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@rutanorte.ec', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Administrador General"}', now(), now()),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'operador@rutanorte.ec', crypt('Operador123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Operador de Flota"}', now(), now()),
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vendedor@rutanorte.ec', crypt('Vendedor123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vendedor Taquilla"}', now(), now()),
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'inspector@rutanorte.ec', crypt('Inspector123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Inspector de Ruta"}', now(), now()),
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pasajero@rutanorte.ec', crypt('Pasajero123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pasajero Frecuente"}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, phone, is_demo) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Administrador General (Demo)', '0990000001', true),
  ('00000000-0000-0000-0000-000000000020', 'Operador de Flota (Demo)', '0990000002', true),
  ('00000000-0000-0000-0000-000000000030', 'Vendedor Taquilla (Demo)', '0990000003', true),
  ('00000000-0000-0000-0000-000000000040', 'Inspector de Ruta (Demo)', '0990000004', true),
  ('00000000-0000-0000-0000-000000000050', 'Pasajero Frecuente (Demo)', '0990000005', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_demo = true;

INSERT INTO public.user_roles (user_id, role_id) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001'), -- admin
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000002'), -- operator
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000003'), -- seller
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000004'), -- inspector
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000005')  -- passenger
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 11. GENERACIÓN DINÁMICA DE VIAJES CALENDARIZADOS (PASADOS, HOY Y PRÓXIMOS 30 DÍAS)
-- 8 salidas diarias (06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00) para las 14 rutas
DO $$
DECLARE
  v_day_offset INT;
  v_hour INT;
  v_hours INT[] := ARRAY[6, 8, 10, 12, 14, 16, 18, 20];
  v_h_idx INT;
  v_route_ids UUID[];
  v_bus_ids UUID[];
  v_driver_ids UUID[];
  v_route_id UUID;
  v_bus_id UUID;
  v_driver_id UUID;
  v_dep TIMESTAMPTZ;
  v_arr TIMESTAMPTZ;
  v_duration INT;
  v_status trip_status;
  v_seats INT;
  v_trip_counter INT := 1;
  v_trip_id UUID;
BEGIN
  -- Cargar arrays de IDs en memoria
  SELECT array_agg(id ORDER BY code) INTO v_route_ids FROM public.routes;
  SELECT array_agg(id ORDER BY plate) INTO v_bus_ids FROM public.buses WHERE status = 'active';
  SELECT array_agg(id ORDER BY id_card) INTO v_driver_ids FROM public.drivers WHERE status = 'active';

  -- Iterar desde 7 días en el pasado hasta 30 días en el futuro (1 mes completo)
  FOR v_day_offset IN -7..30 LOOP
    FOR v_h_idx IN 1..array_length(v_hours, 1) LOOP
      v_hour := v_hours[v_h_idx];
      
      -- Rotación consistente de ruta, bus y conductor
      v_route_id := v_route_ids[1 + ((abs(v_day_offset) + v_h_idx) % array_length(v_route_ids, 1))];
      v_bus_id := v_bus_ids[1 + ((v_h_idx + v_day_offset + 10) % array_length(v_bus_ids, 1))];
      v_driver_id := v_driver_ids[1 + ((v_h_idx * 2 + v_day_offset + 10) % array_length(v_driver_ids, 1))];

      -- Horarios de salida y llegada
      v_dep := (CURRENT_DATE + (v_day_offset || ' days')::INTERVAL) + (v_hour || ' hours')::INTERVAL;
      SELECT COALESCE(duration_min, 45) INTO v_duration FROM public.routes WHERE id = v_route_id;
      v_arr := v_dep + (v_duration || ' minutes')::INTERVAL;

      -- Determinación del estado del viaje relativo al momento actual
      IF v_dep < now() - INTERVAL '1 hour' THEN
        v_status := 'completed';
        v_seats := (v_trip_counter % 7); -- casi lleno
      ELSIF v_dep >= now() - INTERVAL '1 hour' AND v_dep <= now() + INTERVAL '1 hour' THEN
        v_status := 'boarding';
        v_seats := 12;
      ELSE
        v_status := 'scheduled';
        IF v_trip_counter % 5 = 0 THEN
          v_seats := 4;
        ELSIF v_trip_counter % 3 = 0 THEN
          v_seats := 22;
        ELSE
          v_seats := 36;
        END IF;
      END IF;

      -- ID determinista reproducible
      v_trip_id := ('60000000-0000-0000-0000-' || lpad(v_trip_counter::text, 12, '0'))::UUID;

      INSERT INTO public.trips (id, route_id, bus_id, driver_id, departure_time, arrival_time, status, available_seats)
      VALUES (v_trip_id, v_route_id, v_bus_id, v_driver_id, v_dep, v_arr, v_status, v_seats)
      ON CONFLICT (id) DO UPDATE SET
        departure_time = EXCLUDED.departure_time,
        arrival_time = EXCLUDED.arrival_time,
        status = EXCLUDED.status,
        available_seats = EXCLUDED.available_seats;

      v_trip_counter := v_trip_counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- 12. TARIFAS POR TRAYECTO (trip_fares)
INSERT INTO public.trip_fares (trip_id, origin_stop_id, destination_stop_id, price, currency)
SELECT 
  t.id AS trip_id,
  r.origin_stop_id,
  r.destination_stop_id,
  COALESCE(r.base_fare, 2.50) AS price,
  'USD' AS currency
FROM public.trips t
JOIN public.routes r ON r.id = t.route_id
ON CONFLICT (trip_id, origin_stop_id, destination_stop_id) DO NOTHING;

-- 13. RESERVAS, VENTAS, PAGOS SIMULADOS Y BOLETOS CON TOKENS QR OPACOS (ADR-001, ADR-002)
DO $$
DECLARE
  v_bIdx INT;
  v_booking_id UUID;
  v_trip RECORD;
  v_route RECORD;
  v_passenger_id UUID;
  v_seat RECORD;
  v_fare NUMERIC(10,2);
  v_status booking_status;
  v_seat_status booking_seat_status;
  v_expires TIMESTAMPTZ;
  v_pay_method payment_method;
  v_qr TEXT;
  v_hex TEXT;
  v_is_boarded BOOLEAN;
BEGIN
  -- Pasajero de demostración
  v_passenger_id := '00000000-0000-0000-0000-000000000050';

  -- Crear 120 reservas de muestra vinculadas a viajes del sistema
  FOR v_bIdx IN 1..120 LOOP
    v_booking_id := ('70000000-0000-0000-0000-' || lpad(v_bIdx::text, 12, '0'))::UUID;
    
    SELECT t.*, r.origin_stop_id, r.destination_stop_id, r.base_fare 
    INTO v_trip 
    FROM public.trips t
    JOIN public.routes r ON r.id = t.route_id
    WHERE t.id = ('60000000-0000-0000-0000-' || lpad((1 + (v_bIdx % 60))::text, 12, '0'))::UUID;

    IF FOUND THEN
      -- Seleccionar un asiento del bus del viaje
      SELECT * INTO v_seat FROM public.bus_seats WHERE bus_id = v_trip.bus_id LIMIT 1 OFFSET (v_bIdx % 30);
      v_fare := COALESCE(v_trip.base_fare, 2.50);

      -- Distribución de estados: 85 confirmadas, 20 expiradas, 15 pendientes
      IF v_bIdx <= 85 THEN
        v_status := 'confirmed';
        v_seat_status := 'sold';
        v_expires := now() - INTERVAL '2 hours';
      ELSIF v_bIdx <= 105 THEN
        v_status := 'expired';
        v_seat_status := 'cancelled';
        v_expires := now() - INTERVAL '30 minutes';
      ELSE
        v_status := 'pending';
        v_seat_status := 'reserved';
        v_expires := now() + INTERVAL '15 minutes';
      END IF;

      -- Insertar Reserva
      INSERT INTO public.bookings (id, trip_id, passenger_id, origin_stop_id, destination_stop_id, status, expires_at, total_amount)
      VALUES (v_booking_id, v_trip.id, v_passenger_id, v_trip.origin_stop_id, v_trip.destination_stop_id, v_status, v_expires, v_fare)
      ON CONFLICT (id) DO NOTHING;

      -- Insertar Asiento de Reserva
      IF v_seat.id IS NOT NULL THEN
        INSERT INTO public.booking_seats (booking_id, bus_seat_id, status)
        VALUES (v_booking_id, v_seat.id, v_seat_status)
        ON CONFLICT (booking_id, bus_seat_id) DO NOTHING;

        -- Si la reserva está confirmada, insertar pago y boleto con QR opaco
        IF v_status = 'confirmed' THEN
          IF v_bIdx % 3 = 0 THEN v_pay_method := 'simulated_cash';
          ELSIF v_bIdx % 2 = 0 THEN v_pay_method := 'simulated_card';
          ELSE v_pay_method := 'simulated_transfer';
          END IF;

          INSERT INTO public.payments (booking_id, amount, method, status, simulated_reference, processed_at)
          VALUES (v_booking_id, v_fare, v_pay_method, 'completed', 'PAY-RN-' || lpad(v_bIdx::text, 6, '0') || '-' || substr(md5(v_bIdx::text), 1, 6), now() - INTERVAL '1 hour');

          -- Token QR opaco conforme a ADR-002
          v_hex := upper(substr(md5(v_bIdx::text || 'rutanorte'), 1, 16));
          v_qr := 'RN-' || v_hex;
          v_is_boarded := (v_trip.status = 'completed') OR (v_trip.status = 'boarding' AND v_bIdx % 2 = 0);

          INSERT INTO public.tickets (booking_id, bus_seat_id, passenger_id, qr_code, qr_payload, status, issued_at, boarded_at, boarded_by)
          VALUES (
            v_booking_id,
            v_seat.id,
            v_passenger_id,
            v_qr,
            jsonb_build_object(
              'trip_id', v_trip.id,
              'seat_number', v_seat.seat_number,
              'valid_for_departure', v_trip.departure_time,
              'token_id', v_qr,
              'checksum', substr(md5(v_qr), 1, 8)
            ),
            CASE WHEN v_is_boarded THEN 'used'::ticket_status ELSE 'issued'::ticket_status END,
            now() - INTERVAL '1 hour',
            CASE WHEN v_is_boarded THEN now() - INTERVAL '15 minutes' ELSE NULL END,
            CASE WHEN v_is_boarded THEN '00000000-0000-0000-0000-000000000040'::UUID ELSE NULL END
          )
          ON CONFLICT (booking_id, bus_seat_id) DO NOTHING;
        END IF;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 14. INCIDENCIAS OPERATIVAS PARA MONITOREO
INSERT INTO public.incidents (trip_id, reported_by, type, severity, description, reported_at, resolved_at)
SELECT 
  t.id AS trip_id,
  '00000000-0000-0000-0000-000000000020'::UUID AS reported_by,
  inc.type::incident_type,
  inc.severity::incident_severity,
  inc.description,
  now() - (inc.hours_ago || ' hours')::INTERVAL,
  CASE WHEN inc.resolved THEN now() - ((inc.hours_ago - 1) || ' hours')::INTERVAL ELSE NULL END
FROM (
  VALUES 
    (1, 'delay', 'low', 'Retraso de 10 min por congestión en el peaje San Gabriel.', 24, true),
    (2, 'delay', 'medium', 'Lluvia intensa y neblina en el páramo de El Ángel.', 20, false),
    (3, 'breakdown', 'high', 'Falla menor de presión en el neumático trasero derecho. Reparado en andén.', 16, true),
    (4, 'other', 'low', 'Pasajero olvidó paquete en bandeja superior. Custodiado en oficina Tulcán.', 12, true),
    (5, 'delay', 'medium', 'Paso alternado por mantenimiento vial en Panamericana km 18.', 8, false),
    (6, 'breakdown', 'critical', 'Sobrecalentamiento de motor en unidad Disco 25. Unidad enviada a taller.', 6, false),
    (7, 'delay', 'low', 'Espera autorizada de 5 minutos por transbordo de estudiantes.', 4, true),
    (8, 'other', 'medium', 'Inspección de rutina por agentes de control de tránsito.', 2, true)
) AS inc(trip_num, type, severity, description, hours_ago, resolved)
JOIN public.trips t ON t.id = ('60000000-0000-0000-0000-' || lpad(inc.trip_num::text, 12, '0'))::UUID;

-- 15. TRAZABILIDAD Y REGISTROS DE AUDITORÍA (audit_logs)
INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, created_at) VALUES
  ('00000000-0000-0000-0000-000000000010', 'ASSIGN_ROLE', 'user_roles', '00000000-0000-0000-0000-000000000020', '{"role":"passenger"}'::jsonb, '{"role":"operator"}'::jsonb, '192.168.10.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RutaNorte/1.0', now() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000020', 'CREATE_ROUTE', 'routes', '30000000-0000-0000-0000-000000000007', NULL, '{"code":"RN-CI01","name":"Tulcán – Ibarra (Directo E35)"}'::jsonb, '192.168.10.15', 'Mozilla/5.0 RutaNorte/1.0', now() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000020', 'DISPATCH_TRIP', 'trips', '60000000-0000-0000-0000-000000000001', '{"status":"scheduled"}'::jsonb, '{"status":"boarding"}'::jsonb, '192.168.10.15', 'Mozilla/5.0 RutaNorte/1.0', now() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000040', 'VALIDATE_BOARDING_QR', 'tickets', '70000000-0000-0000-0000-000000000001', '{"status":"issued"}'::jsonb, '{"status":"used","boarded":true}'::jsonb, '192.168.20.45', 'RutaNorte Inspector Mobile/1.0', now() - INTERVAL '30 minutes'),
  ('00000000-0000-0000-0000-000000000020', 'UPDATE_BUS_STATUS', 'buses', '40000000-0000-0000-0000-000000000011', '{"status":"active"}'::jsonb, '{"status":"maintenance","reason":"mantenimiento preventivo"}'::jsonb, '192.168.10.15', 'Mozilla/5.0 RutaNorte/1.0', now() - INTERVAL '15 minutes');
