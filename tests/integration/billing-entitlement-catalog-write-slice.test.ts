import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  handleBundlePlanEntitlement,
  handleCreateEntitlement,
  handleUpdateEntitlement,
} from "../../src/server/billing";
import type { AuthSession } from "../../src/server/auth/provisioning";
import { ensureProvisioned } from "../../src/server/auth";
import type { ResolveStaffContext } from "../../src/server/context";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W3-BILL-3 [Wave-3 M7] — the wired BC-BILL-1 Admin ENTITLEMENT-CATALOG + BUNDLE writes vertical-slice
// (create/update entitlement — Doc-4I §HB-1.3; bundle_plan_entitlement — Doc-4I §HB-1.2 / Doc-5I §4).
// Platform-staff (Admin) audited writes; NO org; exercised through the wired composition. Staff basis
// injected (DC-3 fail-closed in prod). Wired assertions exercise the APP layer + append the audit;
// `asRestrictedRole` proves the `entitlements_admin` WRITE backstop (non-staff INSERT → RLS reject).

const STAFF_USER = "01930000-0000-7000-8000-0000000000d1";
const SESSION: AuthSession = {
  authUserId: "01930000-0000-7000-8000-0000000000d2",
  email: "admin@example.test",
};
const SLUG_PREFIX = "w3bill3_";
const NAME_PREFIX = "W3BILL3";

const authed = async (): Promise<AuthSession | null> => SESSION;
const anon = async (): Promise<AuthSession | null> => null;
const asStaff: ResolveStaffContext = async () => ({ userId: STAFF_USER, isPlatformStaff: true });
const asNonStaff: ResolveStaffContext = async () => null;
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
  if (typeof body === "object" && body !== null && "result" in body)
    return (body as { result: T }).result;
  throw new Error(`expected a success envelope, got: ${JSON.stringify(body)}`);
}
function errorOf(body: unknown): { error_class: string; error_code: string } {
  if (typeof body === "object" && body !== null && "error" in body)
    return (body as { error: { error_class: string; error_code: string } }).error;
  throw new Error(`expected an error envelope, got: ${JSON.stringify(body)}`);
}

async function seedEntitlement(
  slug: string,
  type: "boolean" | "numeric" | "enum_",
): Promise<string> {
  const id = uuidv7();
  await prisma.entitlement.create({ data: { id, slug, type } });
  return id;
}
async function seedPlan(): Promise<string> {
  const id = uuidv7();
  await prisma.plan.create({
    data: {
      id,
      name: `${NAME_PREFIX} plan ${id.slice(0, 8)}`,
      billingCycle: "monthly",
      price: "100",
      currency: "BDT",
      isActive: true,
    },
  });
  return id;
}
async function findAudit(entityType: string, entityId: string, action: string) {
  return prisma.auditRecord.findFirst({
    where: { entityType, entityId, action },
    orderBy: { eventTime: "desc" },
    select: { actorType: true, actorId: true, organizationId: true },
  });
}

async function cleanup(): Promise<void> {
  const ents = await prisma.entitlement.findMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
    select: { id: true },
  });
  const plans = await prisma.plan.findMany({
    where: { name: { startsWith: NAME_PREFIX } },
    select: { id: true },
  });
  const entIds = ents.map((e) => e.id);
  const planIds = plans.map((p) => p.id);
  await prisma.planEntitlement.deleteMany({
    where: { OR: [{ entitlementId: { in: entIds } }, { planId: { in: planIds } }] },
  });
  await prisma.entitlement.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
  await prisma.plan.deleteMany({ where: { name: { startsWith: NAME_PREFIX } } });
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
  await cleanup();
});
afterAll(async () => {
  await cleanup();
});

describe("billing.create_entitlement.v1 (wired) — Doc-4I §HB-1.3", () => {
  it("401 unauthenticated · 403 non-staff · 400 bad input", async () => {
    expect(
      (await handleCreateEntitlement({ slug: `${SLUG_PREFIX}a`, type: "numeric" }, anonDeps()))
        .status,
    ).toBe(401);
    expect(
      (await handleCreateEntitlement({ slug: `${SLUG_PREFIX}a`, type: "numeric" }, nonStaffDeps()))
        .status,
    ).toBe(403);
    // bad type
    const bad = await handleCreateEntitlement(
      { slug: `${SLUG_PREFIX}a`, type: "weird" as "numeric" },
      staffDeps(),
    );
    expect(bad.status).toBe(400);
  });

  it("201 + Location, {entitlement_id, slug, type}, enum→enum_ stored, + audit (staff)", async () => {
    const slug = `${SLUG_PREFIX}support_tier`;
    const { status, body, headers } = await handleCreateEntitlement(
      { slug, type: "enum", defaultValue: "standard" },
      staffDeps(),
    );
    expect(status).toBe(201);
    const result = resultOf<{ entitlementId: string; slug: string; type: string }>(body);
    expect(result.slug).toBe(slug);
    expect(result.type).toBe("enum"); // wire value
    expect(headers?.Location).toBe(`/billing/entitlements/${result.entitlementId}`);

    const row = await prisma.entitlement.findUnique({
      where: { id: result.entitlementId },
      select: { type: true, slug: true },
    });
    expect(row?.type).toBe("enum_"); // Prisma client value for DB 'enum'

    const audit = await findAudit("entitlements", result.entitlementId, "entitlement_created");
    expect(audit?.actorType).toBe("admin");
    expect(audit?.organizationId).toBeNull();
  });

  it("422 BUSINESS on a duplicate slug", async () => {
    const slug = `${SLUG_PREFIX}dupe`;
    const first = await handleCreateEntitlement({ slug, type: "boolean" }, staffDeps());
    expect(first.status).toBe(201);
    const second = await handleCreateEntitlement({ slug, type: "boolean" }, staffDeps());
    expect(second.status).toBe(422);
    expect(errorOf(second.body).error_class).toBe("BUSINESS");
    expect(errorOf(second.body).error_code).toBe("billing_entitlement_slug_conflict");
  });
});

