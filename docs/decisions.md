# Registro de Decisiones de Arquitectura (ADR) — Ruta Norte

> Este archivo registra las decisiones técnicas aprobadas que deben seguir todos los agentes.  
> Ninguna decisión aquí puede ser revertida sin autorización del coordinador y actualización de este archivo.

---

## ADR-001 — Expiración de reservas temporales

**Estado:** ✅ Aprobado  
**Fecha:** Fase 0

### Decisión

Implementar expiración de reservas con **validación obligatoria en servidor** en cada operación de confirmación, combinada con un **proceso periódico de limpieza** mediante Supabase Cron (pg_cron) o alternativa compatible con el entorno.

### Especificaciones técnicas

- Los **triggers** protegen las transiciones de estado e integridad, pero no son el mecanismo principal de expiración.
- La función `expire_pending_bookings()` debe ser **idempotente** y **segura ante concurrencia** (usar `FOR UPDATE SKIP LOCKED`).
- Antes de confirmar cualquier reserva, validar en el Server Action que `expires_at > now()` y `status = 'pending'`.
- El cron de limpieza debe ejecutarse periódicamente (sugerido: cada 5 minutos).
- Si pg_cron no está disponible en el plan de Supabase utilizado, implementar llamada de limpieza desde middleware de Next.js con throttle.

### Consecuencias

- `bookings.expires_at` es campo obligatorio (NOT NULL) para todas las reservas.
- Se añade índice `idx_bookings_expires_at` para eficiencia del cron.
- El estado `expired` es terminal — no puede revertirse.

---

## ADR-002 — Generación y verificación de QR de boletos

**Estado:** ✅ Aprobado  
**Fecha:** Fase 0

### Decisión

El **identificador verificable del boleto se genera en el servidor** al momento de la emisión. El QR se renderiza en el cliente usando la librería `qrcode.react` con el token recibido del servidor.

### Especificaciones técnicas

- `tickets.qr_code` almacena un **token opaco** (UUID v4 + HMAC o hash), no datos del pasajero.
- `tickets.qr_payload` almacena el JSON mínimo necesario para verificación, sin PII del pasajero:
  ```json
  {
    "ticket_id": "uuid",
    "trip_id": "uuid",
    "seat_number": "15A",
    "valid_for_departure": "2024-10-15T08:00:00Z",
    "checksum": "sha256-hash"
  }
  ```
- La **verificación de embarque** se ejecuta en el servidor mediante Server Action o función SQL autorizada.
- Un boleto usado no puede volver a marcarse como válido — trigger de transición de estado protege esto.
- La página pública de consulta de QR **no expone nombre, email ni datos del pasajero** — solo muestra estado de validez.

### Consecuencias

- `qrcode.react` o similar se añade como dependencia de cliente.
- Se requiere función SQL `validate_ticket_qr(qr_code TEXT)` en `SECURITY DEFINER`.
- El inspector no puede marcar embarque sin pasar por validación del servidor.

---

## ADR-003 — Selector visual de asientos

**Estado:** ✅ Aprobado  
**Fecha:** Fase 0

### Decisión

Implementar un **selector visual interactivo de asientos** usando `layout_config JSONB` en la tabla `buses` para describir la distribución de cada unidad (filas × columnas).

### Especificaciones técnicas

- `buses.layout_config` es un objeto JSONB con la estructura:
  ```json
  {
    "rows": 10,
    "columns": 4,
    "column_labels": ["A", "B", "_", "C", "D"],
    "special_seats": [
      { "seat_number": "1A", "type": "accessibility" }
    ]
  }
  ```
- La disponibilidad, ocupación e integridad de asientos se mantiene en **tablas relacionales** (`bus_seats`, `booking_seats`) con restricciones PostgreSQL.
- El JSONB solo describe el layout visual; la fuente de verdad de disponibilidad es la base de datos relacional.
- El componente `SeatMapSelector` (Client Component) consume el layout y la disponibilidad vía Server Action.

### Consecuencias

- El componente de mapa de asientos requiere `'use client'` y estado local.
- La disponibilidad debe refrescarse en tiempo real o con polling corto para evitar selección de asientos ya tomados.
- El prototipo del selector visual debe completarse en Fase 3 para validar el JSONB antes de Fase 4.

---

## ADR-004 — Cuentas de demostración

**Estado:** ✅ Aprobado  
**Fecha:** Fase 0

### Decisión

Usar las siguientes identidades de demostración, creadas mediante el seed de Supabase Auth:

| Email | Rol | Contraseña (solo en .env.local, nunca en repo) |
|-------|-----|------|
| `demo+admin@rutanorte.ec` | admin | Variable de entorno `DEMO_ADMIN_PASSWORD` |
| `demo+operator@rutanorte.ec` | operator | Variable de entorno `DEMO_OPERATOR_PASSWORD` |
| `demo+seller@rutanorte.ec` | seller | Variable de entorno `DEMO_SELLER_PASSWORD` |
| `demo+inspector@rutanorte.ec` | inspector | Variable de entorno `DEMO_INSPECTOR_PASSWORD` |
| `demo+passenger@rutanorte.ec` | passenger | Variable de entorno `DEMO_PASSENGER_PASSWORD` |

### Especificaciones técnicas

- Los correos no tienen buzones reales — solo se usan en entorno de desarrollo.
- En Supabase, deshabilitar la confirmación de email para el proyecto de desarrollo (`email_confirm = false`).
- Las contraseñas se documentan **únicamente** en `.env.local` y en un canal seguro fuera del repositorio.
- El procedimiento de inicialización se documenta en `docs/setup.md` (Fase 0.5 / antes de Fase 1).
- Los datos asociados a estos usuarios tienen `is_demo = true` donde aplique.

### Consecuencias

- `.env.local` se añade a `.gitignore` desde el primer commit.
- El seed SQL no incluye contraseñas en texto plano — solo crea los perfiles y asigna roles.
- Los usuarios demo se crean mediante script separado usando el Supabase Admin SDK con service role key.

---

## ADR-005 — Idioma de la interfaz

**Estado:** ✅ Aprobado  
**Fecha:** Fase 0

### Decisión

La interfaz de usuario será **exclusivamente en español** (variante Ecuador). Las convenciones técnicas (nombres de tablas, columnas, funciones, variables TypeScript) se mantendrán en **inglés** cuando sea la práctica estándar del stack.

### Especificaciones técnicas

- Textos de UI, labels, mensajes de error, notificaciones: **español**.
- Código fuente (variables, funciones, tipos): **inglés** (sigue convenciones TypeScript/JS).
- Nombres de tablas y columnas BD: **inglés** en snake_case (ej: `departure_time`, no `hora_salida`).
- Comentarios en código: pueden estar en español si aportan claridad de dominio.
- No se implementa sistema i18n — sin soporte para inglés en la UI.

### Consecuencias

- No se instala `next-i18next` ni similar.
- Los mensajes de Zod se configuran en español: `z.setErrorMap(...)`.
- Las fechas y montos se formatean para Ecuador (UTC-5, USD, formato `dd/MM/yyyy`).

---

*Registro mantenido por: Agente Coordinador / Arquitecto Senior*  
*Última actualización: Fase 0 — todas las decisiones aprobadas*
