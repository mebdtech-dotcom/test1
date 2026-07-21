// M2 application (PRIVATE) — `marketplace.create_vendor_profile.v1` (Doc-4D PassB §D4; Doc-5D Pass-1
// row 1 / Pass-2 §4). ORCHESTRATION ONLY (owns no state): validate → authorize (M1 `check_permission`,
// consumed) → issue slug (Doc-2 v1.0.5 law) → allocate `human_ref` (M0) → write (repository) → append
// audit (M0) → emit `VendorClaimed` to the outbox (M0) — ALL on the SAME caller-supplied RLS-scoped
// transaction executor (the D7 canonical audited-write pattern, extended with the §16.2 producer-emit
// twin: the business write, its audit row, and its outbox row commit or roll back TOGETHER).
//
// Cross-module consumption is CONTRACT TYPES ONLY (Red-Flag rule): the M1 `CheckPermission` and the
// M0 `AllocateHumanReference`/`AppendAuditRecord`/`WriteOutboxEvent`/`ConfigValueQuery` are injected
// as contract types by the app-layer composition edge (`src/server/marketplace`) — M2 never imports
// another module's internals and never re-derives authorization (Doc-4A §6.1: `check_permission` is
// the sole authorization root; slug `can_manage_vendor_profile`, Doc-2 §7 — seeded, never invented).
//
// STATE (Doc-2 §5.3 / Doc-5D Pass-2 BR-M-02): direct registration creates the profile at
// `claim_state='claimed'`, `status='active'` — it does NOT enter `seeded` (that state is created by
// platform import, M8-side). Event: `VendorClaimed` (Doc-2 §8 — Doc-4D §D4 Events row), THIN payload.
//
// IDEMPOTENCY (§B.7 — DISCLOSED DEFERRAL): the §B.6 `Idempotency-Key` replay store
// (`marketplace.command_dedup`) is the program-wide Wave-3 deferral (the M1 §B.6 retro-fit
// precedent; same posture as the M5/M6/M7 write slices) — scheduled as W3-MKT-3b
// (docs/backend/wp/W3-MKT-GAP-ANALYSIS.md §5). The `human_ref` allocation participates in the single
// transaction (Doc-4D §B.7: no second ref on a rolled-back attempt).

import { prisma, type DbExecutor } from "../../../../shared/db";
import type {
  AllocateHumanReference,
  AppendAuditRecord,
  ConfigValueQuery,
  WriteOutboxEvent,
} from "@/modules/core/contracts";
import type { CheckPermission } from "@/modules/identity/contracts";
import {
  activeOrgHasVendorProfile,
  insertVendorProfile,
  isVendorSlugTaken,
} from "../../infrastructure/data/vendor-profile-write.repository";
import {
  deriveVendorSlugBase,
  isReservedVendorSlug,
  isValidVendorSlug,
  RESERVED_SUBDOMAIN_LABELS_KEY,
  VENDOR_SLUG_MAX_LENGTH,
} from "../../domain/policies/vendor-slug-issuance.policy";
import { VENDOR_PROFILE_ENTITY_TYPE, VendorProfileAuditAction } from "../../domain/audit-actions";
import { MARKETPLACE_EVENT_VERSION, MarketplaceEventName } from "../../contracts/events";
import type { CreateVendorProfileInput, CreateVendorProfileOutcome } from "../../contracts/types";

