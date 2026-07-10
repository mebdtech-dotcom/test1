// Public DTOs / IDs for module "identity" (cross-module surface). DTOs/IDs only — domain
// value-objects stay private. Realized per the module's Doc-5C / Doc-6C contracts.
//
// Reference-never-restate: field names/semantics are owned by Doc-2 §10.2 (the buyer_profiles
// column set) and the read shape by Doc-5C §6.1/§6.3 (`identity.get_buyer_profile.v1`); bound by
// pointer, never re-authored here. WP-1.2 realizes the buyer-profile read DTO + outcome; WP-1.3
// adds the first-login provisioning DTOs.

/**
 * The `identity.buyer_profiles` read projection (Doc-2 §10.2 column set; Doc-6C §3.8).
 * Owning-org / active-org singleton (one per org — `buyer_profiles_org_live_uq`). The jsonb
 * columns carry IDs/values only (Doc-6A §12); their internal shape is owned by Doc-2 §10.2 and
 * left opaque (`unknown`) here — Doc-5C representation is bound by pointer, not coined.
 */
export interface BuyerProfileView {
  /** PK (UUIDv7) of the buyer_profile row. */
  id: string;
  /** Owning organization (the active-org / tenant anchor — Doc-2 §6). */
  organizationId: string;
  /** Buyer industry (Doc-2 §10.2); nullable. */
  industry: string | null;
  /** Factory info (Doc-2 §10.2); jsonb, shape owned upstream. */
  factoryInfo: unknown;
  /** Delivery locations (Doc-2 §10.2); jsonb, shape owned upstream. */
  deliveryLocations: unknown;
  /** Procurement preferences (Doc-2 §10.2); jsonb, shape owned upstream. */
  procurementPreferences: unknown;
}

/**
 * Outcome of `identity.get_buyer_profile.v1` (Doc-5C §6.1 row 33; §6.3 non-disclosure).
 * Active-org singleton read scoped by RLS (`app.active_org`). When the active org has no
 * buyer_profile — or the target is cross-tenant — the read collapses to `not-found`
 * (Doc-5C §6.3: cross-tenant reads collapse to `404`, indistinguishable from genuine absence).
 * Doc-5C realizes the wire `404`; the in-process query surfaces the same fact as `found: false`.
 */
export type GetBuyerProfileResult = { found: true; profile: BuyerProfileView } | { found: false };

/**
 * Input to `identity.upsert_buyer_profile.v1` (Doc-4C §C10; Doc-2 §10.2 column set). All fields are
 * OPTIONAL (partial upsert — an omitted field is left unchanged on update / DB-null on create). The active
 * org is the SERVER-RESOLVED tenant anchor (never client input — Invariant #5) and is NOT part of this
 * input. (Doc-4C also lists `approval_settings` — no `buyer_profiles` column exists for it in Doc-2 §10.2,
 * so it is deferred; a future schema/contract additive owns it.)
 */
export interface UpsertBuyerProfileInput {
  /** Buyer industry (Doc-2 §10.2); omit = unchanged (update) / null (create). */
  industry?: string | null;
  /** Factory info (`factory_info_jsonb`, Doc-2 §10.2); IDs/values only, no blobs (Doc-6A §12). */
  factoryInfo?: unknown;
  /** Delivery locations (`delivery_locations_jsonb`, Doc-2 §10.2). */
  deliveryLocations?: unknown;
  /** Procurement preferences (`procurement_preferences_jsonb`, Doc-2 §10.2). */
  procurementPreferences?: unknown;
  /**
   * Optimistic-concurrency token (Doc-4C §C10 — `updated_at` concurrency on UPDATE). When present and the
   * live row's `updated_at` differs, the update is a CONFLICT (stale). Ignored on create.
   */
  expectedUpdatedAt?: Date;
}

/** The result of a successful upsert (Doc-4C §C10 response: `buyer_profile_id` + `updated_at`). */
export interface UpsertBuyerProfileResult {
  /** The upserted `buyer_profiles.id` (UUIDv7). */
  buyerProfileId: string;
  /** The resulting `updated_at` (the new optimistic-concurrency token). */
  updatedAt: Date;
}

/** Error outcome of an upsert (Doc-4C §C10 error register; classes per Doc-5A §6.2). */
export interface UpsertBuyerProfileError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION → 400 · AUTHORIZATION → 403 · CONFLICT → 409). */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "CONFLICT";
  /** The Doc-4C §C10 `identity_buyer_profile_*` register code (frozen; never coined here). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/**
 * Outcome of `identity.upsert_buyer_profile.v1`. `ok: true` + `created` distinguishes the wire `201`
 * (created) from `200` (updated). `ok: false` carries the contract error (validation/forbidden/conflict).
 */
export type UpsertBuyerProfileOutcome =
  | { ok: true; created: boolean; result: UpsertBuyerProfileResult }
  | { ok: false; error: UpsertBuyerProfileError };

// ─────────────────────────────────────────────────────────────────────────────
// §C3 — Shared Identity Services (the OUT-OF-WIRE auth-root reads). Doc-5C §7.1: these carry NO HTTP
// method/path — they are internal-service, in-process composition surfaces (proposing a wire = an
// architecture change per Doc-5C §7.5). Every consuming module (and `src/server/authz`) calls these,
// never `identity.*` tables directly and never a shadow authorization check (Doc-4C §C3 / §B.11).
// ─────────────────────────────────────────────────────────────────────────────

/** `identity.get_user.v1` projection (Doc-4C §C3 PassB:117) — personal-data-minimized (Doc-2 §3.2);
 *  never an auth-mechanism field (DC-4). `preferencesSummary` is the opaque `preferences_jsonb`
 *  (shape owned upstream). `displayName` completes the frozen §C3 projection
 *  `{ user_id, status, display_name, preferences_summary }` — realized at W2-IDN-6.1 per the
 *  `Doc-2_Patch_v1.0.6` / `Doc-6C_Patch_v1.0.2` pair (`ESC-IDN-DISPLAYNAME` ✅ RESOLVED, owner
 *  Option A 2026-07-09); nullable — absence is the legitimate state. */
