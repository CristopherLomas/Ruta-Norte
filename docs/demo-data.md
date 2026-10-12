# Guía de Datos de Demostración Masiva — Ruta Norte

> Documentación oficial para la ejecución, mantenimiento y verificación del escenario de demostración universitaria de alta densidad.

---

## 1. Resumen del Volumen de Datos en Supabase

El sistema ha sido poblado con datos persistentes y relacionados entre sí, modelando la operación continua del transporte interparroquial en el norte de Ecuador (Carchi e Imbabura):

| Entidad / Tabla | Registros Reales | Descripción del Conjunto |
|---|---:|---|
| **Localidades** (`localities`) | **18** | Cantones y parroquias reales de Carchi (Tulcán, San Gabriel, El Ángel, Mira, Huaca, Bolívar, etc.) e Imbabura (Ibarra, Otavalo, Cotacachi, San Antonio, Zuleta, etc.). |
| **Paradas y Terminales** (`stops`) | **18** | Terminales terrestres, parques centrales y paraderos con coordenadas GPS validadas para el trazado cartográfico. |
| **Rutas Interparroquiales** (`routes`) | **14** | Corredores principales y conexiones entre cantones y parroquias con tarifas base y duración programada. |
| **Paradas Intermedias** (`route_stops`) | **8** | Puntos de escala e itinerario ordenados por secuencia. |
| **Cooperativas** (`cooperatives`) | **4** | Pullman Carchi, Transportes Norte, Expreso Tulcán y Coop. Mira. |
| **Buses** (`buses`) | **11** | Unidades con discos, placas ecuatorianas sintéticas (ej: CAA-0123) y matrices JSONB de asientos. |
| **Asientos Físicos** (`bus_seats`) | **430** | Inventario completo de asientos por bus (1A a 10D), incluyendo preferenciales (`accessibility`). |
| **Conductores** (`drivers`) | **14** | Choferes profesionales con cédulas, licencias tipo D/E vigentes y teléfonos de contacto. |
| **Viajes Programados** (`trips`) | **264** | Salidas dinámicas relativas a `CURRENT_DATE` (-7 días a +25 días), distribuidas en 8 horarios diarios. |
| **Tarifas Específicas** (`trip_fares`) | **120** | Precios en USD asignados a las salidas y tramos origen-destino. |
| **Reservas Comerciales** (`bookings`) | **120** | 85 confirmadas con pago y boleto, 20 expiradas y 15 pendientes activas. |
| **Asientos Asignados** (`booking_seats`) | **120** | Vínculo estricto entre reserva y asiento físico sin colisiones ni duplicados. |
| **Pagos Simulados** (`payments`) | **85** | Transacciones completadas por tarjeta, efectivo en ventanilla y transferencia simulada. |
| **Boletos Emitidos** (`tickets`) | **85** | Boletos con tokens QR opacos (`RN-...`) sin exposición de PII, incluyendo boletos usados/abordados y vigentes. |
| **Incidencias Operativas** (`incidents`) | **15** | Retrasos climáticos, inspecciones y mantenimientos categorizados por severidad (baja, media, alta, crítica). |
| **Registros de Auditoría** (`audit_logs`) | **60** | Trazabilidad inmutable de despacho, asignación de roles y pagos. |
| **Cuentas y Perfiles** (`profiles`) | **7** | 5 cuentas oficiales de demostración por rol + 2 cuentas de usuarios registrados. |

---

## 2. Cuentas Oficiales de Demostración por Rol

Todas las cuentas han sido creadas a través de la API administrativa de **Supabase Auth** (`auth.admin.createUser`) y cuentan con sus roles asignados en `user_roles`:

| Rol del Sistema | Correo Electrónico | Contraseña Demo | Perfil Asignado |
|---|---|---|---|
| **Administrador** | `admin.demo@rutanorte.ec` | `DemoPassword2026!` | Ing. Carlos Navarrete (Admin Demo) |
| **Operador de Flota** | `operador.demo@rutanorte.ec` | `DemoPassword2026!` | Manuel Benalcázar (Operador Demo) |
| **Vendedor de Taquilla** | `vendedor.demo@rutanorte.ec` | `DemoPassword2026!` | Rosa Elena Caicedo (Ventanilla Tulcán) |
| **Inspector de Andén** | `inspector.demo@rutanorte.ec` | `DemoPassword2026!` | Sgto. Ramiro Cuasquer (Inspector Andén) |
| **Pasajero Frecuente** | `pasajero.demo@rutanorte.ec` | `DemoPassword2026!` | Estefanía Villareal (Pasajera Frecuente) |

---

## 3. Instrucciones de Ejecución y Repetibilidad

### A. Ejecutar Carga Masiva (Idempotente)
Para poblar o actualizar la base de datos sin destruir datos de usuarios reales ni alterar esquemas:
```bash
node scripts/seed-complete-demo.js
```

### B. Crear o Reconfigurar Cuentas de Demostración
Para verificar o restablecer las cuentas de demostración con sus roles y perfiles:
```bash
node scripts/setup-demo-users.js
```

---

## 4. Pantallas y Flujos Listos para Demostración

1. **Buscador Público y Mapa Interactivo (`/`):**
   - Búsqueda por múltiples orígenes y destinos (Tulcán, San Gabriel, Ibarra, Otavalo, Huaca, etc.).
   - Visualización de la carretera real por Leaflet y OSRM, con tiempo estimado y kilómetros reales.
   - Listado de viajes dinámicos para hoy y días futuros con badges de estado ("En Andén", "A tiempo").
2. **Selección de Asientos y Mapa del Bus (`/viajes/[id]/asientos`):**
   - Mapa de asientos interactivo en tiempo real con asientos libres, ocupados y preferenciales.
   - Previsualización cartográfica del trayecto.
3. **Panel Administrativo y Analítica (`/admin/reportes`):**
   - Métricas de ocupación, ingresos acumulados, boletos vendidos y gráficos de demanda por cooperativa calculados sobre las transacciones reales.
4. **Gestión de Rutas y Coordenadas (`/admin/rutas`):**
   - Tabla de 14 rutas activas y formulario de creación con previsualización vial.
   - Herramienta de ajuste de coordenadas de paradas con mapa interactivo en vivo.
5. **Panel del Operador (`/operator/despacho` e `/operator/incidencias`):**
   - Control de viajes en despacho, manifiestos de pasajeros y tabla de 15 incidencias operativas categorizadas.
6. **Escaner de Boletos del Inspector (`/inspector/escanear`):**
   - Validación transaccional de boletos con códigos QR (`RN-...`).
