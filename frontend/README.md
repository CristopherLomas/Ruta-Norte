# 💻 Capa de Frontend — Interfaz de Usuario y Cliente Web

Este directorio contiene la aplicación cliente desacoplada de **Ruta Norte**, desarrollada con **Next.js / React**, **Tailwind CSS**, **shadcn/ui** y **Leaflet**.

---

## 1. Arquitectura del Frontend

El cliente web interactúa directamente con la API REST de **Spring Boot** (`http://localhost:8080/api`) mediante el cliente tipado `src/services/apiClient.ts`.

```
frontend/
├── src/
│   ├── app/                      # Rutas y páginas organizadas por rol (Route Groups)
│   │   ├── (public)/             # Buscador de viajes, checkout y visor de boleto QR
│   │   ├── (auth)/               # Login y registro de usuarios
│   │   ├── (passenger)/          # Portal del pasajero e historial de boletos
│   │   ├── (seller)/             # Punto de venta en ventanilla
│   │   ├── (inspector)/          # Escáner de boletos QR en andén
│   │   ├── (operator)/           # Despacho de viajes e incidencias
│   │   ├── (admin)/              # Gestión de flota, cooperativas y rutas
│   │   └── globals.css           # Tokens de diseño y estilos de Leaflet
│   ├── components/               # Catálogo de componentes visuales
│   │   ├── ui/                   # Primitivos shadcn/ui accesibles (Radix UI)
│   │   ├── shared/               # Navbar, Sidebar, SeatMap, TicketBadge, QRDisplay
│   │   └── maps/                 # Visor de mapas interactivo Leaflet (InteractiveMap.tsx)
│   ├── features/                 # Componentes interactivos de cliente
│   │   ├── bookings/             # Selector gráfico de asientos + temporizador
│   │   ├── inspector/            # Lector de cámara QR en navegador
│   │   └── reports/              # Analítica y métricas con Recharts
│   └── services/                 # Capa de integración HTTP con Spring Boot
│       └── apiClient.ts          # Métodos tipados para consumo de la API REST
└── package.json
```

---

## 2. Ejecución del Frontend

```bash
# 1. Navegar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo (puerto 3000)
npm run dev
```

El frontend estará disponible en: [http://localhost:3000](http://localhost:3000).

---

## 3. Configuración de Conexión con Spring Boot

Por defecto, el frontend se comunica con Spring Boot en `http://localhost:8080/api`. Puedes modificar la URL creando un archivo `.env.local`:

```env
NEXT_PUBLIC_SPRING_API_URL=http://localhost:8080/api
```