export interface UserView {
  userId: string;
  /** User lifecycle status (Doc-2 §5 / `user_status`): `active` | `suspended` | `soft_deleted`. */
  status: string;
  /** Optional user-chosen presentation name (Doc-2 §10.2 per Patch v1.0.6); never an identifier. */
  displayName: string | null;
  preferencesSummary: unknown;
}

/** Outcome of `identity.get_user.v1` — `found: false` collapses not-found / not-disclosable (Doc-4C §C3). */
export type GetUserResult = { found: true; user: UserView } | { found: false };

/** `identity.get_organization.v1` projection (Doc-2 §10.2 / Doc-4C §C3 PassB line 128):
 *  `{ organization_id, human_ref, name, slug, org_status, verification_level, participation_flags }`.
 *  `verificationLevel` is the org's OWN derived attribute (read-through), NOT a Trust
 *  `verification_records` projection (DC-2, pre-adjudicated at §C3 — not one of the five firewalled
 *  signals); `participationFlags` realizes the frozen `participation_flags` as the two Doc-2 §10.2
 *  boolean columns (`has_buyer_profile` / `has_vendor_profile`). Both frozen-REQUIRED (RV-0148 MAJOR-1). */
export interface OrganizationView {
  organizationId: string;
  humanRef: string;
  name: string;
  slug: string;
  /** Org lifecycle status (Doc-2 §5.1 / `org_status`): `active` | `suspended` | `soft_deleted`. */
  orgStatus: string;
  /** The org's own derived verification level (Doc-2 §10.2 / `verification_level`): `unverified` |
   *  `verified` | `enhanced_verified` — read-through, not a Trust contract (DC-2). */
  verificationLevel: string;
  /** Participation flags (Doc-2 §10.2) — the org's realized `has_buyer_profile` / `has_vendor_profile`. */
  participationFlags: {
    hasBuyerProfile: boolean;
    hasVendorProfile: boolean;
  };
}

/** Outcome of `identity.get_organization.v1` — `found: false` collapses not-found / not-disclosable. */
export type GetOrganizationResult =
  { found: true; organization: OrganizationView } | { found: false };

/** `identity.get_membership.v1` projection (Doc-2 §10.2 / Doc-4C §C3). `state` is the access-formula input
 *  (§6.1) — only `active` participates in the gate; the caller reads it, never re-derives the
 *  role→permission mapping (that is `check_permission`). */
export interface MembershipView {
  membershipId: string;
  userId: string;
  organizationId: string;
  roleId: string;
  /** Membership state (Doc-2 §5.2 / `membership_state`): `invited`|`pending`|`active`|`suspended`|`removed`. */
  state: string;
  /** The member's department within the org (Doc-2 §10.2 / `department`); nullable. Frozen in the §C3
   *  projection (PassB line 139) — RV-0148 MINOR-3. */
  department: string | null;
}

/** Outcome of `identity.get_membership.v1` — `found: false` collapses no-link / beyond-tenant-scope. */
export type GetMembershipResult = { found: true; membership: MembershipView } | { found: false };

/**
 * Input to `identity.check_permission.v1` (Doc-4C §C3 request contract). `organizationId` is the
 * SERVER-VALIDATED active-org context (Doc-4A §5.3) — never a client-asserted org. `permissionSlug`
 * MUST exist in the Doc-2 §7 catalog (never a role/plan name, §6.2). `vendorProfileId` is present ONLY
 * when evaluating a delegated act-as path (§6B) — a bare UUID ref (not owned). `resourceScope` carries
 * optional resource identifiers for scope evaluation; absent ⇒ an org-level check.
 */
export interface CheckPermissionInput {
  userId: string;
  organizationId: string;
  permissionSlug: string;
  resourceScope?: Record<string, string>;
  vendorProfileId?: string;
}

/** `identity.check_permission.v1` decision (Doc-4C §C3 response — `decision`). */
export type PermissionDecision = "allow" | "deny";

/** `identity.check_permission.v1` granting path (Doc-4C §C3 response — `satisfied_by`), for auditability. */
export type PermissionSatisfiedBy = "membership" | "delegation" | "none";

/**
 * Diagnostic cause of a `deny` — INTERNAL-SERVICE audience only. The wire face (W2-IDN-6) collapses this
 * to the uniform non-disclosure shape (§7.5) and maps `unknown_slug` → `identity_permission_slug_unknown`
 * (REFERENCE, §6.4). Out-of-wire consumers may branch on it (e.g. audit), never leak it to a tenant.
 */
export type CheckPermissionDenyReason =
  | "unknown_slug"
  | "staff_space_firewall"
  | "no_active_membership"
  | "slug_not_held"
  | "delegation_denied"
  // RV-0148 MAJOR-2: a `resource_scope` was supplied but Doc-4A §6.1 layer-3 per-resource evaluation is
  // not realized in this wave — the request FAILS CLOSED (never a silent org-level allow). See the policy.
  | "resource_scope_unsupported";

/** Outcome of `identity.check_permission.v1` (Doc-4C §C3 response). `allow` carries the granting path;
 *  `deny` carries the internal `denyReason` (uniform on the wire). */
export type CheckPermissionResult =
  | { decision: "allow"; satisfiedBy: "membership" | "delegation" }
  | { decision: "deny"; satisfiedBy: "none"; denyReason: CheckPermissionDenyReason };

/**
 * A port that resolves whether a target vendor profile's OWN lifecycle state permits a delegated
 * operation — Doc-4A §6B.2 condition 5 ("the target vendor profile is itself in a state permitting the
 * operation … a delegation grant never overrides profile state"). The vendor profile is M2-owned, so
 * this is INJECTED at the app edge (the M2 Vendor Service, read-validation only) — never an M2 import
 * from M1. Returns `true` only when the profile's state affirmatively permits the operation.
 */
export type VendorProfileStateReader = (vendorProfileId: string) => Promise<boolean>;