describe("billing.update_entitlement.v1 (wired) — Doc-4I §HB-1.3", () => {
  it("200 updates type, returns {entitlement_id, slug, type}, + audit", async () => {
    const slug = `${SLUG_PREFIX}upd`;
    const id = await seedEntitlement(slug, "numeric");
    const { status, body } = await handleUpdateEntitlement(
      { entitlementId: id, type: "boolean" },
      staffDeps(),
    );
    expect(status).toBe(200);
    const result = resultOf<{ entitlementId: string; slug: string; type: string }>(body);
    expect(result.slug).toBe(slug); // slug immutable identity
    expect(result.type).toBe("boolean");
    const row = await prisma.entitlement.findUnique({ where: { id }, select: { type: true } });
    expect(row?.type).toBe("boolean");
    expect(await findAudit("entitlements", id, "entitlement_updated")).not.toBeNull();
  });

  it("422 REFERENCE for an absent entitlement", async () => {
    const { status, body } = await handleUpdateEntitlement(
      { entitlementId: uuidv7(), type: "boolean" },
      staffDeps(),
    );
    expect(status).toBe(422);
    expect(errorOf(body).error_class).toBe("REFERENCE");
  });

  it("400 when no field is supplied", async () => {
    const id = await seedEntitlement(`${SLUG_PREFIX}nofield`, "numeric");
    const { status } = await handleUpdateEntitlement({ entitlementId: id }, staffDeps());
    expect(status).toBe(400);
  });
});

describe("billing.bundle_plan_entitlement.v1 (wired) — Doc-4I §HB-1.2", () => {
  it("200 bundles a plan↔entitlement (value_jsonb) + audit; re-bundle is idempotent (no new row)", async () => {
    const planId = await seedPlan();
    const entId = await seedEntitlement(`${SLUG_PREFIX}bundle`, "numeric");

    const first = await handleBundlePlanEntitlement(
      { planId, entitlementId: entId, valueJsonb: 100 },
      staffDeps(),
    );
    expect(first.status).toBe(200);
    const r = resultOf<{ planId: string; entitlementId: string }>(first.body);
    expect(r.planId).toBe(planId);
    expect(r.entitlementId).toBe(entId);

    const row = await prisma.planEntitlement.findUnique({
      where: { planId_entitlementId: { planId, entitlementId: entId } },
      select: { valueJsonb: true },
    });
    expect(row?.valueJsonb).toBe(100);

    // audit: entity_type=plan_entitlements, entity_id=plan_id (the aggregate root).
    expect(await findAudit("plan_entitlements", planId, "plan_entitlement_bundled")).not.toBeNull();

    // re-bundle with a new value → idempotent upsert (still ONE row, value refreshed).
    const second = await handleBundlePlanEntitlement(
      { planId, entitlementId: entId, valueJsonb: 250 },
      staffDeps(),
    );
    expect(second.status).toBe(200);
    const count = await prisma.planEntitlement.count({ where: { planId, entitlementId: entId } });
    expect(count).toBe(1);
    const updated = await prisma.planEntitlement.findUnique({
      where: { planId_entitlementId: { planId, entitlementId: entId } },
      select: { valueJsonb: true },
    });
    expect(updated?.valueJsonb).toBe(250);
  });

  it("422 REFERENCE when the plan or the entitlement does not resolve", async () => {
    const entId = await seedEntitlement(`${SLUG_PREFIX}refent`, "numeric");
    const planId = await seedPlan();
    const noPlan = await handleBundlePlanEntitlement(
      { planId: uuidv7(), entitlementId: entId, valueJsonb: 1 },
      staffDeps(),
    );
    expect(noPlan.status).toBe(422);
    const noEnt = await handleBundlePlanEntitlement(
      { planId, entitlementId: uuidv7(), valueJsonb: 1 },
      staffDeps(),
    );
    expect(noEnt.status).toBe(422);
  });

  it("400 when value_jsonb is missing", async () => {
    const planId = await seedPlan();
    const entId = await seedEntitlement(`${SLUG_PREFIX}noval`, "numeric");
    const { status } = await handleBundlePlanEntitlement(
      { planId, entitlementId: entId, valueJsonb: undefined },
      staffDeps(),
    );
    expect(status).toBe(400);
  });
});

describe("entitlement-catalog WRITE RLS backstop (Doc-8B §5) — Doc-6I §3.x", () => {
  it("a non-staff role's INSERT into billing.entitlements is rejected (entitlements_admin, fail-closed)", async () => {
    await expect(
      asRestrictedRole({}, async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO billing.entitlements (id, slug, type)
           VALUES ($1::uuid, $2, 'numeric'::billing.entitlement_type)`,
          uuidv7(),
          `${SLUG_PREFIX}rls_probe`,
        );
      }),
    ).rejects.toThrow(/row-level security|policy/i);
  });
});
