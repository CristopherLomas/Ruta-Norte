-- ==============================================================================
-- RUTA NORTE 2.0 (VISUAL EDITION) — ESQUEMA SIMPLIFICADO DE 5 TABLAS
-- PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Eliminar tablas anteriores si se desea reiniciar el esquema v2
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.buses CASCADE;
DROP TABLE IF EXISTS public.cities CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ------------------------------------------------------------------------------
-- TABLA 1: USERS (Solo 3 roles: PASSENGER, STAFF, ADMIN)
-- ------------------------------------------------------------------------------
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('PASSENGER', 'STAFF', 'ADMIN')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLA 2: CITIES (9 ciudades con terminal en el corredor norte E35)
-- ------------------------------------------------------------------------------
CREATE TABLE public.cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  province VARCHAR(50) NOT NULL CHECK (province IN ('Carchi', 'Imbabura')),
  terminal_name VARCHAR(120) NOT NULL,
  image_url TEXT NOT NULL
);

-- ------------------------------------------------------------------------------
-- TABLA 3: BUSES (Flota estándar única de 40 asientos)
-- ------------------------------------------------------------------------------
CREATE TABLE public.buses (
  id SERIAL PRIMARY KEY,
  cooperative_name VARCHAR(100) NOT NULL,
  unit_number VARCHAR(20) NOT NULL,
  plate VARCHAR(20) UNIQUE NOT NULL,
  photo_url TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 40
);

-- ------------------------------------------------------------------------------
-- TABLA 4: TRIPS (Salidas con turno y fecha)
-- ------------------------------------------------------------------------------
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city_id INT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  destination_city_id INT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  bus_id INT NOT NULL REFERENCES public.buses(id) ON DELETE RESTRICT,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  shift VARCHAR(20) NOT NULL CHECK (shift IN ('MORNING', 'AFTERNOON', 'NIGHT')),
  price NUMERIC(6,2) NOT NULL,
  CONSTRAINT chk_diff_cities CHECK (origin_city_id <> destination_city_id)
);

-- ------------------------------------------------------------------------------
-- TABLA 5: TICKETS (Boletos con compra directa en 1 clic y token QR)
-- ------------------------------------------------------------------------------
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  passenger_name VARCHAR(100) NOT NULL DEFAULT 'Pasajero General',
  seat_number INT NOT NULL CHECK (seat_number BETWEEN 1 AND 40),
  qr_token VARCHAR(30) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'BOARDED')),
  created_at TIMESTAMP DEFAULT NOW(),
  boarded_at TIMESTAMP NULL,
  CONSTRAINT uk_trip_seat UNIQUE (trip_id, seat_number)
);

-- ------------------------------------------------------------------------------
-- ÍNDICES DE RENDIMIENTO
-- ------------------------------------------------------------------------------
CREATE INDEX idx_trips_search ON public.trips (origin_city_id, destination_city_id, departure_date, shift);
CREATE INDEX idx_tickets_trip ON public.tickets (trip_id);
CREATE INDEX idx_tickets_qr ON public.tickets (qr_token);