/** Server-resolved request context (from the active-org guard — never client input; Invariant #5). */
export interface CreateVendorProfileContext {
  /** The acting `identity.users` id (= `app.user_id`). */
  userId: string;
  /** The server-resolved active org (= `app.active_org`) — becomes the controlling org (§5.3). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected contract services (TYPES only — concretes bound at the `src/server` composition edge). */
export interface CreateVendorProfileDeps {
  /** M1 `identity.check_permission.v1` (Doc-4C §C3) — the SOLE authorization root (Doc-4A §6.1). */
  checkPermission: CheckPermission;
  /** M0 `core.allocate_human_reference.v1` (Doc-4B §A7) — the `VENDOR-YYYY-NNNNNN` allocator. */
  allocateHumanReference: AllocateHumanReference;
  /** M0 `core.append_audit_record.v1` (Doc-4B §A10) — the ONLY audit-write surface. */
  appendAuditRecord: AppendAuditRecord;
  /** M0 `core.write_outbox_event.v1` (Doc-4B §B10) — the ONLY §8 event-emit surface. */
  writeOutboxEvent: WriteOutboxEvent;
  /** M0 `core.config_value_query.v1` (Doc-4B §B8) — resolves `marketplace.reserved_subdomain_labels`. */
  configValueQuery: ConfigValueQuery;
}

// Doc-4D §D4 frozen error register (`marketplace_vendor_*`) — bound by pointer, never coined.
const INVALID_INPUT_CODE = "marketplace_vendor_invalid_input";
const FORBIDDEN_CODE = "marketplace_vendor_forbidden";
const ALREADY_EXISTS_CODE = "marketplace_vendor_already_exists";

// Doc-2 §7 permission slug (seeded by `identity_catalog_seed`; Doc-4D §D4 Authorization row).
const CAN_MANAGE_VENDOR_PROFILE_SLUG = "can_manage_vendor_profile";

/** Bounded name (Doc-4D §D4 "bounded"; the concrete bound is a [realization convention]). */
const NAME_MAX_LENGTH = 200;

const CAPABILITY_KEYS = ["canSupply", "canService", "canFabricate", "canConsult"] as const;
const GEOGRAPHY_KEYS = ["country", "division", "district", "industrialZone"] as const;

/** SYNTAX validation (Doc-4D §B.4 row 1: name/flags/geography present, types). */
function validateInput(input: CreateVendorProfileInput): string | null {
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return "name is required.";
  }
  if (input.name.length > NAME_MAX_LENGTH) {
    return `name must be at most ${NAME_MAX_LENGTH} characters.`;
  }
  if (typeof input.capabilityFlags !== "object" || input.capabilityFlags === null) {
    return "capability_flags is required.";
  }
  for (const key of CAPABILITY_KEYS) {
    if (typeof input.capabilityFlags[key] !== "boolean") {
      return "capability_flags must carry the four boolean flags.";
    }
  }
  if (typeof input.geography !== "object" || input.geography === null) {
    return "geography is required.";
  }
  for (const key of GEOGRAPHY_KEYS) {
    const value = input.geography[key];
    if (value !== null && typeof value !== "string") {
      return "geography fields must be strings or null.";
    }
  }
  if (
    input.vendorTypePreset !== undefined &&
    input.vendorTypePreset !== null &&
    typeof input.vendorTypePreset !== "string"
  ) {
    return "vendor_type_preset must be a string.";
  }
  return null;
}

/**
 * Resolve the reserved-label POLICY list (`marketplace.reserved_subdomain_labels`, Doc-3 v1.10) via
 * the M0 facade. An unseeded/unreadable key resolves to the EMPTY list (disclosed fallback — the
 * FIXED format law still applies; the seed lands with this WP's data migration, so the empty-list
 * path is a bootstrap-order guard, not a policy bypass).
 */
