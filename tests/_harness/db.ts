import { execSync } from "node:child_process";

// Ephemeral test-DB bootstrap (Doc-8B §3/§5). TS-native; never a live external service (R12).
//
// Wave 0 scope (runnable foundation only):
//   - hasTestDatabase()  — is a test DB configured?
//   - applyMigrations()  — apply the forward-only migration set to it.
// At Wave 0 the migration set is the PARKED baseline (see ESC-W0-MIGRATE-SCHEMAS): applying it
// proves `prisma migrate deploy` runs but creates nothing. The "10 schemas exist" probe and the
// transaction-rollback isolation over real tables are PARKED — they activate when the first owned
// tables land (Doc-6B/6C, Wave 2). Authoring them now would assert against a non-existent oracle
// (Doc-8 Band I — observe-never-author).

export function hasTestDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// Apply migrations to the configured test DB (forward-only; Doc-6A §11). No-op at Wave 0 (parked
// baseline), green either way. Requires DATABASE_URL (+ DIRECT_URL) in env.
export async function applyMigrations(): Promise<void> {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}

// Isolation strategy (Doc-8B §3): transaction-rollback by default; savepoint / schema-reset
// opt-out for Band-C RLS role-switching + Band-F real-atomicity. Realized when tables exist
// (Wave 2). Declared here as the foundation contract; not yet exercised.
export const ISOLATION_STRATEGY = "transaction-rollback" as const;
