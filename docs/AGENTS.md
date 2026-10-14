# AGENTS.md — Ruta Norte

> **Convenciones compartidas para todos los agentes de desarrollo.**  
> Todos los agentes deben leer este archivo antes de producir cualquier código o documentación.

---

## 1. Identidad del proyecto

| Campo | Valor |
|-------|-------|
| Nombre | Ruta Norte |
| Descripción | Sistema web de gestión de transporte interparroquial, rutas y venta de boletos |
| Región | Norte de Ecuador |
| Stack principal | Next.js 14 · TypeScript strict · Tailwind CSS · Supabase · shadcn/ui |
| Repositorio base | `c:\Users\toshiba\Desktop\Proyecto Aplicaciones WEB\Rutas` |

---

## 2. Agentes y responsabilidades

| Agente | Rol | Archivos bajo su responsabilidad |
|--------|-----|----------------------------------|
| **Coordinador / Arquitecto** | Diseño de sistema, contratos, revisión final, integración | `docs/`, `AGENTS.md`, decisiones técnicas |
| **Especialista BD** | Modelo relacional, SQL, migraciones, RLS, funciones | `supabase/migrations/`, `supabase/seed.sql`, `src/lib/supabase/` |
| **Especialista Frontend** | UI, componentes, navegación, accesibilidad | `src/app/`, `src/components/`, layouts, páginas |
| **Especialista Negocio** | Reservas, ventas, boletos, tarifas, lógica de dominio | `src/features/`, `src/lib/validations/`, Server Actions |
| **Especialista QA** | Pruebas unitarias, e2e, seguridad, regresiones | `tests/unit/`, `tests/e2e/` |

### 2.1 Protocolo de entrega entre agentes

1. El coordinador define los **tipos TypeScript** en `src/types/` antes de que cualquier agente comience a implementar.
2. El especialista de BD entrega las migraciones completas **antes** de que negocio o frontend las consuman.
3. Ningún agente modifica archivos de otro agente sin coordinación explícita.
4. Cada entrega incluye: código, pruebas mínimas y actualización de este archivo si aplica.

---

## 3. Convenciones de código

### 3.1 TypeScript

```typescript
// CORRECTO: tipos explícitos siempre
const getTrip = async (id: string): Promise<Trip | null> => { ... }

// INCORRECTO: any implícito
const getTrip = async (id) => { ... }
```

- **Modo estricto** habilitado en `tsconfig.json` (`"strict": true`).
- Sin `any` explícito. Usar `unknown` y type guards cuando sea necesario.
- Exportar tipos desde `src/types/index.ts` o archivos específicos por dominio.
- Preferir `interface` para objetos de dominio, `type` para uniones y utilidades.

### 3.2 Nombrado

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes React | PascalCase | `BookingCard.tsx` |
| Hooks | camelCase con prefijo `use` | `useBooking.ts` |
| Server Actions | camelCase con verbo | `createBooking.ts` |
| Utilidades | camelCase | `formatCurrency.ts` |
| Tipos/Interfaces | PascalCase | `type Booking = {...}` |
| Constantes | UPPER_SNAKE_CASE | `MAX_SEAT_RESERVATION_MINUTES` |
| Tablas BD | snake_case plural | `booking_seats` |
| Columnas BD | snake_case | `departure_time` |
| Migraciones SQL | `YYYYMMDD_HHMMSS_descripcion.sql` | `20241015_000001_create_profiles.sql` |

### 3.3 Estructura de archivos por feature

```
src/features/bookings/
  actions/
    createBooking.ts      ← Server Action
    cancelBooking.ts
  components/
    BookingForm.tsx
    BookingSeatSelector.tsx
  hooks/
    useBooking.ts
  types.ts                ← tipos específicos del feature
  utils.ts                ← utilidades del feature
```

### 3.4 Componentes React

- Un componente por archivo.
- Props tipadas con `interface ComponentNameProps`.
- Componentes de servidor por defecto; agregar `'use client'` solo cuando sea necesario.
- No mezclar lógica de negocio, consultas a BD y renderizado en un mismo componente.

```typescript
// Estructura esperada de un Server Component
import { createServerClient } from '@/lib/supabase/server'
import { BookingCard } from './BookingCard'

interface PageProps {
  params: { id: string }
}

export default async function BookingPage({ params }: PageProps) {
  const supabase = createServerClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, trips(*)')
    .eq('id', params.id)
    .single()

  if (!booking) return <div>Reserva no encontrada</div>
  return <BookingCard booking={booking} />
}
```

---

## 4. Convenciones de base de datos

### 4.1 Migraciones

- Una migración por entidad o cambio lógico relacionado.
- Numeración secuencial: `001`, `002`, etc.
- Nunca modificar migraciones ya aplicadas — crear una nueva migración correctiva.
- Probar migraciones con `supabase db reset` antes de entregar.

### 4.2 RLS

- **RLS habilitado en todas las tablas** que almacenen datos de usuario.
- Toda política debe tener nombre descriptivo: `"[rol]_[accion]_[tabla]"`.
- Las políticas permisivas deben ser lo más restrictivas posible.
- Usar `auth.uid()` para identificar al usuario actual.
- Usar la función `get_user_role(uid)` (definida en migraciones) para verificar roles.

```sql
-- Patrón: verificación de rol en política
CREATE POLICY "admin_all_trips" ON trips
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');
```

### 4.3 Funciones SQL

- Funciones críticas de negocio en `SECURITY DEFINER` solo cuando sea estrictamente necesario.
- Documentar propósito, parámetros y retorno de cada función.
- Las transacciones de reserva deben usar `SELECT ... FOR UPDATE` o `advisory locks`.

