// M1 application (PRIVATE) — `identity.create_invitation.v1` (Doc-4C v1.0.3 §C13; Doc-5C v1.0.1
// row 36: `POST /identity/growth_invitations` · 201). P1 Growth Hub M1 core slice.
//
// Frozen validation chain (§C13, the §B.4 grammar): SYNTAX (slug shape; enum; the
// `recipient_identifier` presence rule — required targeted, forbidden open) → CONTEXT (active-org
// — upstream) → AUTHZ (`can_manage_growth_invites` via the wired `check_permission` root;
// membership-satisfied only — the invite-member pattern, fail-closed) → SCOPE (the referrer = the
// caller's SERVER-RESOLVED active org; Invariant #5) → REFERENCE (`campaign_key` resolves + is
// active in the M0-config registered set `identity.growth_campaign_registry` — M1 validates, M8
// is not the validation owner, Q-MINOR-3) → POLICY (invite quota `identity.growth_invite_quota_*`,
// read via `core.config_value_query.v1` — never literals, Doc-4A §18.2).
//
// STATE EFFECTS (§C13): creates `growth_invitations` at Doc-2 §5.11 `→ issued`; `token_hash` =
// sha256(token); `redemption_count = 0`; `expires_at` = now + `identity.growth_invite_token_ttl`
// (POLICY — never a DB default literal, Doc-6A §10.2); `max_redemptions` = 1 targeted · NULL open.
//
// GI-2 (token-once): the raw token (`ivz_inv_` + 32 random bytes base64url) is returned ONCE in
// this command's result — only `token_hash` persists; there is no re-read surface (the §B.6
// idempotent replay of the SAME logical response is the one sanctioned re-delivery, Doc-5C §2).
//
// EVENTS (§16): emits `InvitationIssued` via the M0 outbox (same tx — Doc-6A §7.1 write+emit)
// IFF targeted (email/sms/whatsapp); open link/qr emit NONE. Thin payload = {growth_invitation_id,
// recipient_type, delivery_reference_id} — NO raw token, NO recipient_identifier (GI-3 / §16.5).
// The targeted leg also writes the §10.3-class delivery-reference row
// (`invitation_delivery_refs`: delivery_reference_id → invitation mapping ONLY in P1 — no token
// material; the secure token/nonce store is the Board-recorded P2 carry with the M6 consumer).
//
// STAFF-GUC ESCALATION [logged judgment call — the deactivate-own-account precedent]: the
// delivery-ref insert (staff-GUC-only RLS, Doc-6C v1.0.4 §5 model) and the outbox append
// (`core.outbox_events` carries only the staff-leg INSERT admission — see the producer's carried
// ADR-021-class flag) are SERVICE-LANE writes inside this tenant transaction. The command sets
// `app.is_platform_staff = 'true'` TRANSACTION-LOCAL (`set_config(.,.,true)`) immediately before
// them — AFTER the tenant-scoped AUTHZ/quota/insert legs have run under the unescalated tenant
// GUCs. Monotonic widening inside the command's own committed-or-rolled-back tx; never session-global.
//
// AUDIT (§B.8 / D7): the ENUMERATED-additive Doc-2 v1.0.10 §5 "growth invitation created" action,
// atomic (same tx). `new_value` = {campaign_key, recipient_type, state} — EXCLUDES
// `recipient_identifier` (GI-3; Doc-4C v1.0.3 §9); the invitation id is the audit `entity_id`.
// Idempotency (§B.6): required; window `identity.growth_invite_dedup_window` — the composition
// owns the replay/claim legs (create-class: the RV-0153 F2 claim pattern).

import { createHash, randomBytes } from "node:crypto";
import type {
  AppendAuditRecord,
  ConfigValueQuery,
  WriteOutboxEvent,
} from "@/modules/core/contracts";
import { CoreServiceError } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import { buildUserAuditInput } from "./_audit";
import { policyDurationToMs } from "../../domain/value-objects/policy-duration";
import {
  GROWTH_INVITATION_ENTITY_TYPE,
  GrowthInvitationAuditAction,
} from "../../domain/audit-actions";
import { INVITATION_ISSUED_EVENT, type InvitationIssuedPayload } from "../../contracts/events";
import { checkPermission } from "../queries/check-permission.query";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  CreateInvitationInput,
  CreateInvitationOutcome,
  GrowthRecipientTypeValue,
} from "../../contracts/types";

/** The Doc-2 §7 slug the §C13 create binds (Doc-2 v1.0.10 §3 — catalog 46 → 47; the O/D/M
 *  indicative defaults). A CATALOG token by pointer — never invented. */
