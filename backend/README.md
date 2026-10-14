# Módulo de Referencia Backend — Spring Boot 3

> **Nota Arquitectónica:** Este directorio contiene la implementación de referencia en Java / Spring Boot 3 para los endpoints RESTful de Ruta Norte. La arquitectura principal y operativa del proyecto en producción es el **Monolito Modular** implementado en `src/` (Next.js 14 App Router + Server Actions + Supabase PostgreSQL).

## Estructura del Módulo
- `src/main/java/ec/edu/upec/rutanorte/`:
  - `controller/`: `@RestController` para autenticación, viajes, reservas, pagos e inspección.
  - `service/`: Lógica de negocio (expiración a 10 min, emisión de boletos, bloqueo pesimista).
  - `repository/`: Repositorios Spring Data JPA con consultas atómicas.
  - `entity/`: Entidades JPA mapeadas a las 18 tablas de PostgreSQL.
  - `config/`: Configuración de Spring Security, JWT y CORS.
