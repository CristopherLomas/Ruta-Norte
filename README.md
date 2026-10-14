# Ruta Norte — Sistema de Gestión de Transporte Interparroquial y Venta de Boletos

> **Arquitectura:** Modular dividida en Frontend, Backend y Database  
> **Autores / Desarrolladores:**
> - **Cristopher Lomas**
> - **Alejandra Changuan**
> - **Adrianna Guamialama**  
> **Institución:** Universidad Politécnica Estatal del Carchi (UPEC)  
> **Región:** Provincias de Carchi e Imbabura (Norte del Ecuador — Corredor Panamericana E35)  
> **Despliegue en Producción (Vercel):** [https://ruta-norte.vercel.app](https://ruta-norte.vercel.app)  
> **Presentación Interactiva de Defensa:** [https://ruta-norte.vercel.app/presentacion](https://ruta-norte.vercel.app/presentacion)

---

## 📁 Estructura del Repositorio (Organizada para Cualquier Desarrollador)

El proyecto está claramente dividido en carpetas de primer nivel para que cualquier programador pueda ubicar, entender y modificar el código de inmediato:

```
Ruta-Norte/
├── 📁 frontend/              # Cliente Web interactivo (Next.js 14 App Router + Tailwind + shadcn/ui)
│   ├── src/app/              # Rutas y páginas segmentadas por rol ((admin), (operator), (passenger), etc.)
│   ├── src/features/         # 12 Módulos de dominio (auth, trips, bookings, tickets, inspector, etc.)
│   ├── src/components/       # Catálogo UI shadcn/ui y componentes compartidos de dominio
│   ├── src/lib/              # Clientes de servicios, cartografía Leaflet y validadores SRI/ANT
│   ├── src/services/         # Cliente HTTP tipado (apiClient.ts) para conectar con el backend
│   └── public/               # Activos estáticos y diapositivas de presentación web
│
├── 📁 backend/               # API RESTful modular (Java 17+ / Spring Boot 3 / Package by Feature)
│   ├── src/main/java/.../    # Paquetes organizados por dominio:
│   │   ├── auth/             # controller, service, repository, entity, dto
│   │   ├── booking/          # controller, service, repository, entity, dto
│   │   ├── trip/             # controller, service, repository, entity, dto
│   │   ├── payment/          # controller, service, repository, entity, dto
│   │   ├── ticket/           # controller, service, repository, entity, dto
│   │   ├── inspector/        # controller, service, dto
│   │   ├── route/            # controller, service, repository, entity, dto
│   │   ├── fleet/            # controller, service, repository, entity, dto
│   │   └── shared/           # config (JWT/CORS), exception (GlobalHandler), dto
│   └── pom.xml               # Dependencias Maven y configuración del proyecto
│
├── 📁 database/              # Persistencia relacional (PostgreSQL 15+)
│   ├── schema.sql            # Script DDL consolidado (18 tablas relacionales en 3NF con UUID v4)
│   ├── seed.sql              # Dataset maestro determinista (18 localidades Carchi-Imbabura, rutas, flota)
│   └── migrations/           # Scripts SQL versionados (000001 a 000004) para control de cambios
│
├── 📁 docs/                  # Documentación formal de Ingeniería de Software
│   ├── requirements.md       # Requisitos funcionales y no funcionales
│   ├── architecture.md       # Especificación completa de arquitectura y flujos
│   ├── data-model.md         # Modelo entidad-relación y diccionario de datos
│   └── security-model.md     # Políticas de seguridad, RBAC y control de acceso
│
└── README.md                 # Guía principal de arquitectura y ejecución
```

---

## ⚡ Guía de Inicio Rápido (Quickstart)

### 1. Base de Datos (PostgreSQL 15+)
```bash
# Crear la base de datos e importar el esquema y datos semilla
psql -U postgres -c "CREATE DATABASE rutanorte;"
psql -U postgres -d rutanorte -f database/schema.sql
psql -U postgres -d rutanorte -f database/seed.sql
```

### 2. Backend (Spring Boot 3 REST API)
```bash
cd backend
mvn spring-boot:run
# La API se iniciará en http://localhost:8080
# Documentación Swagger interactiva: http://localhost:8080/swagger-ui.html
```

### 3. Frontend (Cliente Web Next.js 14)
```bash
cd frontend
npm install
npm run dev
# La aplicación web estará disponible en http://localhost:3000
```

---

## 🧪 Pruebas Automatizadas
El sistema incluye una suite de **103 pruebas unitarias** que verifican el 100% de las reglas de negocio críticas (expiración de reservas en 10 minutos, prevención de doble abordaje, layout de asientos y validaciones SRI/ANT):
```bash
npm test
```

---

*Proyecto de Aplicaciones Web — Carrera de Computación / Software — UPEC 2026*