export const CAN_MANAGE_GROWTH_INVITES_SLUG = "can_manage_growth_invites" as const;

// Doc-4C v1.0.3 §C13 create error register (frozen codes — the single `growth_invite` domain
// segment; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_growth_invite_invalid_input";
const FORBIDDEN_CODE = "identity_growth_invite_forbidden";
const CAMPAIGN_UNKNOWN_CODE = "identity_growth_invite_campaign_unknown";
const QUOTA_EXCEEDED_CODE = "identity_growth_invite_quota_exceeded";

// The `[DC-5]` POLICY keys this command reads (Doc-3 v1.14 GrowthHub — REGISTERED names verbatim;
// reference form per Doc-4A §18.2; seeded by `identity_growth_hub` — read live, never literals).
export const GROWTH_INVITE_TOKEN_TTL_KEY =
  "core.system_configuration.identity.growth_invite_token_ttl" as const;
export const GROWTH_INVITE_QUOTA_WINDOW_KEY =
  "core.system_configuration.identity.growth_invite_quota_window" as const;
export const GROWTH_INVITE_QUOTA_MAX_KEY =
  "core.system_configuration.identity.growth_invite_quota_max" as const;
export const GROWTH_CAMPAIGN_REGISTRY_KEY =
  "core.system_configuration.identity.growth_campaign_registry" as const;

/** `campaign_key` slug shape (Doc-4C §C13 `string(slug)` — the registered-key slug grammar). */
const CAMPAIGN_KEY_PATTERN = /^[a-z0-9_]{1,64}$/;

/** The closed recipient-type sets (Doc-2 v1.0.10 §1 — targeted vs open). */
const TARGETED_RECIPIENT_TYPES: readonly GrowthRecipientTypeValue[] = ["email", "sms", "whatsapp"];
const OPEN_RECIPIENT_TYPES: readonly GrowthRecipientTypeValue[] = ["link", "qr"];

/** Email shape + RFC-5321 ceiling (the invite-member SYNTAX precedent — format only, DC-4). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const RECIPIENT_EMAIL_MAX_LENGTH = 320;

/** Phone-class identifier shape for sms/whatsapp (SYNTAX only — a bounded digits/`+` check; the
 *  frozen field declares no format, so this is the minimal `[realization convention]` shape,
 *  logged). */
const PHONE_PATTERN = /^\+?[0-9]{6,20}$/;

/** Raw-token grammar: `ivz_inv_` + 32 random bytes base64url (§C13 — the token is a bearer
 *  credential; only sha256(token) persists, GI-2). */
const TOKEN_PREFIX = "ivz_inv_";
const TOKEN_RANDOM_BYTES = 32;

/**
 * SYNTAX validation (Doc-4A §11.2 category 1) — exported so the composition edge runs the SAME
 * validator FIRST (the invite-member precedent; single source, no re-derivation).
 * Returns the failure message, or `null` when syntactically valid.
 */
export function validateCreateInvitationInput(input: CreateInvitationInput): string | null {
  if (typeof input.campaignKey !== "string" || !CAMPAIGN_KEY_PATTERN.test(input.campaignKey)) {
    return "campaign_key must be a slug of 1..64 lowercase letters, digits or underscores.";
  }
  const targeted = TARGETED_RECIPIENT_TYPES.includes(input.recipientType);
  const open = OPEN_RECIPIENT_TYPES.includes(input.recipientType);
  if (!targeted && !open) {
    return "recipient_type must be one of email, sms, whatsapp, link, qr.";
  }
  if (open) {
    // The frozen presence rule: FORBIDDEN for link|qr (§C13 SYNTAX).
    if (input.recipientIdentifier !== undefined) {
      return "recipient_identifier is forbidden for an open (link/qr) invitation.";
    }
    return null;
  }
  // Targeted: REQUIRED, with a basic per-channel shape check (SYNTAX only — format, not identity).
  const identifier = input.recipientIdentifier;
  if (typeof identifier !== "string" || identifier.trim().length === 0) {
    return "recipient_identifier is required for a targeted (email/sms/whatsapp) invitation.";
  }
  const trimmed = identifier.trim();
  if (input.recipientType === "email") {
    if (trimmed.length > RECIPIENT_EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(trimmed)) {
      return "recipient_identifier must be a valid email address.";
    }
  } else if (!PHONE_PATTERN.test(trimmed)) {
    return "recipient_identifier must be a valid phone-class identifier.";
  }
  return null;
}

