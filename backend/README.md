# ☕ Capa de Backend — API RESTful Spring Boot 3 (Java 17+)

Este directorio contiene el backend empresarial desarrollado en **Spring Boot 3** para el sistema de transporte interparroquial **Ruta Norte** (Universidad Politécnica Estatal del Carchi - UPEC).

---

## 1. Arquitectura del Backend

El backend está estructurado bajo el patrón por capas empresarial estándar:

```
backend/
├── pom.xml                                   # Configuración de dependencias Maven
└── src/main/java/ec/edu/upec/rutanorte/
    ├── RutaNorteApplication.java             # Clase principal de arranque
    ├── config/                               # Spring Security 6, JWT (JJWT), CORS
    │   ├── SecurityConfig.java               # Reglas de autorización y CORS
    │   ├── JwtService.java                   # Emisión y validación de tokens JWT
    │   └── JwtAuthenticationFilter.java      # Filtro perimetral OncePerRequestFilter
    ├── controller/                           # Controladores RESTful (@RestController)
    │   ├── AuthController.java               # POST /api/auth/login
    │   ├── TripController.java               # GET /api/trips, GET /api/trips/{id}/seats
    │   ├── BookingController.java            # POST /api/bookings, DELETE /api/bookings/{id}
    │   ├── PaymentController.java            # POST /api/payments
    │   └── InspectorController.java          # POST /api/inspector/validate-ticket
    ├── dto/                                  # Data Transfer Objects (Request / Response)
    │   ├── ApiResponse.java                  # Contenedor estandarizado { ok, message, data, timestamp }
    │   ├── AuthRequest.java / AuthResponse.java
    │   ├── BookingRequest.java / BookingResponse.java
    │   ├── PaymentRequest.java / PaymentResponse.java
    │   └── ValidateBoardingRequest.java / ValidateBoardingResponse.java
    ├── entity/                               # Modelos JPA mapeados a las 18 tablas de PostgreSQL
    │   ├── Profile.java, Role.java, Locality.java, Stop.java, Route.java
    │   ├── Cooperative.java, Bus.java, BusSeat.java, Trip.java
    │   ├── Booking.java, BookingSeat.java, Payment.java, Ticket.java
    │   └── ...
    ├── repository/                           # Spring Data JPA con consultas transaccionales
    │   ├── BusSeatRepository.java            # Consulta con @Lock(PESSIMISTIC_WRITE)
    │   ├── TripRepository.java
    │   ├── BookingRepository.java
    │   └── TicketRepository.java
    ├── service/                              # Lógica de negocio y transacciones (@Service)
    │   ├── BookingService.java               # Reserva atómica y expiración a 10 min
    │   ├── PaymentService.java               # Cobro simulado y emisión de boletos
    │   ├── TicketService.java                # Token criptográfico opaco RN-HEX16 (ADR-002)
    │   ├── InspectorService.java             # Validación de andén y prevención de doble uso
    │   ├── TripService.java                  # Itinerarios y matriz de asientos
    │   └── AuthService.java                  # Autenticación con JWT
    └── exception/                            # Manejo global (@RestControllerAdvice)
```

---

## 2. Requisitos y Ejecución

### Requisitos Previos:
- **Java Development Kit (JDK 17 o 21 LTS)**
- **Apache Maven 3.9+** (o el wrapper `mvnw`)

### Comandos de Ejecución:
```bash
# Navegar a la carpeta backend
cd backend

# Compilar y empaquetar el proyecto
mvn clean package -DskipTests

# Ejecutar el servidor en el puerto 8080
mvn spring-boot:run
```

---

## 3. Documentación Interactiva Swagger / OpenAPI

Una vez iniciado el servidor, la documentación Swagger interactiva está disponible en:
- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Especificación OpenAPI (JSON):** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 4. Matriz de Endpoints RESTful Principales

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Autenticación y retorno de token JWT | Público |
| `GET` | `/api/trips` | Búsqueda de viajes programados | Público |
| `GET` | `/api/trips/{id}/seats` | Mapa de disponibilidad gráfica de asientos | Público |
| `POST` | `/api/bookings` | Reserva atómica con bloqueo pesimista | Autenticado |
| `DELETE` | `/api/bookings/{id}` | Cancelación voluntaria de reserva | Propietario / Admin |
| `POST` | `/api/payments` | Confirmación de pago y emisión de boletos | Autenticado |
| `POST` | `/api/inspector/validate-ticket` | Validación de embarque con lector QR | Inspector / Admin |
