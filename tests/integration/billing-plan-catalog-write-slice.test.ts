import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  handleActivatePlan,
  handleCreatePlan,
  handleRetirePlan,
  handleUpdatePlan,
} from "../../src/server/billing";
import type { AuthSession } from "../../src/server/auth/provisioning";
import { ensureProvisioned } from "../../src/server/auth";
import type { ResolveStaffContext } from "../../src/server/context";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-2 [Wave-3 M7] — the wired BC-BILL-1 Admin plan-catalog WRITES vertical-slice test
// (create/activate/update/retire — Doc-4I §HB-1.1 + §HB-1.1a / Doc-5I §4 / Doc-6I §3.1.1). Platform-staff
// (Admin) audited writes; NO org context; Model B (owner ruling 2026-07-11 — `status` derived from
// `is_active` + soft-delete). Exercised through the wired composition (`src/server/billing`) against a real
// Postgres. The staff basis is injected (`resolveStaffContext`) — production DC-3 is fail-closed (Wave 2).
//
// RLS NOTE: the local/CI connection is `postgres` (rolbypassrls), so the wired assertions exercise the
// APP-LAYER logic + append the audit row; the dedicated `asRestrictedRole` case separately proves the
// `plans_admin` WRITE backstop (a non-staff role's INSERT hits the RLS WITH CHECK, fail-closed).

const STAFF_USER = "01930000-0000-7000-8000-0000000000c1";
const SESSION: AuthSession = {
  authUserId: "01930000-0000-7000-8000-0000000000c2",
  email: "admin@example.test",
};
const NAME_PREFIX = "W3BILL2";

const authed = async (): Promise<AuthSession | null> => SESSION;
const anon = async (): Promise<AuthSession | null> => null;
const asStaff: ResolveStaffContext = async () => ({ userId: STAFF_USER, isPlatformStaff: true });
const asNonStaff: ResolveStaffContext = async () => null;
// The catalog write touches no user-scoped data — a no-op provisioning stub (the composition awaits it).
const noopProvision = (async () => undefined) as unknown as typeof ensureProvisioned;

function staffDeps() {
  return { resolveSession: authed, ensureProvisioned: noopProvision, resolveStaffContext: asStaff };
}
function nonStaffDeps() {
  return {
    resolveSession: authed,
    ensureProvisioned: noopProvision,
    resolveStaffContext: asNonStaff,
  };
}
function anonDeps() {
  return { resolveSession: anon, ensureProvisioned: noopProvision, resolveStaffContext: asStaff };
}

function resultOf<T>(body: unknown): T {
  if (typeof body === "object" && body !== null && "result" in body) {
    return (body as { result: T }).result;
  }
  throw new Error(`expected a success envelope, got: ${JSON.stringify(body)}`);
}
function errorOf(body: unknown): { error_class: string; error_code: string } {
  if (typeof body === "object" && body !== null && "error" in body) {
    return (body as { error: { error_class: string; error_code: string } }).error;
  }
  throw new Error(`expected an error envelope, got: ${JSON.stringify(body)}`);
}

/** Seed a plan directly (fresh id, `NAME_PREFIX` for cleanup) in a known state; returns its id. */
async function seedPlan(opts: { isActive: boolean; deletedAt?: Date }): Promise<string> {
  const id = uuidv7();
  await prisma.plan.create({
    data: {
      id,
      name: `${NAME_PREFIX} seed ${id.slice(0, 8)}`,
      billingCycle: "monthly",
      price: "100",
      currency: "BDT",
      isActive: opts.isActive,
      ...(opts.deletedAt !== undefined ? { deletedAt: opts.deletedAt } : {}),
    },
  });
  return id;
}

async function loadPlan(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    select: { isActive: true, deletedAt: true, name: true, price: true },
  });
}

/** Find the latest audit row for a plan action (Admin-attributed). */
async function findAudit(entityId: string, action: string) {
  return prisma.auditRecord.findFirst({
    where: { entityType: "plans", entityId, action },
    orderBy: { eventTime: "desc" },
    select: { actorId: true, actorType: true, organizationId: true, newValue: true },
  });
}

