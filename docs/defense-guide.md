# Guía de Ejecución y Guion de Defensa Técnica — Ruta Norte

> **Documento Académico y Profesional de Sustentación ante Tribunal / Docente.**  
> **Proyecto:** Ruta Norte — Sistema Web de Gestión de Transporte Interparroquial, Rutas y Venta de Boletos con QR.  
> **Región:** Norte de Ecuador (Carchi e Imbabura: Tulcán, Julio Andrade, San Gabriel, El Ángel, Mira, Ibarra, Otavalo).  
> **Stack:** Next.js 14 (App Router) · TypeScript Strict · Tailwind CSS · Supabase PostgreSQL · shadcn/ui · Recharts · Vitest · Playwright.

---

## 1. Arquitectura y Stack Tecnológico: Justificación Técnica

### ¿Por qué Next.js App Router + Supabase BaaS vs. Arquitecturas Tradicionales (Spring Boot / FastAPI + React SPA)?

1. **Unificación de Runtime y Tipado de Extremo a Extremo:**
   - La arquitectura monolítica modular en Next.js App Router elimina la duplicación de modelos entre backend y frontend. Los tipos TypeScript de `src/types/` y los esquemas Zod de `src/lib/validations/` son compartidos directamente entre componentes de interfaz y Server Actions.
   - En una arquitectura tradicional separada (ej. FastAPI + React o Spring Boot + Angular), se requiere mantener dos repositorios, sincronizar contratos OpenAPI/DTOs manualmente y gestionar proxies CORS.
2. **Server Actions como Capa de Mutación Segura (RPC en Servidor):**
   - Las operaciones críticas (`createReservationAction`, `processPaymentAction`, `validateBoardingAction`) se ejecutan estrictamente en el entorno de servidor (Node.js).
   - El cliente nunca interactúa directamente con la cadena de conexión ni tiene acceso a la `SUPABASE_SERVICE_ROLE_KEY`.
