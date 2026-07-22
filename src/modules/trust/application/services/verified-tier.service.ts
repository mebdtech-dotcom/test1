// M5 application (PRIVATE) — the Verified Financial Tier write-SERVICE (Doc-4G §G4.6/§G4.7; Doc-6G §3.1.3).
// The five transitions the DEFERRED admin commands + System expire timer will call — exercised DIRECTLY by
// tests. ORCHESTRATION ONLY (owns no state): validate (state machine + guards) → SD-function write → EMIT
// `VendorTierChanged` → append ONE audit — ALL on the SAME caller-supplied tx executor.
//
// THE LOAD-BEARING WRITE-PLUS-EMIT ATOMICITY (Doc-8F; this is the codebase's FIRST §8 emission): the tier
// write (SD function — owner-role RLS bypass, participates in the caller's tx), the `VendorTierChanged`
// emit (M0 `core.write_outbox_event.v1`), and the ONE audit (M0 `core.append_audit_record.v1`) ALL run on
// the ONE tx `db`. Emit-failure OR audit-failure rolls the WHOLE tx back — no tier row, no event, no audit.
// A no-op (expire on a non-verified source) writes NEITHER an event NOR an audit.
//
// BOUNDARY: M0 `appendAuditRecord` + `writeOutboxEvent` are INJECTED as contract TYPES (the trust module
// imports NOTHING from M1/M2; core contract TYPES are allowed — the WP2 precedent). Attribution (Doc-4G §7):
// Admin for set/confirm/downgrade/suspend; System for expire. The caller's tx MUST carry the platform-staff
// GUC (`app.is_platform_staff = true`) — natural for the Admin/System actor — so the outbox INSERT
// (`outbox_events_platform_staff`) and the audit append (staff leg of `audit_records_context_append`) are
// admitted. Trust NEVER writes `marketplace.financial_tier_history` (Doc-4G §8 — Marketplace consumes).
//
// BASIS (Doc-4G §G4.6 stage-8): `establishVerifiedTier` enforces an APPROVED tier-verification basis
// (`verification_record_id`) IN-BAND against trust's OWN WP1 `verification_records` table — no verified tier
// / `VendorTierChanged` is minted without one. [ESC] DEFERRED (genuinely cross-module, WP2-style edge
// deferral): the stage-7 REFERENCE resolution of `vendor_profile_id` itself against M2/Marketplace (DG-2) —
// the deferred admin composition edge owns it; no M2 resolver / placeholder is built here.
//
// [ESC-TRUST-POLICY] — the 24-month `next_review_at` window is the documented interim constant
// (`verified-tier.constants.ts`; no registered Doc-3 key). [ESC-TRUST-AUDIT] — the per-transition audit
// tokens (`domain/audit-actions.ts`). [ESC-TRUST-CODE] — the interim `trust_verified_tier_*` error register
// (incl. `trust_verified_tier_invalid_basis` — the stage-8 approved-basis fix).

import { prisma, type DbExecutor } from "@/shared/db";
import { UUID_PATTERN, uuidv7 } from "@/shared/ids";
import {
  establishVerifiedTier as establishRepo,
  getVerificationRecordById,
  getVerifiedTierByVendor,
  transitionVerifiedTier as transitionRepo,
} from "@/modules/trust/infrastructure/data/verified-tier.repository";
import {
  VERIFIED_FINANCIAL_TIER_ENTITY_TYPE,
  VerifiedTierAuditAction,
  type VerifiedTierAuditActionToken,
} from "@/modules/trust/domain/audit-actions";
import {
  isExpireNoop,
  isStrictDowngrade,
  isVerifiedTierSourceLegal,
  type FinancialTier,
} from "@/modules/trust/domain/verified-tier.state-machine";
import {
  computeNextReviewAt,
  VERIFIED_TIER_ALREADY_EXISTS_CODE,
  VERIFIED_TIER_ILLEGAL_STATE_CODE,
  VERIFIED_TIER_INVALID_BASIS_CODE,
  VERIFIED_TIER_INVALID_DOWNGRADE_CODE,
  VERIFIED_TIER_INVALID_INPUT_CODE,
  VERIFIED_TIER_NOT_FOUND_CODE,
  VERIFIED_TIER_REVIEW_NOT_DUE_CODE,
  VERIFIED_TIER_REVISION_CONFLICT_CODE,
  VERIFIED_TIER_SUSPEND_REASON_REQUIRED_CODE,
} from "@/modules/trust/domain/verified-tier.constants";
import {
  VENDOR_TIER_CHANGED_EVENT,
  VENDOR_TIER_CHANGED_EVENT_VERSION,
  type VendorTierChangedPayload,
} from "@/modules/trust/contracts/events";
import type { CoreActorType } from "@/modules/core/contracts";
import type {
  ConfirmVerifiedTierInput,
  DowngradeVerifiedTierInput,
  EstablishVerifiedTierInput,
  ExpireVerifiedTierInput,
  SuspendVerifiedTierInput,
  VerifiedTierAdminContext,
  VerifiedTierDeps,
  VerifiedTierError,
  VerifiedTierOutcome,
} from "@/modules/trust/contracts/types";