async function cleanup(): Promise<void> {
  await prisma.plan.deleteMany({ where: { name: { startsWith: NAME_PREFIX } } });
  // audit_records are immutable (Doc-6B) — not cleaned; assertions match by action, tolerant of accumulation.
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
  await cleanup();
});
afterAll(async () => {
  await cleanup();
});

describe("billing.create_plan.v1 (wired) — Doc-4I §HB-1.1 / Doc-5I §4", () => {
  it("401 when unauthenticated", async () => {
    const { status } = await handleCreatePlan(
      { name: `${NAME_PREFIX} X`, billingCycle: "monthly", price: "500", currency: "BDT" },
      anonDeps(),
    );
    expect(status).toBe(401);
  });

  it("403 for a non-staff caller ([ESC-BILL-SLUG] — unconditional deny-by-construction)", async () => {
    const { status, body } = await handleCreatePlan(
      { name: `${NAME_PREFIX} X`, billingCycle: "monthly", price: "500", currency: "BDT" },
      nonStaffDeps(),
    );
    expect(status).toBe(403);
    expect(errorOf(body).error_code).toBe("billing_plan_forbidden");
  });

  it("400 for invalid input (SYNTAX before the staff gate)", async () => {
    const { status, body } = await handleCreatePlan(
      { name: "", billingCycle: "monthly", price: "500", currency: "BDT" },
      staffDeps(),
    );
    expect(status).toBe(400);
    expect(errorOf(body).error_code).toBe("billing_plan_invalid_input");
  });

  it("201 + Location, status draft, + an Admin-attributed audit row (staff)", async () => {
    const { status, body, headers } = await handleCreatePlan(
      { name: `${NAME_PREFIX} Pro`, billingCycle: "annual", price: "9999.50", currency: "BDT" },
      staffDeps(),
    );
    expect(status).toBe(201);
    const result = resultOf<{ planId: string; status: string }>(body);
    expect(result.status).toBe("draft");
    expect(headers?.Location).toBe(`/billing/plans/${result.planId}`);

    const row = await loadPlan(result.planId);
    expect(row?.isActive).toBe(false); // draft (Model B)
    expect(row?.deletedAt).toBeNull();
    expect(row?.name).toBe(`${NAME_PREFIX} Pro`);

    const audit = await findAudit(result.planId, "plan_created");
    expect(audit).not.toBeNull();
    expect(audit?.actorType).toBe("admin");
    expect(audit?.actorId).toBe(STAFF_USER);
    expect(audit?.organizationId).toBeNull(); // platform scope
  });
});

describe("billing.activate_plan.v1 (wired) — Doc-4I §HB-1.1a", () => {
  it("200 draft→active (sets is_active), + a plan_activated audit row", async () => {
    const planId = await seedPlan({ isActive: false }); // draft
    const { status, body } = await handleActivatePlan(
      { planId, expectedStatus: "draft" },
      staffDeps(),
    );
    expect(status).toBe(200);
    expect(resultOf<{ status: string }>(body).status).toBe("active");
    expect((await loadPlan(planId))?.isActive).toBe(true); // Model B: activate = set is_active
    expect(await findAudit(planId, "plan_activated")).not.toBeNull();
  });

  it("409 STATE activating an already-active plan (illegal source)", async () => {
    const planId = await seedPlan({ isActive: true }); // active
    const { status, body } = await handleActivatePlan(
      { planId, expectedStatus: "draft" },
      staffDeps(),
    );
    expect(status).toBe(409);
    expect(errorOf(body).error_code).toBe("billing_plan_illegal_state");
  });

  it("400 when expected_status is not draft (SYNTAX)", async () => {
    const planId = await seedPlan({ isActive: false });
    const { status } = await handleActivatePlan(
      { planId, expectedStatus: "active" as "draft" },
      staffDeps(),
    );
    expect(status).toBe(400);
  });

  it("422 REFERENCE for an absent plan", async () => {
    const { status, body } = await handleActivatePlan(
      { planId: uuidv7(), expectedStatus: "draft" },
      staffDeps(),
    );
    expect(status).toBe(422);
    expect(errorOf(body).error_class).toBe("REFERENCE");
  });
});

