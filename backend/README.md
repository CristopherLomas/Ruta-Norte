# Backend — Ruta Norte (API RESTful Modular Spring Boot 3)

Este directorio contiene todo el código del backend de **Ruta Norte**, desarrollado con **Java 17+**, **Spring Boot 3.2**, **Spring Data JPA**, **Spring Security con JWT** y **PostgreSQL**.

La arquitectura está organizada siguiendo el patrón **Package by Feature (Modular Monolith)**: cada dominio de negocio posee su propia carpeta independiente con sus correspondientes controladores, servicios, repositorios, entidades JPA y DTOs tipados.

---

## 📁 Estructura Modular por Dominios de Negocio

```
backend/src/main/java/ec/edu/upec/rutanorte/
│
├── 📁 auth/                          # Dominio de Autenticación y Cuentas
│   ├── controller/AuthController.java
│   ├── service/AuthService.java
│   ├── repository/ProfileRepository.java, RoleRepository.java
│   ├── entity/Profile.java, Role.java
│   └── dto/AuthRequest.java, AuthResponse.java
│
├── 📁 booking/                       # Dominio de Reservas y Asientos
│   ├── controller/BookingController.java
│   ├── service/BookingService.java
│   ├── repository/BookingRepository.java, BookingSeatRepository.java
│   ├── entity/Booking.java, BookingSeat.java
│   └── dto/BookingRequest.java, BookingResponse.java
│
├── 📁 trip/                          # Dominio de Viajes y Programación
│   ├── controller/TripController.java
│   ├── service/TripService.java
│   ├── repository/TripRepository.java
│   ├── entity/Trip.java
│   └── dto/TripResponse.java
│
├── 📁 payment/                       # Dominio de Pagos y Venta Simulada
│   ├── controller/PaymentController.java
│   ├── service/PaymentService.java
│   ├── repository/PaymentRepository.java
│   ├── entity/Payment.java
│   └── dto/PaymentRequest.java, PaymentResponse.java
│
├── 📁 ticket/                        # Dominio de Boletos y QR Criptográfico
│   ├── controller/TicketController.java
│   ├── service/TicketService.java
│   ├── repository/TicketRepository.java
│   ├── entity/Ticket.java
│   └── dto/TicketResponse.java
│
├── 📁 inspector/                     # Dominio de Andén y Control de Abordaje
│   ├── controller/InspectorController.java
│   ├── service/InspectorService.java
│   └── dto/ValidateBoardingRequest.java, ValidateBoardingResponse.java
│
├── 📁 route/                         # Dominio de Rutas, Paradas y Localidades
│   ├── controller/RouteController.java
│   ├── service/RouteService.java
│   ├── repository/RouteRepository.java, StopRepository.java, LocalityRepository.java
│   ├── entity/Route.java, Stop.java, Locality.java
│   └── dto/RouteDto.java
│
├── 📁 fleet/                         # Dominio de Flota, Buses y Cooperativas
│   ├── controller/FleetController.java
│   ├── service/FleetService.java
│   ├── repository/BusRepository.java, BusSeatRepository.java, CooperativeRepository.java
│   ├── entity/Bus.java, BusSeat.java, Cooperative.java
│   └── dto/BusDto.java
│
├── 📁 shared/                        # Infraestructura y Utilidades Transversales
│   ├── config/SecurityConfig.java, JwtService.java, JwtAuthenticationFilter.java
│   ├── exception/GlobalExceptionHandler.java, BadRequestException.java, ResourceNotFoundException.java
│   └── dto/ApiResponse.java
│
└── RutaNorteApplication.java         # Clase Principal Spring Boot (Component Scan Raíz)
```

---

## 🔌 Catálogo de Endpoints RESTful Implementados

| Módulo | Método | Endpoint | Descripción | Acceso |
|--------|--------|----------|-------------|--------|
| **auth** | `POST` | `/api/auth/login` | Autenticación con email/password y emisión de JWT | Público |
| **trip** | `GET` | `/api/trips` | Búsqueda de viajes programados con cupos disponibles | Público |
| **trip** | `GET` | `/api/trips/{id}/seats` | Consulta de la matriz y estado de asientos de un viaje | Público |
| **route** | `GET` | `/api/routes` | Catálogo de rutas interparroquiales y tiempos | Público |
| **fleet** | `GET` | `/api/fleet/buses` | Catálogo de unidades y cooperativas de transporte | Operador / Admin |
| **booking** | `POST` | `/api/bookings` | Bloqueo atómico pesimista de asientos con expiración (10 min) | Pasajero / Vendedor |
| **booking** | `DELETE` | `/api/bookings/{id}` | Cancelación voluntaria de reserva y liberación de asientos | Pasajero / Vendedor |
| **payment** | `POST` | `/api/payments/process` | Confirmación simulada y emisión de boleto | Pasajero / Vendedor |
| **ticket** | `GET` | `/api/tickets/{id}` | Consulta de boleto emitido y token criptográfico | Pasajero / Inspector |
| **inspector** | `POST` | `/api/inspector/validate-boarding` | Validación de boleto QR en andén y prevención de doble uso | Inspector / Admin |

---

## 🚀 Ejecución del Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Compilar y ejecutar la aplicación Spring Boot
mvn spring-boot:run
```

- **Puerto:** `8080`
- **Documentación Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **Especificación OpenAPI v3:** `http://localhost:8080/v3/api-docs`
