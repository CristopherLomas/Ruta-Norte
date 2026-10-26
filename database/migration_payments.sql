-- ==============================================================================
-- MIGRACIÓN DE PAGOS REALISTAS PARA RUTA NORTE 2.0 (SUPABASE CLOUD)
-- Ejecutar en el SQL Editor de Supabase si deseas reflejar las columnas en BD
-- ==============================================================================

-- 1. Añadir columnas de pago y cédula a la tabla tickets
ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS passenger_dni VARCHAR(20) DEFAULT '1004567890',
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'TRANSFERENCIA',
  ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(80),
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(60);

-- 2. Actualizar restricción de status para soportar el ciclo de 4 estados:
-- 'PENDING_VERIFICATION' -> Pago pendiente de revisión por Admin
-- 'PAID'                 -> Pago aprobado; código QR activo para abordar
-- 'REJECTED'             -> Pago rechazado por Admin; libera el asiento
-- 'BOARDED'              -> Pasajero abordó el bus (código QR escaneado)
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN ('PENDING_VERIFICATION', 'PAID', 'REJECTED', 'BOARDED'));

-- 3. Índices de rendimiento para la bandeja del Administrador
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets (created_at DESC);
