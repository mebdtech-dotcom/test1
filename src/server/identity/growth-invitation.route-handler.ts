// App-layer COMPOSITIONS for the two CALLER-FACING §C13 growth-invitation contracts (P1 Growth
// Hub M1 core slice; Doc-4C v1.0.3 §C13 · Doc-5C v1.0.1 rows 36–37):
//   `identity.create_invitation.v1`        — `POST /identity/growth_invitations` · 201
//   `identity.resolve_invitation_token.v1` — `GET  /identity/growth_invitations/resolve` · 200 · PUBLIC
// (`resolve_invitation_delivery_payload` is OUT-OF-WIRE — internal-service, M6 sole caller; it has
// NO composition here by design — Doc-5C v1.0.1 §4 / conformance G-5.)
//
// CREATE — the house tenant-CREATE composition (`runTenantCreate`, the invite-member shape):
// session → 401 · SYNTAX FIRST (the exported validator) · mandatory `Idempotency-Key` → 400
// (Doc-5C §4.3 / Doc-5A §9) · provision · `withActiveOrg` (unresolved context → the mapper's
// in-register collapse) → §B.6 replay lookup → §14.3 CLAIM (create-class — RV-0153 F2) → command
// → wire map → §B.6 persist-on-success / release-on-error (same tx — the §14.3 joint rule).
// Window POLICY: `identity.growth_invite_dedup_window` (its OWN [DC-5] key — the
// membership-invite-window precedent; seeded by `identity_growth_hub`). REPLAY & TOKEN-ONCE
// (Doc-5C v1.0.1 §2): a within-window replay returns the CACHED original response — including the
// raw token — as the same logical single response; token-once counts logical responses. The M0
// concretes (`appendAuditRecord` / `writeOutboxEvent` / `configValueQuery`) are INJECTED here —
// M1 sees only the contract TYPES (the boundary-legal wiring).
//
// RESOLVE — M1's FIRST PUBLIC composition (the Doc-5D `get_public_product_detail` carriage
// precedent): NO session, NO org context, NO provisioning — anonymous, identical response for
// every caller class. Absent `token` → the SYNTAX-only `identity_growth_invite_invalid_input`
// 400 (Doc-5C v1.0.1 §2 — never token invalidity, which stays `valid:false`).
//
// RATE LIMITING (Doc-4A §19 / Doc-5C v1.0.1 §3): the resolve leg binds
// `identity.growth_invite_resolve_rate_limit` — the key is REGISTERED with NO seeded value (the
// v1.11 `PublicReadRateLimit` model: the POLICY exists; no number committed). Enforcement
// ACTIVATES only when the operational value is configured (read live via
// `core.config_value_query.v1`); a null/absent value ⇒ no limit. The realized enforcement is a
// best-effort in-memory per-IP token bucket over a fixed 60s window [realization convention —
// serverless-instance-local, disclosed in the slice report; the durable §19 realization rides the
// key's value-registration follow-up].
//
// TOKEN HYGIENE (Doc-5C v1.0.1 §3 / conformance G-6): the raw token is a bearer credential — it
// is never logged here and never enters any error message; both rows are served `no-store` (G-3,
// applied at the thin route entry).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import {
  appendAuditRecord,
  configValueQuery,
  CoreServiceError,
  writeOutboxEvent,
} from "@/modules/core/contracts";
import {
  createInvitation,
  GROWTH_INVITE_DEDUP_WINDOW_KEY,
  growthInvalidInput,
  mapCreateInvitation,
  mapResolveInvitationToken,
  resolveInvitationToken,
  validateCreateInvitationInput,
  type CreateInvitationInput,
  type CreateInvitationResult,
  type ResolveInvitationTokenResult,
} from "@/modules/identity/contracts";
import { errorResponse, type WireResponse } from "@/shared/http";
import { runTenantCreate, type WireIdempotencyKey } from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the growth-invitation create composition (the membership-tenant shape). */
export interface GrowthInvitationHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null.
   *  REQUIRED-field dep shape (RV-0153 OBS-2 — never optional on a new composition). */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/growth_invitations` (`201`) — `identity.create_invitation.v1`
 * with the §14.3 CREATE claim leg (see header). Returns the §9.3 stored replay (the SAME logical
 * token-bearing response) on a within-window same-key re-submission.
 */
export async function handleCreateInvitation(
  input: CreateInvitationInput,
  deps: GrowthInvitationHandlerDeps,
): Promise<WireResponse<CreateInvitationResult>> {
  return runTenantCreate(
    "identity.create_invitation.v1",
    GROWTH_INVITE_DEDUP_WINDOW_KEY,
    (ctx, tx) =>
      createInvitation(input, ctx, { appendAuditRecord, writeOutboxEvent, configValueQuery }, tx),
    mapCreateInvitation,
    (o) => o.ok,
    growthInvalidInput,
    deps,
    () => validateCreateInvitationInput(input),
  );
}

// ── Resolve-leg rate limiting (Doc-4A §19 — see header; v1.11 no-value model) ─────────────────

/** The registered (value-less) §19 POLICY key (Doc-3 v1.14 GrowthHub key 5 — name verbatim;
 *  reference form per Doc-4A §18.2). */
export const GROWTH_INVITE_RESOLVE_RATE_LIMIT_KEY =
  "core.system_configuration.identity.growth_invite_resolve_rate_limit" as const;

/** The fixed bucket window [realization convention — the key's value, once configured, is read as
 *  max requests per this window; disclosed/carried until the value-registration follow-up pins the
 *  operational shape]. */
const RESOLVE_RATE_WINDOW_MS = 60_000;

/** Instance-local per-IP buckets (best-effort — serverless-instance-local; see header). */
const resolveBuckets = new Map<string, { windowStart: number; count: number }>();

/** Read the configured limit: a positive finite number ⇒ max requests/window; unregistered value
 *  (`core_config_key_not_found` — the v1.11 model) or any non-numeric shape ⇒ `null` (no limit). */
async function readResolveRateLimit(): Promise<number | null> {
  try {
    const { value } = await configValueQuery({ key: GROWTH_INVITE_RESOLVE_RATE_LIMIT_KEY });
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
  } catch (e) {
    if (e instanceof CoreServiceError) return null; // no value configured — enforcement dormant.
    throw e;
  }
}

/** Best-effort per-IP token-bucket check. `true` = over budget (reject `RATE_LIMITED`). */
function overBudget(clientIp: string, max: number): boolean {
  const now = Date.now();
  const bucket = resolveBuckets.get(clientIp);
  if (bucket === undefined || now - bucket.windowStart >= RESOLVE_RATE_WINDOW_MS) {
    resolveBuckets.set(clientIp, { windowStart: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}

/** The §19 exceedance face — `RATE_LIMITED` (retryable), kept OUT of the §B.4 validation matrix
 *  (Doc-4C v1.0.3 §C13 / the frozen `get_public_product_detail` rate-limit-in-§19 pattern).
 *  [realization convention — the §C13 register authors NO rate-limit code token; the class-named
 *  lowercase token below is the interim serialization, carried in the slice report — never a
 *  frozen-register coin.] */
function rateLimitedResponse(): WireResponse<never> {
  return errorResponse(
    {
      error_class: "RATE_LIMITED",
      error_code: "rate_limited",
      message: "Too many requests. Retry later.",
      retryable: true,
    },
    { "Retry-After": "60" },
  );
}

/**
 * The HTTP face for `GET /identity/growth_invitations/resolve?token=…` (`200`) —
 * `identity.resolve_invitation_token.v1` (PUBLIC — no auth, no org context; see header).
 * `tokenParam` is the raw query value (`null` when absent) — absent/empty → the SYNTAX-only 400;
 * a well-formed request is ALWAYS `200 { valid, campaign_key? }` (anti-oracle, G-1).
 */
export async function handleResolveInvitationToken(
  tokenParam: string | null,
  clientIp: string | null,
): Promise<WireResponse<ResolveInvitationTokenResult>> {
  // §19 rate limit FIRST (transport-stage — outside the §B.4 matrix; dormant until configured).
  const limit = await readResolveRateLimit();
  if (limit !== null && overBudget(clientIp ?? "unknown", limit)) {
    return rateLimitedResponse();
  }

  // SYNTAX (the matrix's only coded leg — "token present"; never token invalidity).
  if (tokenParam === null || tokenParam.trim().length === 0) {
    return growthInvalidInput("token query parameter is required.");
  }

  const result = await resolveInvitationToken({ token: tokenParam });
  return mapResolveInvitationToken(result);
}
