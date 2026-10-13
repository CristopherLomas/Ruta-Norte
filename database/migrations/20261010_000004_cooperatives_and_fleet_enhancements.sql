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