/** The frozen Doc-2 §10.6 `financial_tier` set (SYNTAX oracle; enums ∈ frozen set). */
const FINANCIAL_TIERS: ReadonlySet<string> = new Set(["A", "B", "C", "D", "E"]);

function isFinancialTier(t: unknown): t is FinancialTier {
  return typeof t === "string" && FINANCIAL_TIERS.has(t);
}

function fail(
  errorClass: VerifiedTierError["errorClass"],
  errorCode: string,
  message: string,
): VerifiedTierOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}

const iso = (d: Date | null): string | null => (d === null ? null : d.toISOString());

/**
 * Emit `VendorTierChanged` + append ONE audit record — BOTH on the caller's tx `db` (atomic with the tier
 * write). Emit FIRST, then audit; a throw from either rolls the whole tx back (Doc-8F). Used by every
 * APPLIED transition (never on an expire no-op).
 */
async function emitAndAudit(p: {
  db: DbExecutor;
  deps: VerifiedTierDeps;
  actorType: CoreActorType;
  actorId: string | null;
  rowId: string;
  vendorProfileId: string;
  oldTier: FinancialTier | null;
  newTier: FinancialTier;
  auditAction: VerifiedTierAuditActionToken;
  oldValue: unknown;
  newValue: unknown;
}): Promise<void> {
  // (3) EMIT `VendorTierChanged` via M0 `core.write_outbox_event.v1` — SAME tx (§16.2 atomicity; Doc-4G §8).
  const payload: Record<string, unknown> = {
    tier_type: "verified",
    vendor_profile_id: p.vendorProfileId,
    old_tier: p.oldTier,
    new_tier: p.newTier,
  } satisfies VendorTierChangedPayload;
  await p.deps.writeOutboxEvent(
    {
      eventName: VENDOR_TIER_CHANGED_EVENT,
      eventVersion: VENDOR_TIER_CHANGED_EVENT_VERSION,
      aggregateId: p.vendorProfileId, // the aggregate the event concerns (Doc-4G §8)
      payload,
    },
    p.db,
  );

  // (4) APPEND ONE audit via M0 `core.append_audit_record.v1` — SAME tx. Admin/System attribution, no org
  //     context (Doc-4B §5.6). If this throws, the tx (incl. the tier write + the emit) rolls back.
  await p.deps.appendAuditRecord(
    {
      actorId: p.actorId,
      actorType: p.actorType,
      organizationId: null,
      entityType: VERIFIED_FINANCIAL_TIER_ENTITY_TYPE,
      entityId: p.rowId,
      action: p.auditAction,
      oldValue: p.oldValue,
      newValue: p.newValue,
    },
    p.db,
  );
}

/**
 * `set` (establish) — absence-of-row → verified (Doc-4G §G4.6). Admin. UNIQUE(vendor_profile_id) guard: a
 * second `set` for the same vendor → BUSINESS. Emits `VendorTierChanged` (old_tier=null) + a `verified_tier_set`
 * audit, atomically with the SD write.
 */