3. **Cero Exposición de Secretos:**
   - Solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` residen en el cliente, las cuales están fuertemente protegidas a nivel de base de datos mediante **Row Level Security (RLS)**.

---

## 2. Mecanismos de Concurrencia y Consistencia (ADR-001)

### ¿Cómo `reserve_seats()` y `FOR UPDATE` previenen la sobreventa de asientos?

La reserva y venta de boletos en transporte público interparroquial es un problema clásico de alta contención de recursos concurrentes. Si dos usuarios intentan comprar el asiento `1A` al mismo milisegundo:

1. **Bloqueo Pesimista a Nivel de Fila (Pessimistic Locking):**
   ```sql
   PERFORM bs.id
   FROM public.bus_seats bs
   WHERE bs.id = ANY(p_seat_ids)
   FOR UPDATE;
   ```
   PostgreSQL adquiere un bloqueo exclusivo sobre las filas de los asientos solicitados durante la transacción. La segunda solicitud debe esperar hasta que la primera termine de verificar el estado.
2. **Ventana de Expiración Estricta de 10 Minutos:**
   - Si el asiento está en estado `'reserved'` pero `expires_at > now()`, se considera ocupado y la segunda transacción falla de inmediato con `ASIENTO_YA_OCUPADO`.
   - Si han transcurrido más de 10 minutos, la reserva expira automáticamente y el asiento vuelve a estar disponible.
3. **Confirmación Atómica:**
   - La función `confirm_booking_on_payment()` comprueba nuevamente `expires_at > now()`. Si la reserva expiró durante el llenado de datos, la transacción se aborta (`RESERVA_EXPIRADA`) y ningún pago es procesado.

---

## 3. Modelo de Seguridad en Dos Capas (ADR-002 y ADR-004)

### Capa 1: Server Actions & Guards (`requireRole`)
- Antes de ejecutar cualquier mutación sensible, se invoca `requireRole(["admin", "inspector"])`.
- Si el usuario no tiene la sesión activa o su rol no está facultado, la acción aborta en la capa Node.js antes de enviar consultas a la base de datos.

### Capa 2: Row Level Security (RLS) en PostgreSQL
- Todas las tablas del sistema tienen RLS habilitado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Las políticas evalúan el rol del usuario mediante la función SQL:
  ```sql
  get_user_role(auth.uid())
  ```
- **Por qué los roles residen en `user_roles` y no en metadatos del JWT/cliente:**
  * Los metadatos de usuario en Supabase (`raw_user_meta_data`) son editables por el propio usuario en llamadas estándar del cliente.
  * Almacenar los roles en una tabla relacional estricta (`user_roles`) vinculada a claves foráneas impide la escalada de privilegios y garantiza auditoría inmutable.

### Privacidad del Código QR:
- El código QR no almacena datos personales (PII) como nombres o cédulas.
- Contiene un **token opaco** inmutable con formato `RN-XXXXXXXXXXXXXXXX` y un payload con firma SHA-256 (`valid_for_departure`, `checksum`). Un escaneo no autorizado por terceros no expone la identidad del pasajero.

---

## 4. Guion de Demostración en Vivo (5 a 7 Minutos)

Sigue este flujo paso a paso durante la sustentación ante el tribunal:

| Minuto | Módulo / Pantalla | Acción en Vivo | Explicación Técnica para el Tribunal |
|---|---|---|---|
| **0:00 - 1:00** | **Portada (`/`)** | Mostrar el buscador de viajes. Seleccionar origen: *Tulcán*, destino: *Julio Andrade*. Clic en *Buscar Viajes*. | Explicar que el sistema consulta únicamente salidas activas en tiempo real (`scheduled`/`boarding`), calculando tarifas base y distancia en km. |
| **1:00 - 2:30** | **Mapa de Asientos (`/viajes/[id]/asientos`)** | Clic en *Elegir Asientos*. Mostrar el bus con layout dinámico JSONB. Seleccionar 2 asientos (`1A` preferencial y `1B`). Intentar seleccionar un 5to asiento para mostrar la restricción de 4 asientos. | Destacar la matriz generada a partir del `layout_config` (ADR-003) y la validación Zod en tiempo real. |
| **2:30 - 3:45** | **Checkout y Timer (`/checkout/[bookingId]`)** | Clic en *Confirmar y Continuar al Pago*. Iniciar sesión como pasajero. Señalar el **temporizador regresivo de 10 minutos**. Seleccionar *Tarjeta Demo* y pagar. | Explicar la transacción `reserve_seats()` (ADR-001) y la pasarela simulada con referencia académica (ADR-005, sin datos reales de tarjetas). |
| **3:45 - 4:45** | **Boleto Digital (`/passenger/boletos/[id]`)** | Mostrar el boleto emitido con código QR SVG, número de asiento y token `RN-XXXXXXXXXXXXXXXX`. Clic en *Imprimir*. | Explicar el token opaco SHA-256 (ADR-002) y la hoja de estilos para impresión (`@media print`). |
| **4:45 - 5:45** | **Inspector y Anti-Fraude (`/inspector`)** | Iniciar sesión como Inspector. Copiar el código del boleto y validarlo. Mostrar la confirmación verde (asiento y pasajero). **Volver a presionar Validar con el mismo código**. | Demostrar cómo salta la alerta ámbar: *`ALERTA: Este boleto ya fue validado previamente el DD/MM/AAAA a las HH:MM`* gracias al bloqueo `FOR UPDATE`. |
| **5:45 - 6:30** | **Manifiesto de Despacho (`/operator/viajes/[id]/manifiesto`)** | Acceder como Operador. Mostrar que el pasajero validado figura en la lista con estado *A Bordo*. Cambiar estado a *En Ruta*. | Explicar la trazabilidad operativa y el formato oficial para la Agencia Nacional de Tránsito (ANT). |
| **6:30 - 7:00** | **Analítica Ejecutiva (`/admin/reportes`)** | Mostrar los gráficos de Recharts: Demanda por ruta (BarChart), recaudación por cooperativa (AreaChart) y canales de venta (Donut). | Mostrar la capacidad de toma de decisiones estratégicas para las cooperativas de transporte. |

---

## 5. Respuestas a Preguntas Complejas del Tribunal / Profesor

### P1: "¿Qué sucede si se cae el internet en el andén de la terminal cuando el inspector va a validar?"
> **Respuesta:**  
> "En esta fase de arquitectura web, la validación se realiza en servidor para garantizar consistencia centralizada e impedir que un boleto duplicado sea abordado en dos terminales simultáneamente. Como trabajo futuro de evolución a PWA (Progressive Web App), el token opaco incorpora un checksum criptográfico SHA-256 (`valid_for_departure:checksum`). Esto permite validación off-line en memoria mediante llave pública compartida, almacenando las marcas en IndexedDB para sincronización diferida con cola transaccional."

### P2: "¿Cómo conectarían una pasarela de pago real ecuatoriana como Kushki, Payphone o Datafast?"
> **Respuesta:**  
> "La arquitectura fue diseñada desacoplada según ADR-005: la Server Action `processPaymentAction()` recibe un método de pago genérico. Para integrar Payphone o Kushki, solo se reemplaza la función simulada por un webhook seguro (`/api/webhooks/payphone`) que reciba la confirmación firmada con HMAC, e invoque directamente `confirm_booking_on_payment()` en PostgreSQL de forma idéntica a como se hace hoy."

### P3: "¿Por qué no usaron WebSockets en lugar de Server Actions?"
> **Respuesta:**  
> "Para sistemas transaccionales con ACID, las Server Actions con bloqueos a nivel de fila en base de datos (`SELECT ... FOR UPDATE`) ofrecen garantías deterministas de consistencia sin sobrecargar conexiones de socket en memoria en el servidor. Supabase Realtime (vía PostgreSQL CDC) puede habilitarse sobre la tabla `booking_seats` para refrescar visualmente los asientos tomados en los navegadores sin alterar la seguridad transaccional."

---

*Documento consolidado para la sustentación del proyecto Ruta Norte — Universidad / Tribunal Académico.*
