import { describe, it, expect } from "vitest";
import { createMockDoubles } from "../_harness/mocks";
import { ISOLATION_STRATEGY, hasTestDatabase } from "../_harness/db";

// Wave 0 harness smoke (Doc-8B Bands H/I) — proves the runner executes and the hermetic
// mock boundary is wired. Authors NO domain/contract assertion (observe-never-author): there
// are no owned tables/aggregates yet (those land in Wave 2+). The "10 schemas exist" probe is
// PARKED pending ESC-W0-MIGRATE-SCHEMAS.
describe("harness foundation (Wave 0)", () => {
  it("runs the Vitest runner", () => {
    expect(1 + 1).toBe(2);
  });

  it("exposes the configured isolation strategy", () => {
    expect(ISOLATION_STRATEGY).toBe("transaction-rollback");
    // hasTestDatabase() reflects env only; either branch is valid at Wave 0.
    expect(typeof hasTestDatabase()).toBe("boolean");
  });

  it("provides the six out-of-wire test doubles (Doc-8B §7), in-memory and isolated", async () => {
    const m = createMockDoubles();

    await m.storage.put("k", new Uint8Array([1, 2, 3]));
    expect(await m.storage.get("k")).toEqual(new Uint8Array([1, 2, 3]));
    expect(await m.storage.get("missing")).toBeNull();

    await m.realtime.publish("ch", { a: 1 });
    expect(m.realtime.published).toEqual([{ channel: "ch", event: { a: 1 } }]);

    await m.email.send({ to: "buyer@example.com", subject: "hello" });
    expect(m.email.sent).toHaveLength(1);

    m.analytics.capture("evt", { x: 1 });
    expect(m.analytics.events).toEqual([{ event: "evt", props: { x: 1 } }]);

    await m.jobs.dispatch("noop", { id: 1 });
    expect(m.jobs.dispatched).toEqual([{ name: "noop", data: { id: 1 } }]);

    expect(await m.ai.suggest("hi")).toContain("mock-suggestion");
  });

  it("creates fresh, isolated doubles per call (hermeticity)", async () => {
    const a = createMockDoubles();
    const b = createMockDoubles();
    await a.email.send({ to: "x@y.co", subject: "s" });
    expect(a.email.sent).toHaveLength(1);
    expect(b.email.sent).toHaveLength(0);
  });
});
