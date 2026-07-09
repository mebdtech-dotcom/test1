import { describe, expect, it } from "vitest";
import { configValueQuery, featureFlagEvaluate, CoreServiceError } from "@/modules/core/contracts";

// W2-CORE-1 — 8B unit band: input-validation paths of the two M0 read services (Doc-4B §B8/§B9
// V1 SYNTAX). These paths throw BEFORE any data access, so no test DB is required (hermetic).
// Error codes asserted VERBATIM from Doc-4B: `core_config_invalid_key` · `core_flag_invalid_input`.
// Boundary-legal: imports only `@/modules/core/contracts` (the M0 public surface).

async function expectCoreError(promise: Promise<unknown>, code: string): Promise<void> {
  let caught: unknown;
  try {
    await promise;
  } catch (e) {
    caught = e;
  }
  expect(caught).toBeInstanceOf(CoreServiceError);
  expect((caught as CoreServiceError).code).toBe(code);
}

describe("W2-CORE-1 core.config_value_query.v1 — V1 SYNTAX (Doc-4B §B8)", () => {
  it("rejects a bare registered key (missing the Doc-4A §18.2 reference prefix) → core_config_invalid_key", async () => {
    await expectCoreError(
      configValueQuery({ key: "core.audit_query_page_size_max" }),
      "core_config_invalid_key",
    );
  });

  it("rejects an empty key → core_config_invalid_key", async () => {
    await expectCoreError(configValueQuery({ key: "" }), "core_config_invalid_key");
  });

  it("rejects a malformed reference (no <key_name> segment) → core_config_invalid_key", async () => {
    await expectCoreError(
      configValueQuery({ key: "core.system_configuration.core" }),
      "core_config_invalid_key",
    );
  });

  it("rejects a non-snake-case segment → core_config_invalid_key", async () => {
    await expectCoreError(
      configValueQuery({ key: "core.system_configuration.core.Audit-Max" }),
      "core_config_invalid_key",
    );
  });
});

describe("W2-CORE-1 core.feature_flag_evaluate.v1 — V1 SYNTAX (Doc-4B §B9)", () => {
  it("rejects an empty flag_key → core_flag_invalid_input", async () => {
    await expectCoreError(featureFlagEvaluate({ flagKey: "" }), "core_flag_invalid_input");
  });

  it("rejects a whitespace-only flag_key → core_flag_invalid_input", async () => {
    await expectCoreError(featureFlagEvaluate({ flagKey: "   " }), "core_flag_invalid_input");
  });

  it("rejects a non-object scope (array — not the scope_jsonb shape) → core_flag_invalid_input", async () => {
    await expectCoreError(
      featureFlagEvaluate({
        flagKey: "test.w2core1.any",
        // Runtime-invalid on purpose (the contract type forbids it statically).
        scope: ["not", "an", "object"] as unknown as Record<string, unknown>,
      }),
      "core_flag_invalid_input",
    );
  });
});
