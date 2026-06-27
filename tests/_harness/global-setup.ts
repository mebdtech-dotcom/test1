import { applyMigrations, hasTestDatabase } from "./db";

// Vitest global setup (Doc-8B §3) — ephemeral test-DB bootstrap, run once before the suite.
//
// When a test DB is configured (CI provides a postgres service container; local dev via
// docker-compose), apply the migration set. At Wave 0 that set is the parked baseline
// (ESC-W0-MIGRATE-SCHEMAS), so this is a no-op that proves the migrate runner. Without a DB,
// DB-dependent suites are inactive — the harness foundation still runs (the runner + the
// hermetic mock boundary need no database).
export default async function setup(): Promise<void> {
  if (hasTestDatabase()) {
    await applyMigrations();
  } else {
    console.log(
      "[harness] DATABASE_URL not set — DB-dependent suites inactive; runner + mock-boundary foundation active.",
    );
  }
}