// ─────────────────────────────────────────────────────────────────────────────
// §C9 — Delegation Grant write surface (W2-IDN-4). The dual-party `delegation_grants` aggregate: both
// party orgs read; ONLY the controlling org creates/suspends/revokes (Doc-2 §10.2 / §5.10). Field
// names/semantics owned by Doc-2 §10.2 + Doc-4C §C9 (identifiers verbatim); bound by pointer, never
// re-authored. `vendor_profile_id` is a BARE UUID cross-module ref (→ M2, NO FK).
// ─────────────────────────────────────────────────────────────────────────────

/** The `delegation_grant_status` value set (Doc-2 §5.10). */
export type DelegationGrantStatusValue = "draft" | "active" | "suspended" | "revoked" | "expired";

/** Error outcome of a delegation-grant command (Doc-4C §C9 error registers; classes per Doc-5A §6.2). */
export interface DelegationGrantError {
  /** Doc-5A §6.2 class → HTTP status. `BUSINESS` is the frozen §C9 ownership-class-block class. */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "REFERENCE" | "NOT_FOUND" | "STATE" | "BUSINESS";
  /** The Doc-4C §C9 `identity_delegation_*` / `identity_org_not_found` / `identity_permission_slug_unknown`
   *  register code (frozen; never coined here). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
  /**
   * The grant's CURRENT `updated_at` token — populated ONLY on the LOSING-WRITE leg (the CAS lost a
   * race on a legal edge) so the wire mapper emits the Doc-5A §9.5 `ETag` current-token header and
   * the caller can re-read-retry (§9.6). NEVER populated on a machine-illegal-edge STATE rejection
   * (the call-13 leg discipline, RV-0152 — a token there would be a false retry signal). W2-IDN-6.5.
   */
  currentUpdatedAt?: Date;
}

/**
 * Input to `identity.create_delegation_grant.v1` (Doc-4C §C9). The active org is the SERVER-RESOLVED
 * controlling org (Invariant #5 — never client input) and is NOT part of this input.
 */
export interface CreateDelegationGrantInput {
  /** The grantee org (Doc-4C §C9). */
  representativeOrganizationId: string;
  /** The controlled vendor profile (bare UUID ref; validated via the injected Vendor Service port). */
  vendorProfileId: string;
  /** PermissionSet (Doc-2 §2) — each slug MUST exist in the §7 catalog; never ownership-class / staff. */
  permissionSet: string[];
  /** Window start (Doc-4C §C9; default now). */
  validFrom?: Date;
  /** Window end (Doc-4C §C9; default per `identity.delegation_validity_default` POLICY when omitted). */
  validTo?: Date;
}

/** Result of a successful `create_delegation_grant` (Doc-4C §C9 response). */
export interface CreateDelegationGrantResult {
  delegationGrantId: string;
  /** Always `active` on success (Doc-4C §C9). */
  status: DelegationGrantStatusValue;
}

/** Outcome of `identity.create_delegation_grant.v1`. */
export type CreateDelegationGrantOutcome =
  { ok: true; result: CreateDelegationGrantResult } | { ok: false; error: DelegationGrantError };

/** Input to `identity.suspend_delegation_grant.v1` / `revoke_delegation_grant.v1` (Doc-4C §C9). `updatedAt`
 *  is the required optimistic-concurrency token (the caller's last-seen `updated_at`). */
export interface DelegationGrantLifecycleInput {
  delegationGrantId: string;
  /** Optional operator reason (Doc-4C §C9); recorded, not required. */
  reason?: string;
  /** Required optimistic-concurrency token (Doc-4C §C9 `updated_at : required`). */
  updatedAt: Date;
}

/** Result of a successful suspend/revoke (Doc-4C §C9 response). */
export interface DelegationGrantLifecycleResult {
  delegationGrantId: string;
  status: DelegationGrantStatusValue;
  updatedAt: Date;
}

/** Outcome of a delegation-grant lifecycle command (suspend/revoke). */
export type DelegationGrantLifecycleOutcome =
  { ok: true; result: DelegationGrantLifecycleResult } | { ok: false; error: DelegationGrantError };

/** Input to `identity.reinstate_delegation_grant.v1` (Doc-4C §C9 #25 — REAL since W2-IDN-6.5; the
 *  business boundary is `Doc-2_Patch_v1.0.7` rule 3: valid only for a currently `suspended`,
 *  NON-expired grant). `updatedAt` is the caller's last-seen token (required — §C9). */
export interface ReinstateDelegationGrantInput {
  delegationGrantId: string;
  updatedAt: Date;
}

/**
 * The FROZEN §C9 `get_delegation_grant` / `list_delegation_grants` item projection (PassB:648) —
 * EXACTLY `{ delegation_grant_id, controlling_organization_id, representative_organization_id,
 * vendor_profile_id, permission_set, valid_from, valid_to, status }`. Nothing added or removed
 * (notably NO `updated_at` — the frozen projection omits it; realized verbatim).
 */
export interface DelegationGrantView {
  delegationGrantId: string;
  controllingOrganizationId: string;
  representativeOrganizationId: string;
  vendorProfileId: string;
  /** PermissionSet (Doc-2 §2 — JSONB array of slugs). */
  permissionSet: string[];
  validFrom: Date;
  validTo: Date | null;
  status: DelegationGrantStatusValue;
}

/** Outcome of `identity.get_delegation_grant.v1` — `found: false` collapses absent AND non-party
 *  (§C9 SCOPE `NOT_FOUND` collapse beyond parties, §7.5 — one indistinguishable shape). */
export type GetDelegationGrantResult =
  { found: true; grant: DelegationGrantView } | { found: false };

/**
 * Input to `identity.list_delegation_grants.v1` (Doc-4C §C9 request contract — the frozen filter
 * fields). The party org is SERVER-RESOLVED (never an input). The `page_size`/`cursor` dimension is
 * FAIL-CLOSED at the wire face pending `ESC-IDN-LIST-PAGESIZE` (no registered identity page-size
 * POLICY key — Doc-3 v1.9 §Notes) and is deliberately NOT part of this input.
 */