describe("billing.update_plan.v1 (wired) — Doc-4I §HB-1.1", () => {
  it("200 marketing update (name/price), is_active + status UNCHANGED (no status edge)", async () => {
    const planId = await seedPlan({ isActive: true }); // active
    const { status, body } = await handleUpdatePlan(
      { planId, expectedStatus: "active", name: `${NAME_PREFIX} Renamed`, price: "1234" },
      staffDeps(),
    );
    expect(status).toBe(200);
    expect(resultOf<{ status: string }>(body).status).toBe("active"); // unchanged
    const row = await loadPlan(planId);
    expect(row?.name).toBe(`${NAME_PREFIX} Renamed`);
    expect(Number(row?.price)).toBe(1234);
    expect(row?.isActive).toBe(true); // Model B: update never touches is_active
    expect(await findAudit(planId, "plan_updated")).not.toBeNull();
  });

  it("409 CONFLICT on an expected_status mismatch", async () => {
    const planId = await seedPlan({ isActive: true }); // active
    const { status, body } = await handleUpdatePlan(
      { planId, expectedStatus: "draft", name: `${NAME_PREFIX} Nope` },
      staffDeps(),
    );
    expect(status).toBe(409);
    expect(errorOf(body).error_code).toBe("billing_plan_conflict");
  });

  it("409 STATE updating a retired (terminal) plan", async () => {
    const planId = await seedPlan({ isActive: true, deletedAt: new Date() }); // retired
    const { status, body } = await handleUpdatePlan(
      { planId, expectedStatus: "active", name: `${NAME_PREFIX} Nope` },
      staffDeps(),
    );
    expect(status).toBe(409);
    expect(errorOf(body).error_code).toBe("billing_plan_illegal_state");
  });

  it("400 when no marketing field is supplied", async () => {
    const planId = await seedPlan({ isActive: true });
    const { status } = await handleUpdatePlan({ planId, expectedStatus: "active" }, staffDeps());
    expect(status).toBe(400);
  });
});

describe("billing.retire_plan.v1 (wired) — Doc-4I §HB-1.1", () => {
  it("200 active→retired (soft-delete), + a plan_retired audit row", async () => {
    const planId = await seedPlan({ isActive: true }); // active
    const { status, body } = await handleRetirePlan(
      { planId, expectedStatus: "active" },
      staffDeps(),
    );
    expect(status).toBe(200);
    expect(resultOf<{ status: string }>(body).status).toBe("retired");
    expect((await loadPlan(planId))?.deletedAt).not.toBeNull(); // SD = retire
    expect(await findAudit(planId, "plan_retired")).not.toBeNull();
  });

  it("409 STATE retiring an already-retired plan (terminal)", async () => {
    const planId = await seedPlan({ isActive: true, deletedAt: new Date() }); // retired
    const { status, body } = await handleRetirePlan(
      { planId, expectedStatus: "active" },
      staffDeps(),
    );
    expect(status).toBe(409);
    expect(errorOf(body).error_code).toBe("billing_plan_illegal_state");
  });

  it("409 CONFLICT on an expected_status mismatch", async () => {
    const planId = await seedPlan({ isActive: false }); // draft
    const { status, body } = await handleRetirePlan(
      { planId, expectedStatus: "active" },
      staffDeps(),
    );
    expect(status).toBe(409);
    expect(errorOf(body).error_code).toBe("billing_plan_conflict");
  });
});

describe("plan-catalog WRITE RLS backstop (DB-role-switch, Doc-8B §5) — Doc-6I §3.x", () => {
  it("a non-staff role's INSERT into billing.plans is rejected by plans_admin (fail-closed)", async () => {
    // is_platform_staff unset ⇒ current_setting(...,true) NULL ⇒ plans_admin WITH CHECK false ⇒ RLS rejects.
    await expect(
      asRestrictedRole({}, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.plans (id, name, billing_cycle, price, currency, is_active)
           VALUES ($1::uuid, $2, 'monthly'::billing.billing_cycle, 1, 'BDT', false)`,
          uuidv7(),
          `${NAME_PREFIX} rls-probe`,
        );
      }),
    ).rejects.toThrow(/row-level security|policy/i);
  });
});
