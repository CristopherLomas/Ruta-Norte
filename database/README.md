# Base de Datos — Ruta Norte (PostgreSQL 15+)

Este directorio contiene todo lo relacionado con la base de datos relacional del proyecto Ruta Norte.

---

## Estructura de la Carpeta
- `schema.sql`: Script DDL consolidado que crea las 18 tablas en 3NF, claves foráneas UUID v4, índices y restricciones de integridad.
- `seed.sql`: Datos semilla deterministas que insertan 18 localidades georreferenciadas (desde Tulcán hasta Otavalo), rutas Panamericana E35, flota y usuarios de prueba.
- `migrations/`: Scripts SQL versionados y secuenciales (000001 a 000004) para control formal de cambios.

---

## Cómo Ejecutar / Importar la Base de Datos
```bash
# 1. Crear la base de datos en PostgreSQL local
createdb -U postgres rutanorte

# 2. Ejecutar el esquema DDL
psql -U postgres -d rutanorte -f database/schema.sql

# 3. Insertar los datos semilla
psql -U postgres -d rutanorte -f database/seed.sql
```