export async function establishVerifiedTier(
  input: EstablishVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db: DbExecutor = prisma,
): Promise<VerifiedTierOutcome> {
  // (1) SYNTAX (Doc-4G §G4.6 stage 1).
  if (typeof input.vendorProfileId !== "string" || !UUID_PATTERN.test(input.vendorProfileId)) {
    return fail(
      "VALIDATION",
      VERIFIED_TIER_INVALID_INPUT_CODE,
      "vendor_profile_id must be a uuid.",
    );
  }
  if (!isFinancialTier(input.tier)) {
    return fail("VALIDATION", VERIFIED_TIER_INVALID_INPUT_CODE, "tier must be one of A–E.");
  }
  if (
    typeof input.verificationRecordId !== "string" ||
    !UUID_PATTERN.test(input.verificationRecordId)
  ) {
    return fail(
      "VALIDATION",
      VERIFIED_TIER_INVALID_INPUT_CODE,
      "verification_record_id must be a uuid.",
    );
  }

  // (2) BUSINESS — the APPROVED tier-verification basis (Doc-4G §G4.6 stage-8, line 339). Read trust's OWN
  //     WP1 `verification_records` table IN-BAND (the establish tx carries the Admin staff GUC → the
  //     `verification_records_admin` RLS admits the read). The basis must EXIST, be `approved`, be a `tier`
  //     verification, and its subject must BE this vendor (§G4.1 "subject_id : the vendor_profile" →
  //     `subject_type='vendor_profile' AND subject_id=vendor_profile_id`). Any failure → BUSINESS: NO tier
  //     row / event / audit is minted without an approved basis (the Review-B MAJOR fix). [ESC] DEFERRED
  //     (genuinely cross-module): the stage-7 REFERENCE resolution of `vendor_profile_id` itself against
  //     M2/Marketplace (DG-2) — the deferred admin edge owns it; no M2 resolver is built here.
  const basis = await getVerificationRecordById(input.verificationRecordId, db);
  if (
    basis === null ||
    basis.state !== "approved" ||
    basis.verificationType !== "tier" ||
    basis.subjectType !== "vendor_profile" ||
    basis.subjectId !== input.vendorProfileId
  ) {
    return fail(
      "BUSINESS",
      VERIFIED_TIER_INVALID_BASIS_CODE,
      "verification_record_id must be an approved tier verification for this vendor (Doc-4G §G4.6).",
    );
  }

  const rowId = uuidv7();
  const verifiedAt = new Date();
  const nextReviewAt = computeNextReviewAt(verifiedAt);

  // (3) WRITE — the privileged establish SD function (RLS bypass; advisory-lock + UNIQUE guard + insert).
  const write = await establishRepo(
    {
      id: rowId,
      vendorProfileId: input.vendorProfileId,
      tier: input.tier,
      verifiedAt,
      nextReviewAt,
      basisJsonb: input.basisJsonb ?? null,
      actorId: ctx.actorId,
    },
    db,
  );

  // BUSINESS (Doc-4G §G4.6 stage 8 / UNIQUE) — a verified-tier row already exists. NO event/audit.
  if (!write.created) {
    return fail(
      "BUSINESS",
      VERIFIED_TIER_ALREADY_EXISTS_CODE,
      "A verified financial tier already exists for this vendor.",
    );
  }

  // Read the just-established row back (same tx; staff RLS) for the authoritative optimistic token.
  const row = await getVerifiedTierByVendor(input.vendorProfileId, db);
  if (row === null) {
    throw new Error("verified-tier establish: row not readable after insert (unreachable).");
  }

  await emitAndAudit({
    db,
    deps,
    actorType: "admin",
    actorId: ctx.actorId,
    rowId,
    vendorProfileId: input.vendorProfileId,
    oldTier: null,
    newTier: input.tier,
    auditAction: VerifiedTierAuditAction.SET,
    oldValue: null,
    newValue: { tier: input.tier, status: "verified", next_review_at: iso(nextReviewAt) },
  });

  return {
    ok: true,
    result: {
      verifiedFinancialTierId: rowId,
      vendorProfileId: input.vendorProfileId,
      tier: input.tier,
      status: "verified",
      nextReviewAt: iso(nextReviewAt),
      updatedAt: row.updatedAt.toISOString(),
      applied: true,
    },
  };
}