async function resolveReservedLabels(
  configValueQuery: ConfigValueQuery,
  db: DbExecutor,
): Promise<readonly string[]> {
  try {
    const resolved = await configValueQuery({ key: RESERVED_SUBDOMAIN_LABELS_KEY }, db);
    if (Array.isArray(resolved.value) && resolved.value.every((v) => typeof v === "string")) {
      return resolved.value;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Issue the platform slug (Doc-2 v1.0.5 D2-04.1/.2): derive the base from the name; when the base is
 * underivable, reserved, format-invalid, or already held (live OR retired — never-reuse), append a
 * short numeric discriminator from the profile-id space until a free, law-conformant label results.
 * Runs on the SAME transaction; the `vendor_profiles_slug_live_uq` partial-unique remains the
 * authoritative race gate (the repository surfaces `slug_conflict` for a same-instant race).
 */
async function issueVendorSlug(
  name: string,
  reservedLabels: readonly string[],
  db: DbExecutor,
): Promise<string> {
  const base = deriveVendorSlugBase(name) ?? `vendor-${Date.now().toString(36)}`;
  let candidate = base;
  let attempt = 0;
  // Bounded probe (collisions are rare; the DB unique index is the final arbiter either way).
  while (
    !isValidVendorSlug(candidate) ||
    isReservedVendorSlug(candidate, reservedLabels) ||
    (await isVendorSlugTaken(candidate, db))
  ) {
    attempt += 1;
    const suffix = `-${attempt + 1}`;
    candidate = `${base.slice(0, VENDOR_SLUG_MAX_LENGTH - suffix.length).replace(/-+$/g, "")}${suffix}`;
    if (attempt > 50) {
      // Degenerate namespace exhaustion around this base — fall to a generated neutral label.
      candidate = `vendor-${Date.now().toString(36)}-${attempt}`;
    }
  }
  return candidate;
}

/**
 * Create the active org's vendor profile (Doc-4D §D4): one profile per org; enters `claimed/active`;
 * `human_ref` + audit + `VendorClaimed` emit all atomic with the INSERT on `db`.
 *
 * @param input the (already type-mapped) request fields.
 * @param ctx   the server-resolved context (userId/activeOrgId — never client input).
 * @param deps  the injected M0/M1 contract services.
 * @param db    the RLS-scoped transaction executor (from `withActiveOrgContext`).
 */
export async function createVendorProfileCommand(
  input: CreateVendorProfileInput,
  ctx: CreateVendorProfileContext,
  deps: CreateVendorProfileDeps,
  db: DbExecutor = prisma,
): Promise<CreateVendorProfileOutcome> {
  // (1) SYNTAX (Doc-4D §B.4).
  const invalid = validateInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }

  // (2) AUTHZ — M1 `check_permission` (three-layer: membership + slug + scope; Doc-4A §6.1). The
  //     resource scope is the creator's ACTIVE ORG itself (the profile does not exist yet) — an
  //     org-level check; delegation is NOT eligible for create (Doc-4D §D4), and `check_permission`
  //     resolves membership-first so a pure org-level allow suffices.
  const decision = await deps.checkPermission(
    {
      userId: ctx.userId,
      organizationId: ctx.activeOrgId,
      permissionSlug: CAN_MANAGE_VENDOR_PROFILE_SLUG,
    },
    undefined,
    db,
  );
  if (decision.decision !== "allow") {
    return {
      ok: false,
      error: {
        errorClass: "AUTHORIZATION",
        errorCode: FORBIDDEN_CODE,
        message: "Not permitted to manage the vendor profile.",
      },
    };
  }

  // (3) BUSINESS — one profile per org (Doc-2 §10.3 `UNIQUE(controlling_organization_id)` partial).
  //     Pre-checked for a clean error; the partial-unique index remains the race-proof gate (the
  //     repository maps a lost race to `org_conflict` below).
  if (await activeOrgHasVendorProfile(ctx.activeOrgId, db)) {
    return {
      ok: false,
      error: {
        errorClass: "CONFLICT",
        errorCode: ALREADY_EXISTS_CODE,
        message: "This organization already controls a vendor profile.",
      },
    };
  }

  // (4) SLUG issuance (Doc-2 v1.0.5 law — platform-issued, format-law + reserved-label gated).
  const reservedLabels = await resolveReservedLabels(deps.configValueQuery, db);
  const name = input.name.trim();

  // (5) HUMAN REF — `core.allocate_human_reference.v1` ('VENDOR' prefix — Doc-6D §3.1.1 MK-CR11, a
  //     carried [§2.5] choice), inside THIS transaction (no second ref on rollback — §B.7).
  const { humanRef } = await deps.allocateHumanReference(
    { entityType: "VENDOR", year: new Date().getUTCFullYear() },
    db,
  );

  // (6) WRITE — retry once on a same-instant slug race (fresh discriminator), then surface conflict.
  let write = await insertVendorProfile(
    ctx.activeOrgId,
    ctx.userId,
    {
      humanRef,
      name,
      slug: await issueVendorSlug(name, reservedLabels, db),
      capabilityFlags: input.capabilityFlags,
      geography: input.geography,
      vendorTypePreset: input.vendorTypePreset ?? null,
    },
    db,
  );
  if (write.outcome === "slug_conflict") {
    write = await insertVendorProfile(
      ctx.activeOrgId,
      ctx.userId,
      {
        humanRef,
        name,
        slug: await issueVendorSlug(name, reservedLabels, db),
        capabilityFlags: input.capabilityFlags,
        geography: input.geography,
        vendorTypePreset: input.vendorTypePreset ?? null,
      },
      db,
    );
  }
  if (write.outcome === "org_conflict" || write.outcome === "slug_conflict") {
    return {
      ok: false,
      error: {
        errorClass: "CONFLICT",
        errorCode: ALREADY_EXISTS_CODE,
        message: "This organization already controls a vendor profile.",
      },
    };
  }

  // (7) AUDIT — atomic with the write (SAME tx), via the M0 facade ONLY. Canonical action
  //     `vendor_profile_created` (Doc-2 §9 Vendor-profile "create" — bound by pointer). If this
  //     throws, the whole tx (write + human_ref draw) rolls back (D7 Invariant 1).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: VENDOR_PROFILE_ENTITY_TYPE,
      entityId: write.id,
      action: VendorProfileAuditAction.CREATED,
      oldValue: null,
      newValue: write.newValue,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  // (8) EMIT — `VendorClaimed` (Doc-2 §8) via the M0 outbox, SAME tx (§16.2 write-plus-emit
  //     atomicity; R10 — never fired outside the outbox). THIN payload (§16.5): IDs + the entered
  //     claim state only; no protected fact (§16.3).
  await deps.writeOutboxEvent(
    {
      eventName: MarketplaceEventName.VENDOR_CLAIMED,
      eventVersion: MARKETPLACE_EVENT_VERSION,
      aggregateId: write.id,
      payload: {
        vendor_profile_id: write.id,
        controlling_organization_id: ctx.activeOrgId,
        claim_state: "claimed",
        source: "registration", // Doc-2 §10.3 claim source enum value (direct registration)
      },
    },
    db,
  );

  return {
    ok: true,
    result: {
      vendorProfileId: write.id,
      humanRef,
      claimState: "claimed",
      status: "active",
      controllingOrganizationId: ctx.activeOrgId,
    },
  };
}
