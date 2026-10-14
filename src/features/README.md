# Módulos de Dominio (Bounded Contexts) — Monolito Modular Ruta Norte

La arquitectura de **Ruta Norte** implementa el patrón **Monolito Modular** (*Modular Monolith*), donde cada dominio de negocio está encapsulado en un módulo independiente dentro de `src/features/`.

---

## Principios de Diseño Modular

1. **Alta Cohesión:** Cada módulo contiene la totalidad de su lógica de negocio, Server Actions, componentes de interfaz y utilidades.
2. **Bajo Acoplamiento:** La comunicación intermodular se realiza mediante contratos públicos de datos expuestos en `actions/index.ts` o tipos compartidos en `src/types/`.
3. **Cero Latencia de Red Interna:** A diferencia de microservicios distribuidos, las operaciones entre módulos se ejecutan en memoria y en servidor dentro del runtime de Next.js.
4. **Transacciones ACID:** Garantías de consistencia inmediata en PostgreSQL a través de Supabase y funciones de bloqueo pesimista en reservas.

---

## Catálogo de los 12 Módulos de Dominio

| Módulo | Directorio | Responsabilidad Principal |
|--------|------------|---------------------------|
| **1. Autenticación & RBAC** | `src/features/auth/` | Gestión de identidades, login, registro, recuperación y control de acceso basado en 5 roles (`admin`, `operator`, `seller`, `inspector`, `passenger`). |
| **2. Rutas & Paradas** | `src/features/routes/` | Trazado vial Panamericana E35, secuencia de paradas intermedias, geolocalización y cálculo de distancias/tiempos. |
| **3. Viajes & Despacho** | `src/features/trips/` | Programación de salidas, asignación de bus/conductor, búsqueda pública de itinerarios y manifiestos de pasajeros. |
| **4. Flota & Asientos** | `src/features/buses/` | Catálogo de buses, cooperativas asociadas y matrices de asientos (30, 40 y 44 asientos). |
| **5. Conductores** | `src/features/drivers/` | Ficha de choferes, licencias profesionales y validación de disponibilidad operativa. |
| **6. Reservas & Concurrencia** | `src/features/bookings/` | Bloqueo temporal de asientos con ventana de expiración estricta (10 min) y prevención de colisión de compras simultáneas. |
| **7. Pagos Simulados** | `src/features/payments/` | Procesamiento simulado de pagos (tarjeta, efectivo de taquilla, transferencia) y emisión de recibos. |
| **8. Boletos & QR** | `src/features/tickets/` | Generación de boletos digitales con UUID v4 único y token QR firmado criptográficamente (HMAC-SHA256). |
| **9. Inspector & Embarque** | `src/features/inspector/` | Escáner móvil de andén con stream de cámara, verificación instantánea y prevención de doble uso de boleto. |
| **10. Incidencias Operativas** | `src/features/incidents/` | Registro, categorización y seguimiento de novedades en ruta (retrasos, averías, accidentes). |
| **11. Reportes & Analítica** | `src/features/reports/` | Dashboards analíticos con métricas de ocupación, recaudación por cooperativa y horas pico. |
| **12. Cooperativas** | `src/features/cooperatives/` | Registro y administración de empresas transportistas federadas del norte del Ecuador. |

---

## Estructura Estándar de un Módulo
```
src/features/[nombre-modulo]/
├── actions/              # Server Actions (casos de uso / mutaciones en servidor)
│   ├── index.ts          # API pública exportada del módulo
│   └── [caso-de-uso].ts  # Implementaciones específicas
├── components/           # Componentes de presentación exclusivos del módulo
├── utils.ts              # Reglas de negocio puras y cálculos de dominio
└── validations.ts        # Esquemas Zod para validación en el límite
```