export interface ListDelegationGrantsInput {
  /** `role_filter : enum(as_controlling|as_representative|any) : optional : default any`. */
  roleFilter?: "as_controlling" | "as_representative" | "any";
  /** `status_filter : enum : optional` (`delegation_grant_status`, Doc-2 §5.10). */
  statusFilter?: DelegationGrantStatusValue;
  /** `vendor_profile_id : uuid : optional : filter` (bare M2 ref). */
  vendorProfileId?: string;
}

/** Result of `identity.list_delegation_grants.v1` — the Doc-5A §8.6 list shape (items + page_info;
 *  `next_cursor` present iff more results exist — never issued while pagination is handle-gated). */
export interface ListDelegationGrantsResult {
  items: DelegationGrantView[];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// §B.6 — the command-dedup / Idempotency-Key replay store (W2-IDN-6.5). Doc-4C §B.6 semantics
// (replay → cached response; no duplicate audit/side effect — the §14.3 joint rule), realized as the
// Doc-6A §10.3 dedicated dedup table per the owning-module design (Doc-6C §6.1); the stored-result
// shape is Doc-5A §9.3's (status + body incl. the ORIGINAL reference_id + standard infra headers).
// ─────────────────────────────────────────────────────────────────────────────

/** The replay scope key — a stored response is replayable ONLY to the same (contract, actor, org
 *  context, key) that produced it (§7.5 — the replay-cache poisoning guard). */
export interface CommandDedupScope {
  /** The frozen Doc-4C contract id (e.g. `identity.create_delegation_grant.v1`). */
  contractId: string;
  /** The SERVER-RESOLVED acting principal (never client input). */
  actorUserId: string;
  /** The server-resolved org context; `null` for self/Admin-scope contracts. */
  organizationId: string | null;
  /** The client-generated opaque Idempotency-Key (Doc-5A §9.2; bounded at the wire). */
  idempotencyKey: string;
}

/** A stored wire response (Doc-5A §9.3 — same result, same status, same original `reference_id`). */
export interface StoredCommandResponse {
  status: number;
  /** The stored §5.6/§6.1 envelope, verbatim (incl. the original `reference_id`). */
  body: unknown;
  /** Stored standard HTTP infrastructure headers (e.g. the create `Location`), when any. */
  headers?: Record<string, string>;
}

/** Result of the System `identity.expire_delegation_grant.v1` sweep (Doc-4C §C9 — mechanical counter). */
export interface ExpireDelegationGrantsResult {
  /** Grants advanced `active → expired` this pass. */
  expired: number;
}

/**
 * A port that answers "does `controllingOrgId` control the vendor profile `vendorProfileId`?" — Doc-4C §C9
 * SCOPE (caller is the controlling org of the profile) + REFERENCE (the profile exists). The vendor profile
 * is M2-owned, so this is INJECTED at the app edge (the M2 Vendor Service, read-validation only — Doc-4C
 * §C1/§C9) — never an M2 import from M1. Fail-closed: the default reader answers `not_found`.
 *   • `controls`       — the profile exists and the org controls it (proceed).
 *   • `not_controller` — the profile exists but a DIFFERENT org controls it (`identity_delegation_not_controller`).
 *   • `not_found`      — no such profile (`identity_delegation_vendor_ref_invalid`).
 */
export type VendorProfileControlReader = (
  vendorProfileId: string,
  controllingOrgId: string,
) => Promise<"controls" | "not_controller" | "not_found">;

/**
 * The refresh-on-revocation SEAM (Doc-2 §5.10 / Doc-4C §C9). On `→ revoked` / `→ expired`, the derived M3
 * `rfq_invitation_grantees` + visibility rows for the representative would be torn down — but that is a
 * CROSS-MODULE effect with NO §8 identity emitter ([DC-1]) and M3 does not exist in Wave 2. So it is an
 * INJECTED PORT (the `VendorProfileStateReader` precedent): the DEFAULT is a genuine NO-OP (it calls no
 * M3, emits no event — honoring [DC-1]); the seam exists so revocation/expiry INVOKES it (tested), and the
 * real teardown lands via service/event when [DC-1] resolves. NEVER a cross-schema write from identity.
 */
export type DelegationRefreshPort = (input: {
  delegationGrantId: string;
  vendorProfileId: string;
  representativeOrganizationId: string;
}) => Promise<void>;

// ─────────────────────────────────────────────────────────────────────────────
// §C4/§C5/§C6 — User · Organization · Membership lifecycle (W2-IDN-5). The state-machine value sets + the two
// System-timer surfaces. The transition matrices themselves live in the domain state machines (the single
// lifecycle authority, Doc-2 §5.1/§5.2); the pure predicates are re-exported on `services.ts`. Value-set
// literals below are bound by pointer to the realized enums (Doc-6C §3.1/§3.2/§3.3), never re-authored.
// ─────────────────────────────────────────────────────────────────────────────

/** The `org_status` value set (Doc-2 §5.1 / `OrgStatus`, Doc-6C §3.2). */
export type OrganizationStatusValue = "active" | "suspended" | "soft_deleted";

/** The `membership_state` value set (Doc-2 §5.2 / `MembershipState`, Doc-6C §3.3). */
export type MembershipStateValue = "invited" | "pending" | "active" | "suspended" | "removed";

/** The `user_status` value set (Doc-2 §10.2 status enum / `UserStatus`, Doc-6C §3.1). */
export type UserStatusValue = "active" | "suspended" | "soft_deleted";

// ─────────────────────────────────────────────────────────────────────────────
// §C4 — User/Account WIRED write surface (W2-IDN-6.1). The four Doc-5C §4.1 user contracts:
//   `update_user_profile.v1`  PATCH /identity/users/{id}                          · User (self) · UNAUDITED (§C4 Audit: no)
//   `update_user_2fa_settings.v1` POST …/{id}/update_user_2fa_settings            · User (self) · audited [ESC-IDN-AUDIT]
//   `deactivate_own_account.v1`   POST …/{id}/deactivate_own_account              · User (self) · audited [ESC-IDN-AUDIT]
//   `set_user_account_status.v1`  POST …/{id}/set_user_account_status             · Admin       · audited [ESC-IDN-AUDIT]
// Actor scope: self + Admin-state; NO active-org on this sub-domain (Doc-5C §4.5 — self ops act on
// the platform-owned `users` record; Admin governance carries no org context). The target user id
// is the PATH `{id}` (Doc-5C §4.1), server-checked against the session subject for self ops —
// never a trusted body field. `updatedAt` is the optimistic-concurrency token, carried on the wire
// as the `If-Match` header (Doc-5C §4.3). Field names/semantics owned by Doc-4C §C4 (verbatim);
// bound by pointer, never re-authored. Events: none ([DC-1]).
// ─────────────────────────────────────────────────────────────────────────────

/** Error outcome of a §C4 user-account command (Doc-4C §C4 error registers; classes per Doc-5A §6.2). */
export interface UserAccountError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · AUTHORIZATION→403 · NOT_FOUND→404 ·
   *  CONFLICT→409 · BUSINESS→422). Only classes the §C4 registers author are raised. */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "CONFLICT" | "BUSINESS";
  /** The Doc-4C §C4 `identity_user_*` register code (frozen; never coined here). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
  /**
   * The entity's CURRENT `updated_at` concurrency token — populated ONLY on the Doc-5A §9.5
   * stale-precondition / losing-concurrent-write CONFLICT legs (Pass6:56: "the error response
   * carries the current concurrency token and nothing about the competing actor"), so the wire
   * mapper emits the §9.5 `ETag` response header and the caller can re-read-retry (§9.6). Absent
   * on every non-precondition failure (a machine-illegal edge is NOT a token mismatch — RV-0152 F2).
   */
  currentUpdatedAt?: Date;
}

