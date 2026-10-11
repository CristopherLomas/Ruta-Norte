# Guía de Instalación y Configuración — Ruta Norte

> Esta guía describe los pasos necesarios para configurar el entorno de ejecución, la base de datos Supabase, ejecutar las migraciones y levantar el sistema tanto en desarrollo local como en despliegue.

---

## 1. Requisitos Previos

- **Node.js**: v18.18+ (probado y certificado en v24.16.0)
- **npm**: v10+ (probado en v11.13.0)
- **Git**: v2.40+
- **Supabase CLI** (opcional para desarrollo local con Docker) o una cuenta en [Supabase](https://supabase.com).

---

## 2. Instalación de Dependencias

Clona el repositorio e instala los paquetes necesarios:

```bash
git clone <URL_REPOSITORIO>
cd Rutas
npm install
```

---

## 3. Variables de Entorno

Copia el archivo `.env.example` como `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con las claves de tu proyecto Supabase:

```env
# URL de tu instancia de Supabase (Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Llave anónima pública (Settings -> API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Llave de servicio con permisos elevados (SOLO SERVIDOR, NUNCA EXPONER AL CLIENTE)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# URL de la aplicación web
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Credenciales de usuarios de demostración (SOLO PARA DESARROLLO LOCAL)
DEMO_ADMIN_PASSWORD=contrasena-segura-admin-demo
DEMO_OPERATOR_PASSWORD=contrasena-segura-operador-demo
DEMO_SELLER_PASSWORD=contrasena-segura-vendedor-demo
DEMO_INSPECTOR_PASSWORD=contrasena-segura-inspector-demo
DEMO_PASSENGER_PASSWORD=contrasena-segura-pasajero-demo
```

> [!CAUTION]
> El archivo `.env.local` está explícitamente ignorado por `.gitignore` y **nunca** debe ser añadido al control de versiones de Git.

---

## 4. Configuración y Migraciones en Supabase

Las migraciones SQL están organizadas cronológicamente en la carpeta `supabase/migrations/`:

| Archivo | Contenido |
|---|---|
| `20261010_000001_initial_schema.sql` | 18 tablas, enums, relaciones FK, índices de rendimiento y constraints. |
| `20261010_000002_rls_policies.sql` | RLS habilitado en todas las tablas + políticas completas para los 5 roles. |
| `20261010_000003_functions_and_triggers.sql` | Funciones transaccionales (`reserve_seats`, `confirm_booking_on_payment`, `expire_pending_bookings`, `validate_ticket_qr`) y triggers. |
| `supabase/seed.sql` | Roles base, localidades del norte de Ecuador, paradas, rutas y unidades con layout JSONB. |

### Opción A: Aplicación vía Supabase CLI (Recomendada si tienes Docker)

```bash
# Iniciar servicios locales de Supabase
npx supabase start

# Aplicar todas las migraciones pendientes
npx supabase db reset

# O aplicar directamente al proyecto remoto vinculado
npx supabase link --project-ref tu-id-de-proyecto
npx supabase db push
```

### Opción B: Aplicación vía Supabase Studio (SQL Editor)

Si utilizas la plataforma web de Supabase:
1. Accede a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a la sección **SQL Editor**.
3. Ejecuta en orden secuencial:
   - `supabase/migrations/20261010_000001_initial_schema.sql`
   - `supabase/migrations/20261010_000002_rls_policies.sql`
   - `supabase/migrations/20261010_000003_functions_and_triggers.sql`
   - `supabase/seed.sql`

---

## 5. Verificación y Pruebas del Sistema

Ejecuta la suite de verificación automatizada:

```bash
# 1. Comprobación estricta de tipos TypeScript
npm run typecheck

# 2. Análisis estático de código con ESLint
npm run lint

# 3. Pruebas unitarias de concurrencia, expiración, QR y RLS (Vitest)
npm run test:unit
```

---

## 6. Ejecución del Servidor de Desarrollo

Inicia la aplicación en modo desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con la plataforma.
