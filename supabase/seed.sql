-- ==============================================================================
-- RUTA NORTE — SEED DATA (DATOS MAESTROS Y DE DEMOSTRACIÓN)
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

-- 2. LOCALIDADES (Norte de Ecuador: Imbabura)
INSERT INTO public.localities (id, name, parish, canton, province, latitude, longitude, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Ibarra Centro', 'San Francisco', 'Ibarra', 'Imbabura', 0.3517, -78.1223, true),
  ('10000000-0000-0000-0000-000000000002', 'San Antonio de Ibarra', 'San Antonio', 'Ibarra', 'Imbabura', 0.3308, -78.1639, true),
  ('10000000-0000-0000-0000-000000000003', 'Otavalo Centro', 'San Luis', 'Otavalo', 'Imbabura', 0.2342, -78.2625, true),
  ('10000000-0000-0000-0000-000000000004', 'Cotacachi', 'El Sagrario', 'Cotacachi', 'Imbabura', 0.3014, -78.2639, true),
  ('10000000-0000-0000-0000-000000000005', 'Zuleta', 'Angochagua', 'Ibarra', 'Imbabura', 0.2319, -78.0736, true),
  ('10000000-0000-0000-0000-000000000006', 'Pimampiro', 'Pimampiro', 'Pimampiro', 'Imbabura', 0.3953, -77.9408, true)
ON CONFLICT (id) DO NOTHING;

-- 3. PARADAS
INSERT INTO public.stops (id, locality_id, name, address, latitude, longitude, is_active) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Terminal Terrestre Ibarra', 'Av. Teodoro Gómez y Av. Mariano Acosta', 0.3540, -78.1250, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Parque Central San Antonio', 'Calle Ramón Teanga y Bolívar', 0.3312, -78.1645, true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Terminal Terrestre Otavalo', 'Av. Atahualpa y Panamericana Norte', 0.2360, -78.2610, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Terminal Terrestre Cotacachi', 'Calle 10 de Agosto y Bolívar', 0.3020, -78.2642, true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Plaza Comunal Zuleta', 'Vía Principal Angochagua-Zuleta', 0.2325, -78.0740, true)
ON CONFLICT (id) DO NOTHING;

-- 4. RUTAS
INSERT INTO public.routes (id, name, code, origin_stop_id, destination_stop_id, distance_km, duration_min, is_active) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Ibarra - Otavalo (Interparroquial)', 'RN-101', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 25.4, 40, true),
  ('30000000-0000-0000-0000-000000000002', 'Ibarra - Cotacachi (vía San Antonio)', 'RN-102', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 28.1, 45, true),
  ('30000000-0000-0000-0000-000000000003', 'Ibarra - Zuleta', 'RN-103', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 21.0, 50, true)
ON CONFLICT (id) DO NOTHING;

-- Secuencia de paradas para RN-101 (Ibarra -> San Antonio -> Otavalo)
INSERT INTO public.route_stops (route_id, stop_id, sequence_order, distance_from_origin_km, time_from_origin_min, is_boarding_point, is_alighting_point) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 0.0, 0, true, false),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 2, 6.5, 12, true, true),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 3, 25.4, 40, false, true)
ON CONFLICT (route_id, sequence_order) DO NOTHING;

-- 5. BUSES (con layout_config JSONB - ADR-003)
INSERT INTO public.buses (id, plate, model, brand, year, total_seats, layout_config, is_active) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'IAA-1234',
    'OF 1721',
    'Mercedes-Benz',
    2022,
    40,
    '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"], "special_seats": [{"seat_number": "1A", "type": "accessibility"}, {"seat_number": "1B", "type": "accessibility"}]}'::jsonb,
    true
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'IAA-5678',
    'AK8JRSA',
    'Hino',
    2023,
    40,
    '{"rows": 10, "columns": 4, "column_labels": ["A", "B", "_", "C", "D"]}'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 6. ASIENTOS FÍSICOS (Bus 40000000-0000-0000-0000-000000000001: 40 asientos)
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