/** The server-resolved request context (from the composition edge — never client input). */
export interface CreateInvitationContext {
  /** The acting `identity.users` id (Invariant #5 — users act). */
  userId: string;
  /** The SERVER-RESOLVED active org — the referrer (organizations own; §C13 SCOPE). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` is injectable for tests; the production default is
 *  the M1 `check_permission` root itself (never a shadow check). */
export interface CreateInvitationDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** `core.write_outbox_event.v1` (Doc-4B) — the §C12.7-FLIP consumption (M1's first producer). */
  writeOutboxEvent: WriteOutboxEvent;
  /** `core.config_value_query.v1` (Doc-4B §B8) — the [DC-5] POLICY reads (never literals). */
  configValueQuery: ConfigValueQuery;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

/**
 * Create a growth invitation (Doc-4C v1.0.3 §C13). MUST be invoked INSIDE `withActiveOrgContext`
 * — `db` is the composition's tenant transaction; the insert, the targeted delivery-ref/outbox
 * legs, and the audit ride it atomically (D7 / Doc-6A §7.1). The §B.6 claim leg lives at the
 * composition (create-class — RV-0153 F2).
 */
export async function createInvitationCommand(
  input: CreateInvitationInput,
  ctx: CreateInvitationContext,
  deps: CreateInvitationDeps,
  db: DbExecutor = prisma,
): Promise<CreateInvitationOutcome> {
  // (1) SYNTAX (§B.4 category 1) — the same exported validator the composition ran.
  const syntaxFailure = validateCreateInvitationInput(input);
  if (syntaxFailure !== null) {
    return err("VALIDATION", INVALID_INPUT_CODE, syntaxFailure);
  }
  const targeted = TARGETED_RECIPIENT_TYPES.includes(input.recipientType);

  // (2) AUTHZ — `can_manage_growth_invites` via the wired authorization root. Delegation: not
  //     eligible (§C13 §B.10) — only the `membership` granting path is accepted, fail-closed
  //     (the invite-member pattern).
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    {
      userId: ctx.userId,
      organizationId: ctx.activeOrgId,
      permissionSlug: CAN_MANAGE_GROWTH_INVITES_SLUG,
    },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return err("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to manage growth invitations.");
  }

  // (3) REFERENCE — `campaign_key` resolves + is ACTIVE in the M0-config registered campaign set
  //     (`identity.growth_campaign_registry` — the frozen `resolve_permission` "slug exists →
  //     REFERENCE" precedent; M1 validates, §B.9). An ABSENT registry key collapses to the SAME
  //     frozen REFERENCE code [logged judgment call — a missing store row means no campaign is
  //     registered; never a runtime invention].
  let registry: unknown;
  try {
    registry = (await deps.configValueQuery({ key: GROWTH_CAMPAIGN_REGISTRY_KEY }, db)).value;
  } catch (e) {
    if (e instanceof CoreServiceError) {
      return err("REFERENCE", CAMPAIGN_UNKNOWN_CODE, "campaign_key is not a registered campaign.");
    }
    throw e;
  }
  if (!isActiveCampaign(registry, input.campaignKey)) {
    return err("REFERENCE", CAMPAIGN_UNKNOWN_CODE, "campaign_key is not a registered campaign.");
  }

  // (4) POLICY — the invite quota (`identity.growth_invite_quota_window` / `…_quota_max`, Doc-3
  //     v1.14 [DC-5]) — live invitations created by the referrer org within the rolling window.
  //     Values are POLICY reads (never literals); the duration rides the canonical Doc-3
  //     `<int><unit>` interpreter (`policyDurationToMs` — the W2-IDN-7 single source; a bespoke
  //     parser here would be the RV-0153 OBS-Δ3 duplication class, logged judgment call).
  const quotaWindowMs = policyDurationToMs(
    (await deps.configValueQuery({ key: GROWTH_INVITE_QUOTA_WINDOW_KEY }, db)).value,
    "identity.growth_invite_quota_window",
  );
  const quotaMaxValue = (await deps.configValueQuery({ key: GROWTH_INVITE_QUOTA_MAX_KEY }, db))
    .value;
  if (typeof quotaMaxValue !== "number" || !Number.isFinite(quotaMaxValue)) {
    throw new Error("identity.growth_invite_quota_max value is not an interpretable count.");
  }
  const windowStart = new Date(Date.now() - quotaWindowMs);
  const issuedInWindow = await db.growthInvitation.count({
    where: {
      referrerOrganizationId: ctx.activeOrgId,
      deletedAt: null,
      createdAt: { gte: windowStart },
    },
  });
  if (issuedInWindow >= quotaMaxValue) {
    return err(
      "QUOTA",
      QUOTA_EXCEEDED_CODE,
      "The organization's growth-invitation quota for the current window is exhausted.",
    );
  }

  // (5) WRITE — mint the bearer token (GI-2: hash persists, raw returned ONCE), the POLICY TTL
  //     expiry, and the `→ issued` row (Doc-2 §5.11). `max_redemptions` = 1 targeted · NULL open.
  const token = `${TOKEN_PREFIX}${randomBytes(TOKEN_RANDOM_BYTES).toString("base64url")}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const tokenTtlMs = policyDurationToMs(
    (await deps.configValueQuery({ key: GROWTH_INVITE_TOKEN_TTL_KEY }, db)).value,
    "identity.growth_invite_token_ttl",
  );
  const growthInvitationId = uuidv7(); // M0 ID generator (Doc-4B §8) — never a raw UUID.
  await db.growthInvitation.create({
    data: {
      id: growthInvitationId,
      referrerOrganizationId: ctx.activeOrgId,
      campaignKey: input.campaignKey,
      recipientType: input.recipientType,
      recipientIdentifier: targeted ? (input.recipientIdentifier?.trim() ?? null) : null,
      tokenHash,
      maxRedemptions: targeted ? 1 : null,
      state: "issued",
      expiresAt: new Date(Date.now() + tokenTtlMs),
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    },
  });

  // (6) TARGETED ONLY — the delivery-reference row + the `InvitationIssued` outbox append (same
  //     tx — Doc-6A §7.1 write+emit). Open link/qr: NO delivery ref, NO event (§C13). These two
  //     are SERVICE-LANE writes behind staff-GUC-only RLS admission — escalate the staff GUC
  //     TRANSACTION-LOCAL here (see header; the tenant-scoped legs above already ran unescalated).
  if (targeted) {
    await db.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const deliveryReferenceId = uuidv7();
    await db.invitationDeliveryRef.create({
      data: {
        deliveryReferenceId,
        growthInvitationId,
        // P1: the store holds ONLY the reference→invitation mapping — NO token material ("raw
        // token is never stored" holds absolutely; the secure token/nonce store is the P2 carry).
      },
    });

    const payload: InvitationIssuedPayload = {
      growth_invitation_id: growthInvitationId,
      recipient_type: input.recipientType,
      delivery_reference_id: deliveryReferenceId,
    };
    await deps.writeOutboxEvent(
      {
        eventName: INVITATION_ISSUED_EVENT.name,
        eventVersion: INVITATION_ISSUED_EVENT.version,
        aggregateId: growthInvitationId,
        payload,
      },
      db,
    );
  }

  // (7) AUDIT — the Doc-2 v1.0.10 §5 "growth invitation created" action, atomic (same tx; D7).
  //     `new_value` EXCLUDES `recipient_identifier` (GI-3 — Doc-4C v1.0.3 §9: the id is the
  //     `entity_id`, the contact never enters the immutable ledger).
  await deps.appendAuditRecord(
    buildUserAuditInput(ctx, {
      organizationId: ctx.activeOrgId,
      entityType: GROWTH_INVITATION_ENTITY_TYPE,
      entityId: growthInvitationId,
      action: GrowthInvitationAuditAction.CREATED,
      oldValue: null,
      newValue: {
        campaign_key: input.campaignKey,
        recipient_type: input.recipientType,
        state: "issued",
      },
    }),
    db,
  );

  // The raw token is returned ONCE (GI-2) — this result (and its §B.6 stored replay, the same
  // logical response) is its only caller-facing carriage; it is never re-readable.
  return { ok: true, result: { growthInvitationId, state: "issued", token } };
}

/** Registry-shape check: `{ "<campaign_key>": { "active": true } }` (Doc-3 v1.14 key 7 — the
 *  seeded MVP form `{"referral":{"active":true}}`). Missing/inactive/malformed → not active. */
function isActiveCampaign(registry: unknown, campaignKey: string): boolean {
  if (typeof registry !== "object" || registry === null) return false;
  const entry = (registry as Record<string, unknown>)[campaignKey];
  if (typeof entry !== "object" || entry === null) return false;
  return (entry as Record<string, unknown>)["active"] === true;
}

function err(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "REFERENCE" | "QUOTA",
  errorCode: string,
  message: string,
): CreateInvitationOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
