# Base de Datos — Ruta Norte (PostgreSQL 15+)

Este directorio contiene todo lo relacionado con la base de datos relacional y los datos de demostración del proyecto **Ruta Norte** (Carchi e Imbabura, Ecuador).

---

## Estructura de la Carpeta

- `schema.sql`: Script DDL consolidado que crea las 18 tablas en 3NF, tipos ENUM, claves foráneas UUID v4, índices y restricciones de integridad.
- `seed.sql`: Datos semilla maestros deterministas en SQL puro con bloques PL/pgSQL que generan salidas calendarizadas para **1 mes completo** (hoy y próximos 30 días), 14 rutas, flota, inventario de asientos físicos, boletos con QR opacos e incidencias.
- `migrations/`: Scripts SQL versionados y secuenciales (`20261010_000001` a `20261010_000004`) para control formal de cambios y RLS.
- `scripts/seed-complete-demo.js`: Script de aprovisionamiento masivo vía API REST de Supabase, que inyecta automáticamente más de 300 viajes dinámicos relativos a `CURRENT_DATE`, reservas y boletos con QR.
- `scripts/setup-demo-users.js`: Script para inicializar y sincronizar las credenciales de los 5 roles demo del sistema.

---

## Contenido de los Datos de Demostración (1 Mes)

| Entidad | Cantidad | Descripción |
|---------|----------|-------------|
| **Cooperativas** | 4 | Pullman Carchi, Transportes Norte, Expreso Tulcán, Transportes Mira |
| **Localidades** | 18 | 9 cantones/parroquias en Carchi y 9 en Imbabura con coordenadas GPS reales |
| **Paradas y Terminales** | 18 | Terminales terrestres, parques centrales y paraderos de la Panamericana E35 |
| **Rutas Interparroquiales** | 14 | Rutas completas norte-sur (Tulcán, San Gabriel, El Ángel, Mira, Ibarra, Otavalo, Cotacachi, Zuleta, Pimampiro) |
| **Paradas Intermedias** | 8 | Secuencias ordenadas de abordaje/desembarque (`route_stops`) con distancias y tiempos |
| **Unidades (Buses)** | 11 | Mercedes-Benz, Hino y Volkswagen con placas ecuatorianas (`CAA-...`, `PBC-...`, `IAC-...`) |
| **Inventario de Asientos** | 440 | 40 asientos físicos por bus (1A a 10D), con asientos preferenciales/accesibilidad en 1A y 1B |
| **Conductores Profesionales** | 14 | Conductores con cédula ecuatoriana, licencias Tipo D y E vigentes y teléfonos |
| **Viajes Calendarizados** | 304 | Salidas programadas en 8 horarios diarios (06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00) cubriendo desde -7 días pasados hasta +30 días futuros |
| **Tarifas por Trayecto** | 120 | Precios diferenciados por tramo origen-destino en dólares estadounidenses (USD) |
| **Reservas** | 120 | Transacciones con estados `confirmed` (85), `expired` (20) y `pending` (15) con expiración a 15 min |
| **Pagos Simulados** | 85 | Pagos completados mediante tarjeta simulada, efectivo en taquilla y transferencia |
| **Boletos Emitidos (QR)** | 85 | Boletos con tokens opacos seguros `RN-XXXXXXXXXXXXXXXX` y payload JSON sin PII expuesto |
| **Incidencias Operativas** | 15 | Reportes de retrasos por clima/tráfico, chequeos mecánicos y desvíos para el operador |
| **Auditoría (Audit Logs)** | 60 | Trazabilidad inmutable de despacho, asignación de roles, pagos y validación de QR |

---

## Cómo Ejecutar / Importar la Base de Datos

### Opción A: Base de datos local (PostgreSQL 15+)
```bash
# 1. Crear la base de datos en PostgreSQL local
createdb -U postgres rutanorte

# 2. Ejecutar el esquema DDL consolidado
psql -U postgres -d rutanorte -f database/schema.sql

# 3. Insertar los datos semilla maestros (genera automáticamente el mes de viajes)
psql -U postgres -d rutanorte -f database/seed.sql
```

### Opción B: Actualizar Supabase Cloud
```bash
# Ejecutar el script Node.js para poblar directamente Supabase
node database/scripts/seed-complete-demo.js
```

---

## Cuentas de Acceso para Demostración

| Rol | Correo | Contraseña |
|-----|--------|------------|
| **Administrador** | `admin@rutanorte.ec` | `Admin123!` |
| **Operador de Flota** | `operador@rutanorte.ec` | `Operador123!` |
| **Vendedor de Taquilla** | `vendedor@rutanorte.ec` | `Vendedor123!` |
| **Inspector de Ruta** | `inspector@rutanorte.ec` | `Inspector123!` |
| **Pasajero Frecuente** | `pasajero@rutanorte.ec` | `Pasajero123!` |