/**
 * Input to `identity.update_user_profile.v1` (Doc-4C §C4 PassB:174). Self-scope — the target user is
 * the SERVER-RESOLVED session subject (never client input; the path `{id}` is checked against it
 * upstream). Absent optional field = stored value unchanged (Doc-4A §9.2 update-command semantics);
 * explicit null is NOT admitted (the fields are `optional`, not `nullable` — Doc-4A §9.2).
 */
export interface UpdateUserProfileInput {
  /** The path `{id}` (Doc-5A §5.4). SYNTAX-validated (uuid), then server-checked against the
   *  session subject — a mismatch collapses to the §6.6 non-disclosure NOT_FOUND (§C4: "self-only —
   *  never accept a target `user_id` ≠ session user"). */
  targetUserId: string;
  /** `display_name : string : optional : bounded` (§C4 PassB:174; bound per Doc-4A conventions —
   *  the realized bound is `DISPLAY_NAME_MAX_LENGTH`). Presentation-only; never an identifier. */
  displayName?: string;
  /** `phone : string : optional : E.164` (§C4 — uniqueness not enforced here; auth-managed
   *  identifiers are infra, DC-4). */
  phone?: string;
  /** `preferences : object : optional : schema-validated keys only` (§C4 PassB:176; "keys
   *  allowlisted" :179; "a bounded schema, not arbitrary JSON" :186). **FAIL-CLOSED** — NO frozen
   *  preference-key catalog exists to allowlist against (`ESC-IDN-PREF-KEYS`, raised RV-0152 F1),
   *  so a SUPPLIED value is VALIDATION-rejected until an additive Doc-4C patch registers the key
   *  schema (the `recovery_method` escalate-never-widen posture; Doc-4A §9.4 / Doc-5C §0.4). */
  preferences?: unknown;
  /** `updated_at : timestamp : required` — optimistic-concurrency token (§B.2), from `If-Match`. */
  updatedAt: Date;
}

/** Result of a successful `update_user_profile` (Doc-4C §C4 response: `user_id` + `updated_at`). */
export interface UpdateUserProfileResult {
  userId: string;
  /** The resulting `updated_at` (the new optimistic-concurrency token). */
  updatedAt: Date;
}

/** Outcome of `identity.update_user_profile.v1`. */
export type UpdateUserProfileOutcome =
  { ok: true; result: UpdateUserProfileResult } | { ok: false; error: UserAccountError };

/**
 * Input to `identity.update_user_2fa_settings.v1` (Doc-4C §C4 PassB:192) — 2FA SETTINGS only; the
 * challenge/verification mechanism is Supabase Auth infrastructure (DC-4) and is not represented.
 */
export interface UpdateUser2faSettingsInput {
  /** The path `{id}` (Doc-5A §5.4); self-checked — mismatch collapses (§6.6 NOT_FOUND). */
  targetUserId: string;
  /** `two_fa_enabled : boolean : required`. */
  twoFaEnabled: boolean;
  /** `recovery_method : enum : optional` — the frozen §C4 declares an enum but names NO source
   *  pointer, and no recovery-method value set exists anywhere in the corpus (checked Doc-2 §10.2
   *  `two_fa`). Per Doc-4A §9.4 a needed-but-missing enum is ESCALATED, never coined — so a supplied
   *  value FAILS CLOSED (VALIDATION) until an additive registers the value set (the RV-0148 MAJOR-2
   *  `resource_scope_unsupported` fail-closed precedent). Carried in the Completion Report. */
  recoveryMethod?: string;
  /** `updated_at : timestamp : required` — optimistic-concurrency token, from `If-Match`. */
  updatedAt: Date;
}

/** Result of a successful `update_user_2fa_settings` (Doc-4C §C4 response). */
export interface UpdateUser2faSettingsResult {
  userId: string;
  twoFaEnabled: boolean;
  updatedAt: Date;
}

/** Outcome of `identity.update_user_2fa_settings.v1`. */
export type UpdateUser2faSettingsOutcome =
  { ok: true; result: UpdateUser2faSettingsResult } | { ok: false; error: UserAccountError };

/**
 * Input to `identity.deactivate_own_account.v1` (Doc-4C §C4 PassB:205) — depart + anonymize
 * (the §14.3 compliance-redaction path; irreversible).
 */
