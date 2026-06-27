-- Wave 0 baseline migration — Board ruling R-a on ESC-W0-MIGRATE-SCHEMAS.
--
-- Creates the 10 FROZEN module schema namespaces (Doc-2 §10; Doc-6A R3 — the names are fixed
-- in prisma/schema.prisma's datasource.schemas; this coins nothing). Forward-only, idempotent:
-- `IF NOT EXISTS` keeps each module's own first `CREATE SCHEMA` (Doc-6B…6K, Waves 2+) a safe
-- no-op, so no per-module migration is contradicted. No tables/enums/RLS here (spine only).

CREATE SCHEMA IF NOT EXISTS "core";
CREATE SCHEMA IF NOT EXISTS "identity";
CREATE SCHEMA IF NOT EXISTS "marketplace";
CREATE SCHEMA IF NOT EXISTS "rfq";
CREATE SCHEMA IF NOT EXISTS "operations";
CREATE SCHEMA IF NOT EXISTS "trust";
CREATE SCHEMA IF NOT EXISTS "communication";
CREATE SCHEMA IF NOT EXISTS "billing";
CREATE SCHEMA IF NOT EXISTS "admin";
CREATE SCHEMA IF NOT EXISTS "ai";
