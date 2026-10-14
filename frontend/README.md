# Frontend — Ruta Norte (Cliente Web & UI Modular)

Este directorio contiene todo el código del cliente web y la interfaz de usuario de **Ruta Norte**, desarrollado con **Next.js 14 (App Router)**, **TypeScript estricto**, **Tailwind CSS** y **shadcn/ui**.

---

## Estructura Modular del Frontend

```
frontend/
├── src/
│   ├── app/                      # Capa de Presentación & Rutas (Next.js App Router)
│   │   ├── (public)/             # Rutas públicas (buscador de viajes, checkout, boletos)
│   │   ├── (auth)/               # Flujo de autenticación (login, registro, recuperación)
│   │   ├── (passenger)/          # Portal del pasajero (mis boletos digitales)
│   │   ├── (seller)/             # Taquilla de venta y emisión presencial
│   │   ├── (inspector)/          # Terminal móvil del inspector (escáner QR de andén)
│   │   ├── (operator)/           # Panel del operador (despachos, viajes, incidencias)
│   │   ├── (admin)/              # Panel administrativo (rutas, flota, conductores, reportes)
│   │   ├── api/                  # Route Handlers RESTful para consumo móvil/externo
│   │   ├── globals.css           # Tokens de diseño CSS y Tailwind
│   │   └── layout.tsx            # Layout raíz con proveedores y fuentes
│   │
│   ├── features/                 # 12 Módulos de Dominio (Bounded Contexts)
│   │   ├── auth/                 # Autenticación, RBAC y manejo de sesión
│   │   ├── bookings/             # Reservas temporales (10 min) y prevención de colisión
│   │   ├── buses/                # Flota, cooperativas y layouts de asientos (30/40/44)
│   │   ├── cooperatives/         # Cooperativas de transporte interparroquial
│   │   ├── drivers/              # Conductores, licencias tipo E/D y disponibilidad
│   │   ├── incidents/            # Reporte y trazabilidad de incidencias en ruta
│   │   ├── inspector/            # Escáner móvil de andén y validación antifraude
│   │   ├── payments/             # Pasarela de pagos simulada académica
│   │   ├── reports/              # Analítica de ocupación y recaudación con Recharts
│   │   ├── routes/               # Rutas, secuencias de paradas y cálculo vial Panamericana E35
│   │   ├── tickets/              # Emisión de boletos y tokens QR criptográficos
│   │   └── trips/                # Programación de salidas, itinerarios y manifiesto
│   │
│   ├── components/               # Sistema de Diseño UI
│   │   ├── ui/                   # Primitivas accesibles shadcn/ui montadas sobre Radix UI
│   │   └── shared/               # Componentes compartidos de dominio (SeatMap, Timer, etc.)
│   │
│   ├── lib/                      # Infraestructura y Servicios Transversales
│   │   ├── supabase/             # Clientes de base de datos (SSR, Admin y Middleware)
│   │   ├── auth/                 # Guards de permisos y redirecciones por rol
│   │   ├── maps/                 # Motor geoespacial Leaflet y cálculo de distancias
│   │   └── validations/          # Validaciones SRI/ANT (algoritmo Módulo 10 y placas)
│   │
│   ├── services/                 # Clientes HTTP (apiClient.ts para conexión REST con backend)
│   ├── types/                    # Contratos y tipos globales TypeScript en modo estricto
│   └── middleware.ts             # Guard perimetral de seguridad RBAC con cookies HttpOnly
│
├── public/                       # Activos estáticos y presentación interactiva
│   ├── presentacion.html         # Diapositivas interactivas de defensa
│   └── presentacion/index.html   # Ruta limpia de presentación
│
├── package.json                  # Dependencias y scripts del frontend
├── tsconfig.json                 # Configuración estricta de TypeScript
├── tailwind.config.ts            # Tokens y paleta de colores institucional
└── next.config.mjs               # Rewrites y configuración de Next.js
```

---

## Cómo Ejecutar el Frontend

```bash
# 1. Ingresar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor en modo desarrollo
npm run dev

# 4. El cliente estará disponible en:
# http://localhost:3000
```