export interface DeactivateOwnAccountInput {
  /** The path `{id}` (Doc-5A §5.4); self-checked — mismatch collapses (§6.6 NOT_FOUND). */
  targetUserId: string;
  /** `confirmation : boolean : required : explicit departure confirmation` — must be `true`. */
  confirmation: boolean;
  /** `updated_at : timestamp : required` — optimistic-concurrency token, from `If-Match`. */
  updatedAt: Date;
}

/** Result of a successful `deactivate_own_account` (Doc-4C §C4 response: `user_id` + `status`). */
export interface DeactivateOwnAccountResult {
  userId: string;
  /** Always `soft_deleted` on success (§C4: `status : enum : always` (= soft-deleted)). */
  status: UserStatusValue;
}

/** Outcome of `identity.deactivate_own_account.v1`. */
export type DeactivateOwnAccountOutcome =
  { ok: true; result: DeactivateOwnAccountResult } | { ok: false; error: UserAccountError };

/**
 * Input to `identity.set_user_account_status.v1` (Doc-4C §C4 PassB:219) — Admin platform governance
 * (21.6; no active-org context, §5.6). The target `user_id : uuid : required` is realized as the
 * path `{id}` (Doc-5C §4.1 input placement).
 */
export interface SetUserAccountStatusInput {
  /** The target user (`user_id : uuid : required` — the path `{id}`). */
  targetUserId: string;
  /** `target_status : enum(suspended|active) : required` (the §C4 `active ⇄ suspended` machine). */
  targetStatus: "suspended" | "active";
  /** `reason : string : required : structured admin reason` — recorded in the audit (BUSINESS). */
  reason: string;
  /** `updated_at : timestamp : required` — optimistic-concurrency token, from `If-Match`. */
  updatedAt: Date;
}

/** Result of a successful `set_user_account_status` (Doc-4C §C4 response). */
export interface SetUserAccountStatusResult {
  userId: string;
  status: UserStatusValue;
  updatedAt: Date;
}

/** Outcome of `identity.set_user_account_status.v1`. */
export type SetUserAccountStatusOutcome =
  { ok: true; result: SetUserAccountStatusResult } | { ok: false; error: UserAccountError };

/** Input to the System `identity.activate_membership.v1` worker (Doc-4C §C6). The target `pending`
 *  membership id (from the DC-4 verification-complete signal); System actor — no org/user context input. */
export interface ActivateMembershipInput {
  membershipId: string;
}

/** Outcome of `identity.activate_membership.v1`. `activated: true` ⇒ the membership advanced `pending →
 *  active` (audited). `activated: false` carries the discriminated no-op reason (System workers surface no
 *  user response — this is for the Inngest seam + tests): `not_found` (no live membership) · `already_active`
 *  (idempotent no-op) · `illegal_state` (source state ≠ `pending`) · `precondition` (org/user not active). */
export interface ActivateMembershipResult {
  activated: boolean;
  reason?: "not_found" | "already_active" | "illegal_state" | "precondition";
}

/** Result of the System `identity.expire_invitation.v1` sweep (Doc-4C §C6 — mechanical counter). */
export interface ExpireInvitationsResult {
  /** Invitations advanced `invited → removed` (expire) this pass. */
  expired: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// §C5 — Organization WIRED write surface (W2-IDN-6.2). The seven Doc-5C §4.1 organization contracts:
//   `create_organization.v1`         POST /identity/organizations · 201+Location      · User (bootstrap — no org context)
//   `update_organization_profile.v1` PATCH /identity/organizations/{id} · 200         · User (active-org; If-Match — the ONE §C5 `Concurrency: optimistic`)
//   `transfer_ownership.v1`          POST …/{id}/transfer_ownership · 200             · User (Owner; §5.5-guarded — RV-0150 lock)
//   `soft_delete_organization.v1`    DELETE /identity/organizations/{id} · 200        · User (Owner; DC-1 cascade out-of-wire)
//   `restore_organization.v1`        POST …/{id}/restore_organization · 200           · User (Owner) / Admin
//   `set_organization_status.v1`     POST …/{id}/set_organization_status · 200        · Admin (no org context)
//   `admin_recover_ownership.v1`     POST …/{id}/admin_recover_ownership · 200        · Admin (§5.5-guarded — RV-0150 lock)
// The target org id is the PATH `{id}` (Doc-5C §4.1 input placement — the §C5 `organization_id`
// request field realized as the path segment; the 6.1 `user_id` precedent). `updated_at` carriage
// is PER-CONTRACT (the RV-0153 call-1 lesson — never a blanket): If-Match ONLY on the contract
// declaring `Concurrency: optimistic` (update_organization_profile, PassB:262); every other §C5
// mutation carries it as the frozen REQUIRED request-body field. Field names/semantics owned by
// Doc-4C §C5 (verbatim); bound by pointer, never re-authored. Events: none ([DC-1]).
// ─────────────────────────────────────────────────────────────────────────────

/** Error outcome of a §C5 organization command (Doc-4C §C5 error registers; classes per Doc-5A §6.2). */
export interface OrganizationError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · AUTHORIZATION→403 · NOT_FOUND→404 ·
   *  STATE→409 · CONFLICT→409 · REFERENCE→422 · BUSINESS→422). Only classes the §C5 registers
   *  author are raised (QUOTA is register-authored on create but unreachable while no per-user
   *  org-count POLICY key is registered — Doc-3 v1.9 §5). */
  errorClass:
    | "VALIDATION"
    | "AUTHORIZATION"
    | "NOT_FOUND"
    | "STATE"
    | "CONFLICT"
    | "REFERENCE"
    | "BUSINESS"
    | "QUOTA";
  /** The Doc-4C §C5 `identity_org_*` / `identity_membership_not_found` / `identity_user_not_found`
   *  register code (frozen; never coined here). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
  /**
   * The org row's CURRENT `updated_at` concurrency token — populated ONLY on the Doc-5A §9.5
   * stale-precondition / §9.4 losing-concurrent-write legs so the wire mapper emits the `ETag`
   * response header (§9.6 re-read-retry). NEVER populated on a machine-illegal-edge STATE
   * rejection (the RV-0152 call-13 leg discipline — a token there is a false retry signal).
   */
  currentUpdatedAt?: Date;
}

