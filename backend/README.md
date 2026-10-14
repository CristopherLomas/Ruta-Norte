# Backend — Ruta Norte (API RESTful Spring Boot 3)

Este directorio contiene todo el código del backend de **Ruta Norte**, desarrollado con **Java 17+**, **Spring Boot 3.2**, **Spring Data JPA**, **Spring Security con JWT** y **PostgreSQL**.

---

## Estructura Modular del Backend

```
backend/
├── src/main/java/ec/edu/upec/rutanorte/
│   ├── controller/               # Controladores @RestController (Endpoints RESTful)
│   │   ├── AuthController.java           # /api/auth (Login, registro, autenticación)
│   │   ├── TripController.java           # /api/trips (Búsqueda de viajes y asientos)
│   │   ├── BookingController.java        # /api/bookings (Creación y cancelación de reservas)
│   │   ├── PaymentController.java        # /api/payments (Procesamiento simulado y confirmación)
│   │   └── InspectorController.java      # /api/inspector (Validación de boletos QR en andén)
│   │
│   ├── service/                  # Capa de Lógica de Negocio y Reglas de Dominio
│   │   ├── AuthService.java              # Verificación de credenciales y generación JWT
│   │   ├── TripService.java              # Consulta de cupos y matriz de asientos
│   │   ├── BookingService.java           # Bloqueo a 10 min y expiración temporal
│   │   ├── PaymentService.java           # Confirmación de compra y emisión
│   │   ├── TicketService.java            # Generación de tokens QR firmados HMAC-SHA256
│   │   └── InspectorService.java         # Validación de abordaje y prevención de doble uso
│   │
│   ├── repository/               # Capa de Acceso a Datos (Spring Data JPA)
│   │   ├── BookingRepository.java        # Consultas de reservas activas y expiradas
│   │   ├── BookingSeatRepository.java    # Bloqueo de asientos por viaje
│   │   ├── BusSeatRepository.java        # Consultas con @Lock(PESSIMISTIC_WRITE)
│   │   ├── PaymentRepository.java        # Registro transaccional de pagos
│   │   ├── ProfileRepository.java        # Usuarios y perfiles
│   │   ├── TicketRepository.java         # Boletos emitidos y estado de abordaje
│   │   └── TripRepository.java           # Viajes programados y disponibilidad
│   │
│   ├── entity/                   # Entidades JPA (Mapeadas a las 18 tablas PostgreSQL)
│   │   ├── Booking.java, BookingSeat.java
│   │   ├── Bus.java, BusSeat.java, Cooperative.java
│   │   ├── Locality.java, Stop.java, Route.java
│   │   ├── Profile.java, Role.java
│   │   ├── Ticket.java, Payment.java, Trip.java
│   │
│   ├── dto/                      # Objetos de Transferencia de Datos Tipados (Request / Response)
│   │   ├── ApiResponse.java              # Envoltorio genérico estándar
│   │   ├── AuthRequest.java, AuthResponse.java
│   │   ├── BookingRequest.java, BookingResponse.java
│   │   ├── PaymentRequest.java, PaymentResponse.java
│   │   └── ValidateBoardingRequest.java, ValidateBoardingResponse.java
│   │
│   ├── config/                   # Seguridad, JWT y Filtros Perimetrales
│   │   ├── SecurityConfig.java           # Reglas de CORS y permisos RBAC
│   │   ├── JwtService.java               # Firma y validación de tokens Bearer
│   │   └── JwtAuthenticationFilter.java  # Interceptor perimetral por petición
│   │
│   ├── exception/                # Manejo Centralizado de Excepciones
│   │   ├── GlobalExceptionHandler.java   # Captura y formateo de errores HTTP
│   │   ├── BadRequestException.java
│   │   └── ResourceNotFoundException.java
│   │
│   └── RutaNorteApplication.java # Clase principal de arranque de Spring Boot
│
├── src/main/resources/
│   └── application.properties    # Configuración de base de datos, puerto y JWT
└── pom.xml                       # Dependencias Maven (Spring Boot, JJWT, Postgres)
```

---

## Cómo Ejecutar el Backend

### Prerrequisitos
- **Java:** JDK 17 o superior
- **Maven:** Versión 3.8+
- **PostgreSQL:** Instancia en ejecución (puerto 5432)

### Comandos de Ejecución
```bash
# 1. Ingresar a la carpeta backend
cd backend

# 2. Compilar y ejecutar la aplicación Spring Boot
mvn spring-boot:run

# 3. La API RESTful estará disponible en:
# http://localhost:8080

# 4. Documentación interactiva Swagger / OpenAPI:
# http://localhost:8080/swagger-ui.html
```
