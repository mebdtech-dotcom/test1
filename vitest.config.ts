import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vitest config — unit/contract/integration runner (Doc-8B D1: Vitest + single TS toolchain).
// E2E is Playwright (tests/e2e, excluded here). Hermetic: only out-of-wire boundaries are mocked
// (tests/_harness/mocks.ts); domain/data/contract paths are never mocked (Band I).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    globalSetup: ["tests/_harness/global-setup.ts"],
    // Determinism: zero flaky tolerance (Doc-8B §6). Seeded clock + deterministic IDs land
    // with the modules that need them (Wave 2); no domain assertions at Wave 0.
  },
});