/**
 * Input to `identity.create_organization.v1` (Doc-4C §C5 PassB:239–243). Bootstrap — the creator
 * becomes Owner; NO active-org context (Doc-5C §2.2 row 5 "N (bootstrap)").
 *
 * FAIL-CLOSED deferred fields (the `approval_settings`/`ESC-IDN-PREF-KEYS` posture, logged in the
 * report): `org_type` (no Doc-2 §10.2 organizations column/enum exists), `address`/`contact_info`
 * (Address/ContactInfo VOs with no realized column) — a SUPPLIED value is VALIDATION-rejected until
 * an additive Doc-2/Doc-6C patch realizes the columns; they are deliberately NOT on this input.
 */
export interface CreateOrganizationInput {
  /** `name : string : required : org legal/display name; length-bounded`. */
  name: string;
  /** `is_personal_org : boolean : optional : default false; server-set on Solo Trader auto-create
   *  (Architecture §5.2), not client-trusted` — a client-asserted `true` is NEVER honored: it maps
   *  to the frozen duplicate-personal-org guard (`identity_org_personal_exists`) when the caller's
   *  personal org exists, and is VALIDATION-rejected otherwise (server-set means server-set). */
  isPersonalOrg?: boolean;
}

/** Result of a successful `create_organization` (§C5 response: organization_id · human_ref ·
 *  org_status (= active) · owner_membership_id). */
export interface CreateOrganizationResult {
  organizationId: string;
  /** `ORG-…` via the M0 `core.allocate_human_reference.v1` contract (display-only, never authz). */
  humanRef: string;
  orgStatus: "active";
  ownerMembershipId: string;
}

/** Outcome of `identity.create_organization.v1`. */
export type CreateOrganizationOutcome =
  { ok: true; result: CreateOrganizationResult } | { ok: false; error: OrganizationError };

/**
 * Input to `identity.update_organization_profile.v1` (Doc-4C §C5 PassB:257). The target org is the
 * path `{id}`, server-checked against the ACTIVE org (mismatch collapses — §6.6 NOT_FOUND).
 * `address`/`contact_info`/`brand_assets_ref` are FAIL-CLOSED deferred (no realized column — see
 * `CreateOrganizationInput`); only `name` is realizable today.
 */
export interface UpdateOrganizationProfileInput {
  /** The path `{id}` (Doc-5A §5.4); SYNTAX-validated (uuid) then checked against the active org. */
  targetOrganizationId: string;
  /** `name : string : optional : bounded`. Absent = unchanged (Doc-4A §9.2 update semantics). */
  name?: string;
  /** `updated_at : timestamp : required` — the §C5 `Concurrency: optimistic` token, from `If-Match`
   *  (Doc-5C §4.3 — the ONE §C5 contract declaring optimistic concurrency, PassB:262). */
  updatedAt: Date;
}

/** Result of a successful `update_organization_profile` (§C5 response). */
export interface UpdateOrganizationProfileResult {
  organizationId: string;
  /** The resulting `updated_at` (the new optimistic-concurrency token). */
  updatedAt: Date;
}

/** Outcome of `identity.update_organization_profile.v1`. */
export type UpdateOrganizationProfileOutcome =
  { ok: true; result: UpdateOrganizationProfileResult } | { ok: false; error: OrganizationError };

/**
 * Input to `identity.transfer_ownership.v1` (Doc-4C §C5 PassB:271) — the §5.5-guarded succession
 * command (RV-0150 serialization contract). The target org is the path `{id}` = the active org.
 */
export interface TransferOwnershipInput {
  /** The path `{id}`; checked against the active org (mismatch collapses — §6.6 NOT_FOUND). */
  targetOrganizationId: string;
  /** `new_owner_user_id : uuid : required : must hold an active membership in the org`. */
  newOwnerUserId: string;
  /** `reason_code : string : required : structured succession reason (Architecture §5.5)`. */
  reasonCode: string;
  /** `approver_membership_id : uuid : optional : where org workflow requires an approver` — when
   *  supplied it MUST resolve to a live membership of the org (§B.4 SCOPE "org owns both
   *  memberships") and is recorded in the audit (§5.5 "approver identity"). */
  approverMembershipId?: string;
  /** `updated_at : timestamp : required` — REQUIRED request-body field (§C5 declares NO
   *  `Concurrency: optimistic` here — the RV-0153 call-1 discipline); a stale/losing token maps to
   *  the register's `identity_org_update_conflict` (CONFLICT → 409 + `ETag`). */
  updatedAt: Date;
}

/** Result of a successful `transfer_ownership` (§C5 response). */
export interface TransferOwnershipResult {
  organizationId: string;
  newOwnerMembershipId: string;
  /** The org aggregate's new concurrency token (§C5 `updated_at : always`). */
  updatedAt: Date;
}

/** Outcome of `identity.transfer_ownership.v1`. */
export type TransferOwnershipOutcome =
  { ok: true; result: TransferOwnershipResult } | { ok: false; error: OrganizationError };

/** Input to `identity.soft_delete_organization.v1` (Doc-4C §C5 PassB:285). DELETE item (ADR-012);
 *  the target org is the path `{id}` = the active org. Cascade: in-module memberships ONLY
 *  (cross-module legs BLOCKED — [DC-1]). */
export interface SoftDeleteOrganizationInput {
  /** The path `{id}`; checked against the active org (mismatch collapses — §6.6 NOT_FOUND). */
  targetOrganizationId: string;
  /** `confirmation : boolean : required` — must be literally `true`. */
  confirmation: boolean;
  /** `reason : string : required` — recorded as the org row's `delete_reason` + in the audit. */
  reason: string;
  /** `updated_at : timestamp : required` — REQUIRED body field (no optimistic declaration);
   *  stale/losing → `identity_org_update_conflict` (CONFLICT → 409 + `ETag`). */
  updatedAt: Date;
}