/**
 * `confirm` — verified → verified; renew `next_review_at` (+24mo); tier unchanged (Doc-4G §G4.6). Admin.
 * Emits `VendorTierChanged` + a `verified_tier_confirmed` audit, atomically with the SD transition.
 */
export async function confirmVerifiedTier(
  input: ConfirmVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db: DbExecutor = prisma,
): Promise<VerifiedTierOutcome> {
  if (typeof input.vendorProfileId !== "string" || !UUID_PATTERN.test(input.vendorProfileId)) {
    return fail(
      "VALIDATION",
      VERIFIED_TIER_INVALID_INPUT_CODE,
      "vendor_profile_id must be a uuid.",
    );
  }

  const current = await getVerifiedTierByVendor(input.vendorProfileId, db);
  if (current === null) {
    return fail("NOT_FOUND", VERIFIED_TIER_NOT_FOUND_CODE, "Not found.");
  }
  if (!isVerifiedTierSourceLegal("confirm", current.status)) {
    return fail(
      "STATE",
      VERIFIED_TIER_ILLEGAL_STATE_CODE,
      "confirm requires a verified tier (Doc-4G §G4.6).",
    );
  }

  const renewedReviewAt = computeNextReviewAt(new Date());
  const expected = input.expectedUpdatedAt ?? current.updatedAt;

  const write = await transitionRepo(
    {
      vendorProfileId: input.vendorProfileId,
      expectedUpdatedAt: expected,
      newStatus: "verified",
      newTier: null, // keep current tier
      verifiedAt: null, // keep original verification date
      nextReviewAt: renewedReviewAt, // renew the review clock
      actorId: ctx.actorId,
    },
    db,
  );
  if (write.matched === 0 || write.newUpdatedAt === null) {
    return fail(
      "CONFLICT",
      VERIFIED_TIER_REVISION_CONFLICT_CODE,
      "The verified tier changed since it was read; re-read then retry.",
    );
  }

  await emitAndAudit({
    db,
    deps,
    actorType: "admin",
    actorId: ctx.actorId,
    rowId: current.id,
    vendorProfileId: input.vendorProfileId,
    oldTier: current.tier,
    newTier: current.tier,
    auditAction: VerifiedTierAuditAction.CONFIRMED,
    oldValue: { tier: current.tier, status: "verified", next_review_at: iso(current.nextReviewAt) },
    newValue: { tier: current.tier, status: "verified", next_review_at: iso(renewedReviewAt) },
  });

  return {
    ok: true,
    result: {
      verifiedFinancialTierId: current.id,
      vendorProfileId: input.vendorProfileId,
      tier: current.tier,
      status: "verified",
      nextReviewAt: iso(renewedReviewAt),
      updatedAt: write.newUpdatedAt.toISOString(),
      applied: true,
    },
  };
}

/**
 * `downgrade` — verified → verified at a STRICTLY lower tier band (Doc-4G §G4.6). Admin. Emits
 * `VendorTierChanged` + a `verified_tier_downgraded` audit, atomically with the SD transition.
 */