---

## 5. Seguridad — reglas no negociables

1. **Nunca** exponer `SUPABASE_SERVICE_ROLE_KEY` en el cliente.
2. **Nunca** procesar, almacenar ni transmitir datos reales de tarjetas de crédito.
3. **Nunca** confiar únicamente en validaciones del frontend para operaciones críticas.
4. **Nunca** eliminar físicamente registros históricos (reservas, pagos, boletos, auditoría).
5. **Nunca** asignar roles mediante campos editables por el usuario.
6. **Siempre** validar permisos en Server Actions con `checkRole()` antes de cualquier operación sensible.
7. **Siempre** registrar en `audit_logs` las acciones: asignación de roles, cancelaciones, emisión de boletos.
8. El QR de un boleto **no debe** exponer información privada del pasajero al escanearse públicamente.

---

## 6. Validaciones

### 6.1 Zod schemas

- Definir schemas en `src/lib/validations/[dominio].ts`.
- Reusar schemas entre formularios (frontend) y Server Actions (backend).
- Nunca duplicar la lógica de validación.

```typescript
// src/lib/validations/booking.ts
import { z } from 'zod'

export const createBookingSchema = z.object({
  tripId: z.string().uuid(),
  originStopId: z.string().uuid(),
  destinationStopId: z.string().uuid(),
  seatIds: z.array(z.string().uuid()).min(1).max(4),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
```

### 6.2 React Hook Form

- Usar `zodResolver` de `@hookform/resolvers/zod`.
- Estados de carga, éxito y error **siempre** visibles al usuario.
- Los campos de formulario deben tener labels accesibles (`htmlFor`, `aria-label`).

---

## 7. Pruebas

### 7.1 Vitest (unitarias)

- Archivo de prueba junto al código o en `tests/unit/` con la misma estructura de `src/`.
- Nomenclatura: `[modulo].test.ts`.
- Cubrir: casos normales, casos de error, casos límite.
- Mockear llamadas a Supabase con `vi.mock`.

### 7.2 Playwright (e2e)

- Archivos en `tests/e2e/`.
- Usar `test.describe` para agrupar por flujo.
- Flujos obligatorios de e2e:
  - Login / logout / protección de rutas
  - Búsqueda de viaje → selección de asiento → reserva → compra → boleto
  - Validación de embarque por inspector
  - Expiración de reserva
  - Intento de doble reserva del mismo asiento

### 7.3 Regla de oro

> **No declarar que las pruebas pasan si no se han ejecutado.** Si un agente no puede ejecutar pruebas, debe indicarlo explícitamente y dejar los archivos de prueba listos para ejecución posterior.

---

## 8. Identidad visual

### 8.1 Paleta de colores (tokens CSS / Tailwind)

```css
:root {
  --color-primary: #173B57;       /* Azul petróleo */
  --color-secondary: #20A878;     /* Verde movilidad */
  --color-background: #F5F7FA;    /* Fondo gris claro */
  --color-surface: #FFFFFF;       /* Superficies */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
}
```

### 8.2 Tipografía

- Fuente: Inter (Google Fonts) o sistema sans-serif como fallback.
- Escala tipográfica de Tailwind como base.

### 8.3 Componentes base

- Usar exclusivamente **shadcn/ui** para componentes UI primitivos.
- No instalar otras librerías de componentes (MUI, Chakra, Ant Design, etc.).
- Extender con variantes de shadcn antes de crear componentes desde cero.

### 8.4 Iconos

- Usar exclusivamente **Lucide React**.
- No mezclar librerías de iconos.

---

## 9. Datos de demostración

- Los datos semilla se almacenan en `supabase/seed.sql`.
- Los registros de demo deben tener un campo `is_demo: true` donde aplique, o estar en un esquema claramente identificado.
- **Nunca** mostrar datos de demo como si fueran resultados reales del sistema.
- Los dashboards deben indicar visualmente cuando muestran datos de demostración.

---

## 10. Git y entrega

- Commits atómicos con mensajes descriptivos: `feat(bookings): add seat reservation transaction`.
- No commitear `.env.local` ni secretos.
- El archivo `.gitignore` debe estar completo desde el inicio.
- Cada fase debe compilar sin errores: `npm run build` debe pasar antes de entregar.

---

## 11. Checklist antes de entregar un módulo

- [ ] Compila sin errores TypeScript
- [ ] `npm run lint` sin warnings críticos
- [ ] Pruebas unitarias escritas y ejecutadas (o documentado que requieren entorno)
- [ ] Validaciones de entrada implementadas con Zod
- [ ] Estados de carga, éxito y error visibles
- [ ] Control de permisos verificado en servidor
- [ ] RLS verificado para tablas afectadas
- [ ] Documentación mínima en JSDoc para funciones públicas
- [ ] Sin `console.log` en código de producción
- [ ] Sin datos hardcodeados que deban venir de BD

---

## 12. Glosario rápido

| Término | Definición |
|---------|-----------|
| **Ruta** | Recorrido fijo con origen, destino y secuencia de paradas |
| **Viaje** | Salida concreta de una ruta en fecha y hora específica |
| **Reserva** | Retención temporal de asiento(s) con tiempo de expiración |
| **Venta** | Operación confirmada tras pago simulado exitoso |
| **Pago simulado** | Resultado académico de una operación de prueba; no real |
| **Boleto** | Derecho de embarque identificado con QR único |
| **Embarque** | Validación del uso del boleto por el inspector |
| **Manifiesto** | Lista de pasajeros confirmados para un viaje |

---

*Última actualización: Fase 0 — Especificación y planificación*  
*Coordinador: Agente Arquitecto Senior*