/** Result of a successful `soft_delete_organization` (§C5 response: org_status = soft_deleted). */
export interface SoftDeleteOrganizationResult {
  organizationId: string;
  orgStatus: "soft_deleted";
}

/** Outcome of `identity.soft_delete_organization.v1`. */
export type SoftDeleteOrganizationOutcome =
  { ok: true; result: SoftDeleteOrganizationResult } | { ok: false; error: OrganizationError };

/** Input to `identity.restore_organization.v1` (Doc-4C §C5 PassB:300). The `organization_id : uuid :
 *  required` request field is the path `{id}` (Doc-5C §4.1 placement). Dual-leg actor: User (Owner)
 *  self-restore or Admin (no org context — §5.6). */
export interface RestoreOrganizationInput {
  /** The path `{id}` (the frozen `organization_id` field). */
  targetOrganizationId: string;
  /** `reason : string : optional` — recorded in the audit when supplied. */
  reason?: string;
  /** `updated_at : timestamp : required` — REQUIRED body field. The §C5 restore register authors NO
   *  CONFLICT code, so a stale token is the in-register VALIDATION 400 (the ratified §C9 posture,
   *  RV-0153 call-1); a LOSING concurrent restore is the register's `identity_org_state_invalid`
   *  (STATE → 409, carrying the current token — the 6.5 losing-write leg discipline). */
  updatedAt: Date;
}

/** Result of a successful `restore_organization` (§C5 response: org_status = active +
 *  `slug_regenerated : boolean : always` — the §5.1 restore-conflict rule). */
export interface RestoreOrganizationResult {
  organizationId: string;
  orgStatus: "active";
  slugRegenerated: boolean;
}

/** Outcome of `identity.restore_organization.v1`. */
export type RestoreOrganizationOutcome =
  { ok: true; result: RestoreOrganizationResult } | { ok: false; error: OrganizationError };

/** Input to `identity.set_organization_status.v1` (Doc-4C §C5 PassB:314) — Admin platform
 *  governance (21.6; NO org context, §5.6). The `organization_id` field is the path `{id}`. */
export interface SetOrganizationStatusInput {
  /** The target org (`organization_id : uuid : required` — the path `{id}`). */
  targetOrganizationId: string;
  /** `target_status : enum(suspended|active) : required` (the §5.1 `active ⇄ suspended` edges). */
  targetStatus: "suspended" | "active";
  /** `reason : string : required` — recorded in the audit (BUSINESS "reason recorded"). */
  reason: string;
  /** `updated_at : timestamp : required` — REQUIRED body field (no optimistic declaration);
   *  stale/losing → the register's `identity_org_status_conflict` (CONFLICT → 409 + `ETag`). */
  updatedAt: Date;
}

/** Result of a successful `set_organization_status` (§C5 response). */
export interface SetOrganizationStatusResult {
  organizationId: string;
  orgStatus: OrganizationStatusValue;
  updatedAt: Date;
}

/** Outcome of `identity.set_organization_status.v1`. */
export type SetOrganizationStatusOutcome =
  { ok: true; result: SetOrganizationStatusResult } | { ok: false; error: OrganizationError };

/** Input to `identity.admin_recover_ownership.v1` (Doc-4C §C5 PassB:328) — Admin orphaned-ownership
 *  recovery (21.6; NO org context; §5.5-guarded — RV-0150 lock). The `organization_id` field is the
 *  path `{id}`. */
export interface AdminRecoverOwnershipInput {
  /** The target org (`organization_id : uuid : required` — the path `{id}`). */
  targetOrganizationId: string;
  /** `new_owner_user_id : uuid : required` (§B.9 REFERENCE: exists; membership creatable/active). */
  newOwnerUserId: string;
  /** `reason_code : string : required : recovery justification (Architecture §5.5)`. */
  reasonCode: string;
  /** `updated_at : timestamp : required` — REQUIRED body field. The recovery register authors NO
   *  CONFLICT/STATE code, so a stale token is the in-register VALIDATION 400 (the §C9 posture). */
  updatedAt: Date;
}

/** Result of a successful `admin_recover_ownership` (§C5 response — no `updated_at`). */
export interface AdminRecoverOwnershipResult {
  organizationId: string;
  newOwnerMembershipId: string;
}

/** Outcome of `identity.admin_recover_ownership.v1`. */
export type AdminRecoverOwnershipOutcome =
  { ok: true; result: AdminRecoverOwnershipResult } | { ok: false; error: OrganizationError };

/**
 * Input to lazy first-login identity provisioning (WP-1.3) — the authenticated Supabase subject.
 *
 * Provisioning is OUT-OF-BAND (Doc-7E §2 / `[ESC-7-API-SIGNUP]`): signup coins NO `create_user`
 * wire contract; M1 materializes the identity (user + Personal Organization + Owner membership) on
 * first authenticated login. `authUserId` is the Supabase `auth.users` id — the infra auth-boundary
 * linkage (Doc-6C §3.1 / DC-4); the credential/secret never reaches M1.
 */
export interface ProvisionIdentityInput {
  /** The Supabase `auth.users` id linking the session to the `identity.users` record (Doc-6C §3.1). */
  authUserId: string;
  /** The subject's email (auth-managed identifier; persisted on `identity.users` per Doc-2 §10.2). */
  email?: string | null;
}

/**
 * Outcome of provisioning — the resolved identity (created or pre-existing).
 * `created = false` ⇒ idempotent no-op (the identity already existed); the ids reflect the
 * authoritative existing rows.
 */
export interface ProvisionIdentityResult {
  /** True when this call materialized the identity; false on the idempotent path. */
  created: boolean;
  /** The `identity.users` id (UUIDv7). */
  userId: string;
  /** The Personal Organization id (UUIDv7), or null if not resolvable on the idempotent path. */
  organizationId: string | null;
  /** The org `human_ref` (`ORG-YYYY-NNNNNN`), or null if not resolvable on the idempotent path. */
  organizationHumanRef: string | null;
  /** The founding Owner membership id (UUIDv7), or null if not resolvable on the idempotent path. */
  ownerMembershipId: string | null;
}