export async function downgradeVerifiedTier(
  input: DowngradeVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db: DbExecutor = prisma,
): Promise<VerifiedTierOutcome> {
  if (typeof input.vendorProfileId !== "string" || !UUID_PATTERN.test(input.vendorProfileId)) {
    return fail(
      "VALIDATION",
      VERIFIED_TIER_INVALID_INPUT_CODE,
      "vendor_profile_id must be a uuid.",
    );
  }
  if (!isFinancialTier(input.newTier)) {
    return fail("VALIDATION", VERIFIED_TIER_INVALID_INPUT_CODE, "tier must be one of A–E.");
  }

  const current = await getVerifiedTierByVendor(input.vendorProfileId, db);
  if (current === null) {
    return fail("NOT_FOUND", VERIFIED_TIER_NOT_FOUND_CODE, "Not found.");
  }
  if (!isVerifiedTierSourceLegal("downgrade", current.status)) {
    return fail(
      "STATE",
      VERIFIED_TIER_ILLEGAL_STATE_CODE,
      "downgrade requires a verified tier (Doc-4G §G4.6).",
    );
  }
  if (!isStrictDowngrade(current.tier, input.newTier)) {
    return fail(
      "BUSINESS",
      VERIFIED_TIER_INVALID_DOWNGRADE_CODE,
      "downgrade must target a strictly lower tier band (Doc-4G §G4.6).",
    );
  }

  const expected = input.expectedUpdatedAt ?? current.updatedAt;
  const write = await transitionRepo(
    {
      vendorProfileId: input.vendorProfileId,
      expectedUpdatedAt: expected,
      newStatus: "verified",
      newTier: input.newTier,
      verifiedAt: null,
      nextReviewAt: null, // keep the current review clock
      actorId: ctx.actorId,
    },
    db,
  );
  if (write.matched === 0 || write.newUpdatedAt === null) {
    return fail(
      "CONFLICT",
      VERIFIED_TIER_REVISION_CONFLICT_CODE,
      "The verified tier changed since it was read; re-read then retry.",
    );
  }

  await emitAndAudit({
    db,
    deps,
    actorType: "admin",
    actorId: ctx.actorId,
    rowId: current.id,
    vendorProfileId: input.vendorProfileId,
    oldTier: current.tier,
    newTier: input.newTier,
    auditAction: VerifiedTierAuditAction.DOWNGRADED,
    oldValue: { tier: current.tier, status: "verified" },
    newValue: { tier: input.newTier, status: "verified" },
  });

  return {
    ok: true,
    result: {
      verifiedFinancialTierId: current.id,
      vendorProfileId: input.vendorProfileId,
      tier: input.newTier,
      status: "verified",
      nextReviewAt: iso(current.nextReviewAt),
      updatedAt: write.newUpdatedAt.toISOString(),
      applied: true,
    },
  };
}

/**
 * `suspend` — verified → suspended; `reason` mandatory (Doc-4G §G4.7). Admin. The tier is unchanged (only
 * the status). The reason is recorded in the immutable AUDIT (no `reason` column on the tier row). Emits
 * `VendorTierChanged` + a `verified_tier_suspended` audit, atomically with the SD transition.
 */
export async function suspendVerifiedTier(
  input: SuspendVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db: DbExecutor = prisma,
): Promise<VerifiedTierOutcome> {
  if (typeof input.vendorProfileId !== "string" || !UUID_PATTERN.test(input.vendorProfileId)) {
    return fail(
      "VALIDATION",
      VERIFIED_TIER_INVALID_INPUT_CODE,
      "vendor_profile_id must be a uuid.",
    );
  }
  if (typeof input.reason !== "string" || input.reason.trim().length === 0) {
    return fail(
      "BUSINESS",
      VERIFIED_TIER_SUSPEND_REASON_REQUIRED_CODE,
      "A suspension reason is required (Doc-4G §G4.7).",
    );
  }

  const current = await getVerifiedTierByVendor(input.vendorProfileId, db);
  if (current === null) {
    return fail("NOT_FOUND", VERIFIED_TIER_NOT_FOUND_CODE, "Not found.");
  }
  if (!isVerifiedTierSourceLegal("suspend", current.status)) {
    return fail(
      "STATE",
      VERIFIED_TIER_ILLEGAL_STATE_CODE,
      "suspend requires a verified tier (Doc-4G §G4.7).",
    );
  }

  const expected = input.expectedUpdatedAt ?? current.updatedAt;
  const write = await transitionRepo(
    {
      vendorProfileId: input.vendorProfileId,
      expectedUpdatedAt: expected,
      newStatus: "suspended",
      newTier: null,
      verifiedAt: null,
      nextReviewAt: null,
      actorId: ctx.actorId,
    },
    db,
  );
  if (write.matched === 0 || write.newUpdatedAt === null) {
    return fail(
      "CONFLICT",
      VERIFIED_TIER_REVISION_CONFLICT_CODE,
      "The verified tier changed since it was read; re-read then retry.",
    );
  }

  await emitAndAudit({
    db,
    deps,
    actorType: "admin",
    actorId: ctx.actorId,
    rowId: current.id,
    vendorProfileId: input.vendorProfileId,
    oldTier: current.tier,
    newTier: current.tier,
    auditAction: VerifiedTierAuditAction.SUSPENDED,
    oldValue: { tier: current.tier, status: "verified" },
    newValue: { tier: current.tier, status: "suspended", reason: input.reason },
  });

  return {
    ok: true,
    result: {
      verifiedFinancialTierId: current.id,
      vendorProfileId: input.vendorProfileId,
      tier: current.tier,
      status: "suspended",
      nextReviewAt: iso(current.nextReviewAt),
      updatedAt: write.newUpdatedAt.toISOString(),
      applied: true,
    },
  };
}

