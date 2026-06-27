import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { ensureProvisioned } from "../../src/server/auth/provisioning";
import { resolveActiveOrg, withActiveOrg, withActiveOrgContext } from "../../src/server/context";

// WP-1.4 [W1-CONTEXT-001] verification — the SERVER-VALIDATED active-org context (the GUC guard) +
// the fully-concrete provisioning composition wire. Boundary-legal: imports only `src/server` (the
// app-layer composition edge) and `src/shared/db`; never a module internal.
//
// Asserts:
//   (a) provision a user via the NOW-CONCRETE wire (`ensureProvisioned` with default deps — the concrete
//       M0 `allocateHumanReference` facade from `@/modules/core/contracts`), then resolve their active
//       org → equals their personal org id;
//   (b) `withActiveOrg` SETS the GUCs: inside the tx, current_setting('app.active_org') = the resolved org,
//       current_setting('app.user_id') = the user, current_setting('app.is_platform_staff') = 'false';
//   (c) FAIL-CLOSED: a session whose auth_user_id has no active membership → no active org (resolved:false),
//       fn never runs — not all-orgs, not a leaking error.

const FIXTURE_AUTH_USER_ID = "01920000-0000-7000-8000-00000000c001";
const FIXTURE_EMAIL = "context@example.com";
const UNPROVISIONED_AUTH_USER_ID = "01920000-0000-7000-8000-00000000c0ff";

async function cleanup(authUserId: string): Promise<void> {
  // TEST-ONLY hard-delete teardown (production never hard-deletes — Invariant #8; the test DB is ephemeral).
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

describe("WP-1.4 server-validated active-org context + concrete provisioning wire", () => {
  beforeEach(async () => {
    await cleanup(FIXTURE_AUTH_USER_ID);
    await cleanup(UNPROVISIONED_AUTH_USER_ID);
  });

  afterAll(async () => {
    await cleanup(FIXTURE_AUTH_USER_ID);
    await cleanup(UNPROVISIONED_AUTH_USER_ID);
    await prisma.$disconnect();
  });

  it("provisions via the concrete wire, then resolves the active org = the personal org", async () => {
    // (a) Provision through the NOW-CONCRETE composition wire (default deps — no injected stand-in).
    const provisioned = await ensureProvisioned({
      authUserId: FIXTURE_AUTH_USER_ID,
      email: FIXTURE_EMAIL,
    });
    expect(provisioned.created).toBe(true);
    expect(provisioned.organizationId).not.toBeNull();

    // Server-resolve the active org from a confirmed active membership (never client input).
    const resolution = await resolveActiveOrg({ authUserId: FIXTURE_AUTH_USER_ID });
    expect(resolution.resolved).toBe(true);
    if (!resolution.resolved) throw new Error("unreachable");
    expect(resolution.context.userId).toBe(provisioned.userId);
    expect(resolution.context.activeOrgId).toBe(provisioned.organizationId);
    expect(resolution.context.isPlatformStaff).toBe(false);
  });

  it("withActiveOrg SETS the transaction-local GUCs (active_org, user_id, is_platform_staff)", async () => {
    const provisioned = await ensureProvisioned({
      authUserId: FIXTURE_AUTH_USER_ID,
      email: FIXTURE_EMAIL,
    });
    expect(provisioned.created).toBe(true);

    const outcome = await withActiveOrg(
      { authUserId: FIXTURE_AUTH_USER_ID },
      async (tx, context) => {
        // Read the GUCs back INSIDE the RLS-scoped transaction — proves the guard SET them per request.
        const rows = await tx.$queryRawUnsafe<
          { active_org: string | null; user_id: string | null; staff: string | null }[]
        >(
          "SELECT current_setting('app.active_org', true) AS active_org, " +
            "current_setting('app.user_id', true) AS user_id, " +
            "current_setting('app.is_platform_staff', true) AS staff",
        );
        return { row: rows[0]!, context };
      },
    );

    expect(outcome.resolved).toBe(true);
    if (!outcome.resolved) throw new Error("unreachable");
    expect(outcome.value.row.active_org).toBe(provisioned.organizationId);
    expect(outcome.value.row.user_id).toBe(provisioned.userId);
    expect(outcome.value.row.staff).toBe("false");
    expect(outcome.value.context.activeOrgId).toBe(provisioned.organizationId);
  });

  it("GUCs are transaction-LOCAL — they do not leak past the withActiveOrg transaction", async () => {
    const provisioned = await ensureProvisioned({
      authUserId: FIXTURE_AUTH_USER_ID,
      email: FIXTURE_EMAIL,
    });
    expect(provisioned.created).toBe(true);
    const resolution = await resolveActiveOrg({ authUserId: FIXTURE_AUTH_USER_ID });
    if (!resolution.resolved) throw new Error("unreachable");

    await withActiveOrgContext(resolution.context, async (tx) => {
      const inside = await tx.$queryRawUnsafe<{ v: string | null }[]>(
        "SELECT current_setting('app.active_org', true) AS v",
      );
      expect(inside[0]!.v).toBe(resolution.context.activeOrgId);
    });

    // OUTSIDE the transaction (a fresh statement on the shared client): the GUC is unset → NULL.
    // (set_config(..., true) is transaction-local — no session/connection bleed.)
    const outside = await prisma.$queryRawUnsafe<{ v: string | null }[]>(
      "SELECT current_setting('app.active_org', true) AS v",
    );
    expect(outside[0]!.v === null || outside[0]!.v === "").toBe(true);
  });

  it("FAIL-CLOSED: a session with no active membership resolves to NO active org (fn never runs)", async () => {
    // An authenticated auth_user_id that was never provisioned → no user → no active membership.
    const resolution = await resolveActiveOrg({ authUserId: UNPROVISIONED_AUTH_USER_ID });
    expect(resolution.resolved).toBe(false);
    if (resolution.resolved) throw new Error("unreachable");
    expect(resolution.reason).toBe("no-user");

    let fnRan = false;
    const outcome = await withActiveOrg({ authUserId: UNPROVISIONED_AUTH_USER_ID }, async () => {
      fnRan = true; // MUST NOT be reached — no transaction opens without a validated active org.
      return "should-not-happen";
    });

    expect(fnRan).toBe(false); // fail-closed: fn never invoked
    expect(outcome.resolved).toBe(false);
    if (outcome.resolved) throw new Error("unreachable");
    expect(outcome.reason).toBe("no-user");
  });

  it("FAIL-CLOSED: a provisioned user whose only membership is INACTIVE has no active org", async () => {
    const provisioned = await ensureProvisioned({
      authUserId: FIXTURE_AUTH_USER_ID,
      email: FIXTURE_EMAIL,
    });
    expect(provisioned.created).toBe(true);

    // Soft-deactivate the sole membership (TEST setup): set its state away from 'active'.
    await prisma.membership.updateMany({
      where: { userId: provisioned.userId },
      data: { state: "suspended" },
    });

    const resolution = await resolveActiveOrg({ authUserId: FIXTURE_AUTH_USER_ID });
    expect(resolution.resolved).toBe(false);
    if (resolution.resolved) throw new Error("unreachable");
    expect(resolution.reason).toBe("no-active-membership"); // not all-orgs; deny/empty
  });
});