/**
 * `expire` — verified → expired on the 24-month review lapse (Doc-4G §G4.7). System-actor only; idempotent.
 * A non-verified source is a NO-OP SKIP (no event/audit). A not-yet-due review → BUSINESS. Emits
 * `VendorTierChanged` + a `verified_tier_expired` audit (System attribution), atomically with the SD transition.
 */
export async function expireVerifiedTier(
  input: ExpireVerifiedTierInput,
  deps: VerifiedTierDeps,
  db: DbExecutor = prisma,
): Promise<VerifiedTierOutcome> {
  if (typeof input.vendorProfileId !== "string" || !UUID_PATTERN.test(input.vendorProfileId)) {
    return fail(
      "VALIDATION",
      VERIFIED_TIER_INVALID_INPUT_CODE,
      "vendor_profile_id must be a uuid.",
    );
  }

  const current = await getVerifiedTierByVendor(input.vendorProfileId, db);
  if (current === null) {
    return fail("NOT_FOUND", VERIFIED_TIER_NOT_FOUND_CODE, "Not found.");
  }

  // NO-OP SKIP (Doc-4G §G4.7 — expire on a non-verified source is idempotent, never an error). No event/audit.
  if (isExpireNoop(current.status)) {
    return {
      ok: true,
      result: {
        verifiedFinancialTierId: current.id,
        vendorProfileId: input.vendorProfileId,
        tier: current.tier,
        status: current.status,
        nextReviewAt: iso(current.nextReviewAt),
        updatedAt: current.updatedAt.toISOString(),
        applied: false,
      },
    };
  }

  // BUSINESS (Doc-4G §G4.7 stage 8) — the 24-month review must be REACHED to expire.
  const now = input.now ?? new Date();
  if (current.nextReviewAt === null || current.nextReviewAt.getTime() > now.getTime()) {
    return fail(
      "BUSINESS",
      VERIFIED_TIER_REVIEW_NOT_DUE_CODE,
      "The verified tier's 24-month review is not yet due (Doc-4G §G4.7).",
    );
  }

  const write = await transitionRepo(
    {
      vendorProfileId: input.vendorProfileId,
      expectedUpdatedAt: current.updatedAt, // expire has no caller revision — use the current token
      newStatus: "expired",
      newTier: null,
      verifiedAt: null,
      nextReviewAt: null,
      actorId: null, // System actor
    },
    db,
  );
  if (write.matched === 0 || write.newUpdatedAt === null) {
    return fail(
      "CONFLICT",
      VERIFIED_TIER_REVISION_CONFLICT_CODE,
      "The verified tier changed since it was read; re-read then retry.",
    );
  }

  await emitAndAudit({
    db,
    deps,
    actorType: "system",
    actorId: null,
    rowId: current.id,
    vendorProfileId: input.vendorProfileId,
    oldTier: current.tier,
    newTier: current.tier,
    auditAction: VerifiedTierAuditAction.EXPIRED,
    oldValue: { tier: current.tier, status: "verified" },
    newValue: { tier: current.tier, status: "expired" },
  });

  return {
    ok: true,
    result: {
      verifiedFinancialTierId: current.id,
      vendorProfileId: input.vendorProfileId,
      tier: current.tier,
      status: "expired",
      nextReviewAt: iso(current.nextReviewAt),
      updatedAt: write.newUpdatedAt.toISOString(),
      applied: true,
    },
  };
}
