// Public service interfaces + callables for module "trust" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Cross-module consumers (the app-layer composition edge `src/server/trust`)
// import from here, never the private application/domain/infrastructure/api layers.
//
// W3-TRUST-2 realizes the `trust.request_verification.v1` write facade (Doc-4G §G4.1; the D7
// audited-write pattern + the SECURITY-DEFINER twist). The concrete callable delegates to THIS module's
// application command (same-module contracts-facade — `${from.module}`-scoped; no cross-module internal
// access is opened). The M0 `appendAuditRecord` is INJECTED by the caller via the contract TYPE — never
// a concrete cross-module value import. NO `@/modules/identity` / `@/modules/marketplace` import here:
// the AUTHZ (`can_submit_verification` → M1 `check_permission`) lives at the composition edge
// (`src/server/trust` → `src/server/authz`), never inside this module.

import type { DbExecutor, PrismaClient } from "@/shared/db";
import { requestVerificationCommand } from "../application/commands/request-verification.command";
import { submitReview as submitReviewCommand } from "../application/commands/submit-review.command";
import {
  moderateReview as moderateReviewService,
  publishReview as publishReviewService,
  removeReview as removeReviewService,
} from "../application/services/public-review.service";
import {
  getReview as getReviewService,
  listReviews as listReviewsService,
} from "../application/services/review-read.service";
import {
  listAdminRatings as listAdminRatingsService,
  setAdminRating as setAdminRatingService,
} from "../application/services/admin-rating.service";
import {
  confirmVerifiedTier as confirmVerifiedTierService,
  downgradeVerifiedTier as downgradeVerifiedTierService,
  establishVerifiedTier as establishVerifiedTierService,
  expireVerifiedTier as expireVerifiedTierService,
  suspendVerifiedTier as suspendVerifiedTierService,
} from "../application/services/verified-tier.service";
import {
  computePerformanceScore as computePerformanceScoreService,
  ingestPerformanceInput as ingestPerformanceInputService,
  triggerPerformanceReview as triggerPerformanceReviewService,
} from "../application/services/performance-score.service";
import { computeTrustScore as computeTrustScoreService } from "../application/services/trust-score.service";
import {
  actionFraudSignal as actionFraudSignalService,
  createFraudSignal as createFraudSignalService,
  dismissFraudSignal as dismissFraudSignalService,
  reviewFraudSignal as reviewFraudSignalService,
} from "../application/services/fraud-signal.service";
import type {
  ComputePerformanceScoreInput,
  ComputePerformanceScoreOutcome,
  ComputeTrustScoreInput,
  ComputeTrustScoreOutcome,
  ConfirmVerifiedTierInput,
  CreateFraudSignalInput,
  CreateFraudSignalOutcome,
  DowngradeVerifiedTierInput,
  EstablishVerifiedTierInput,
  ExpireVerifiedTierInput,
  FraudSignalActorContext,
  FraudSignalDeps,
  AdminRatingStaffContext,
  FraudSignalTriageInput,
  FraudSignalTriageOutcome,
  GetReviewInput,
  GetReviewOutcome,
  ListAdminRatingsInput,
  ListAdminRatingsOutcome,
  IngestPerformanceInputDeps,
  IngestPerformanceInputInput,
  IngestPerformanceInputOutcome,
  ListReviewsInput,
  ListReviewsOutcome,
  ModerateReviewInput,
  ModerateReviewOutcome,
  PerformanceScoreDeps,
  PublishReviewDeps,
  PublishReviewInput,
  PublishReviewOutcome,
  RemoveReviewInput,
  RemoveReviewOutcome,
  RequestVerificationContext,
  RequestVerificationDeps,
  RequestVerificationInput,
  RequestVerificationOutcome,
  ReviewStaffContext,
  SetAdminRatingDeps,
  SetAdminRatingInput,
  SetAdminRatingOutcome,
  SubmitReviewContext,
  SubmitReviewDeps,
  SubmitReviewInput,
  SubmitReviewOutcome,
  SuspendVerifiedTierInput,
  TriggerPerformanceReviewInput,
  TriggerPerformanceReviewOutcome,
  TrustScoreDeps,
  VerifiedTierAdminContext,
  VerifiedTierDeps,
  VerifiedTierOutcome,
} from "./types";

// Re-export the command's context/deps DTOs on the contracts surface so the composition edge builds
// them via `@/modules/trust/contracts` (contracts-only).
export type { RequestVerificationContext, RequestVerificationDeps };

// W3-TRUST-3 — the Verified-Tier write-service DTOs + the `VendorTierChanged` event surface, re-exported so
// the DEFERRED admin command / System timer (and consumers) build them via `@/modules/trust/contracts`.
export type {
  ConfirmVerifiedTierInput,
  DowngradeVerifiedTierInput,
  EstablishVerifiedTierInput,
  ExpireVerifiedTierInput,
  SuspendVerifiedTierInput,
  VerifiedTierAdminContext,
  VerifiedTierDeps,
  VerifiedTierOutcome,
  VerifiedTierResult,
  VerifiedTierError,
  FinancialTier,
  VerifiedTierStatus,
} from "./types";
export {
  VENDOR_TIER_CHANGED_EVENT,
  VENDOR_TIER_CHANGED_EVENT_VERSION,
  type VendorTierChangedPayload,
} from "./events";

// W3-TRUST-4a — the Performance-Score write-service DTOs + the two §8 event surfaces, re-exported so the
// DEFERRED production triggers / consumers build them via `@/modules/trust/contracts`.
export type {
  IngestPerformanceInputInput,
  IngestPerformanceInputDeps,
  IngestPerformanceInputOutcome,
  IngestPerformanceInputResult,
  IngestPerformanceInputError,
  ComputePerformanceScoreInput,
  ComputePerformanceScoreOutcome,
  ComputePerformanceScoreResult,
  ComputePerformanceScoreError,
  TriggerPerformanceReviewInput,
  TriggerPerformanceReviewOutcome,
  TriggerPerformanceReviewResult,
  TriggerPerformanceReviewError,
  PerformanceScoreDeps,
  PerformanceInputTypeValue,
  PerformanceSourceTypeValue,
  ScoreFreezeStateValue,
  PerformanceComputeTrigger,
  PerformanceReviewReason,
} from "./types";
export {
  PERFORMANCE_SCORE_UPDATED_EVENT,
  PERFORMANCE_REVIEW_TRIGGERED_EVENT,
  PERFORMANCE_EVENT_VERSION,
  type PerformanceScoreUpdatedPayload,
  type PerformanceReviewTriggeredPayload,
} from "./events";

// W3-TRUST-4b — the BC-TRUST-2 Trust-Score compute DTOs + the `TrustScoreUpdated` event surface, re-exported
// so the DEFERRED production triggers / consumers (M2 directory band, M3 matching) build them via
// `@/modules/trust/contracts`.
export type {
  ComputeTrustScoreInput,
  ComputeTrustScoreOutcome,
  ComputeTrustScoreResult,
  ComputeTrustScoreError,
  TrustScoreDeps,
  TrustComputeTrigger,
} from "./types";
export {
  TRUST_SCORE_UPDATED_EVENT,
  TRUST_EVENT_VERSION,
  type TrustScoreUpdatedPayload,
} from "./events";

// The stage-1 SYNTAX validator + its result→outcome mapper — surfaced so the composition edge runs SYNTAX
// BEFORE AUTHZ (Doc-4A §11.2 fixed order), from the SAME single source the command re-runs (self-guard).
export {
  requestVerificationSyntaxOutcome,
  validateRequestVerificationInput,
} from "../application/commands/request-verification.command";
export type { RequestVerificationSyntaxResult } from "../application/commands/request-verification.command";

// The Doc-2 §7 AUTHZ slug (bound by pointer) — surfaced so the composition edge references ONE source.
export { CAN_SUBMIT_VERIFICATION_SLUG } from "../domain/request-verification.constants";

/**
 * `trust.request_verification.v1` (Doc-4G §G4.1) — the PUBLIC, contracts-only face over the private M5
 * write command. Open an organization verification case (state `requested`), appending the canonical
 * ENUMERATED audit action (`verification_requested`) ATOMICALLY with the privileged SD-function write.
 * The active org is RESOLVED + enforced upstream by the app-layer org-context guard; AUTHZ
 * (`can_submit_verification`) is performed at the composition edge BEFORE this call; the M0
 * `appendAuditRecord` is INJECTED by the contract TYPE.
 *
 * MUST be invoked INSIDE `withActiveOrgContext` — the `db` executor carries the server-set
 * `app.active_org` / `app.user_id` GUCs the audit `WITH CHECK` reads (and under which the SD function
 * runs). RESTRICTED to `subject_type = organization` (this WP).
 */
export type RequestVerification = (
  input: RequestVerificationInput,
  ctx: RequestVerificationContext,
  deps: RequestVerificationDeps,
  db?: DbExecutor,
) => Promise<RequestVerificationOutcome>;

/** Concrete `trust.request_verification.v1` facade (M5 contracts → M5 application command). */
export const requestVerification: RequestVerification = (input, ctx, deps, db) =>
  requestVerificationCommand(input, ctx, deps, db);

// The M5 WIRE FACE for the verification-request write (outcome → Doc-5A envelope + §6.2 status) + the two
// error-builders the composition edge consumes. One-Owner placement — M5 owns how its write becomes HTTP;
// this contracts re-export is the boundary-legal handle the app-layer composition consumes via
// `@/modules/trust/contracts` (same-module contracts → own `api/`; no cross-module internal access).
export {
  mapRequestVerification,
  requestVerificationForbidden,
  requestVerificationInvalidInput,
} from "../api/request-verification.handler";

// ── W3-TRUST-3 — the Verified Financial Tier write-service facades (Doc-4G §G4.6/§G4.7) ────────────────
// The PUBLIC, contracts-only faces over the private M5 write-service. Each writes the tier via the
// SECURITY-DEFINER function, EMITS `VendorTierChanged` (M0 `core.write_outbox_event.v1`), and appends ONE
// audit — ALL atomically on the caller's tx (Doc-8F). The admin HTTP commands (`staff_can_verify` authz +
// routes) and the System expire timer are DEFERRED; these functions are what they will call, invoked
// directly by tests. The M0 `appendAuditRecord` + `writeOutboxEvent` are INJECTED by contract TYPE. MUST be
// invoked INSIDE a staff-scoped tx (`app.is_platform_staff = true`) so the outbox INSERT + audit append are
// RLS-admitted (natural for the Admin/System actor).

/** `trust.set_verified_tier.v1` (Doc-4G §G4.6) — establish a vendor's verified tier (Admin). */
export type EstablishVerifiedTier = (
  input: EstablishVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.confirm_verified_tier.v1` (Doc-4G §G4.6) — renew a verified tier's review window (Admin). */
export type ConfirmVerifiedTier = (
  input: ConfirmVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.downgrade_verified_tier.v1` (Doc-4G §G4.6) — lower a verified tier's band (Admin). */
export type DowngradeVerifiedTier = (
  input: DowngradeVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.suspend_verified_tier.v1` (Doc-4G §G4.7) — suspend a verified tier; reason required (Admin). */
export type SuspendVerifiedTier = (
  input: SuspendVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.expire_verified_tier.v1` (Doc-4G §G4.7) — expire a verified tier on the review lapse (System). */
export type ExpireVerifiedTier = (
  input: ExpireVerifiedTierInput,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** Concrete `trust.set_verified_tier.v1` facade (M5 contracts → M5 write-service). */
export const establishVerifiedTier: EstablishVerifiedTier = (input, ctx, deps, db) =>
  establishVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.confirm_verified_tier.v1` facade. */
export const confirmVerifiedTier: ConfirmVerifiedTier = (input, ctx, deps, db) =>
  confirmVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.downgrade_verified_tier.v1` facade. */
export const downgradeVerifiedTier: DowngradeVerifiedTier = (input, ctx, deps, db) =>
  downgradeVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.suspend_verified_tier.v1` facade. */
export const suspendVerifiedTier: SuspendVerifiedTier = (input, ctx, deps, db) =>
  suspendVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.expire_verified_tier.v1` facade (System). */
export const expireVerifiedTier: ExpireVerifiedTier = (input, deps, db) =>
  expireVerifiedTierService(input, deps, db);

// ── W3-TRUST-4a — the BC-TRUST-3 Performance-Score write-service facades (Doc-4G §G6.1/§G6.2/§G6.4) ─────
// The PUBLIC, contracts-only faces over the private M5 Performance-Score services. All three are System
// contracts (out-of-wire, no api/route); the live production triggers + consumers are DEFERRED — these are the
// functions they will call, invoked directly by tests. The M0 `appendAuditRecord` + `writeOutboxEvent` are
// INJECTED by contract TYPE. MUST be invoked INSIDE a staff-scoped tx (`app.is_platform_staff = true`) so the
// SD reads + outbox INSERT + audit append are RLS-admitted (natural for the System actor).

/** `trust.ingest_performance_input.v1` (Doc-4G §G6.1) — sole writer of performance_inputs (System; emits no event). */
export type IngestPerformanceInput = (
  input: IngestPerformanceInputInput,
  deps: IngestPerformanceInputDeps,
  db?: DbExecutor,
) => Promise<IngestPerformanceInputOutcome>;

/** `trust.compute_performance_score.v1` (Doc-4G §G6.2) — compute + publish-on-change + audit (System). */
export type ComputePerformanceScore = (
  input: ComputePerformanceScoreInput,
  deps: PerformanceScoreDeps,
  db?: DbExecutor,
) => Promise<ComputePerformanceScoreOutcome>;

/** `trust.trigger_performance_review.v1` (Doc-4G §G6.4) — emit review-trigger + audit; no score write (System). */
export type TriggerPerformanceReview = (
  input: TriggerPerformanceReviewInput,
  deps: PerformanceScoreDeps,
  db?: DbExecutor,
) => Promise<TriggerPerformanceReviewOutcome>;

/** Concrete `trust.ingest_performance_input.v1` facade (M5 contracts → M5 service). */
export const ingestPerformanceInput: IngestPerformanceInput = (input, deps, db) =>
  ingestPerformanceInputService(input, deps, db);

/** Concrete `trust.compute_performance_score.v1` facade. */
export const computePerformanceScore: ComputePerformanceScore = (input, deps, db) =>
  computePerformanceScoreService(input, deps, db);

/** Concrete `trust.trigger_performance_review.v1` facade. */
export const triggerPerformanceReview: TriggerPerformanceReview = (input, deps, db) =>
  triggerPerformanceReviewService(input, deps, db);

// ── W3-TRUST-4b — the BC-TRUST-2 Trust-Score compute facade (Doc-4G §G5.1) ─────────────────────────────
// The PUBLIC, contracts-only face over the private M5 Trust-Score service. `compute_trust_score` is a System
// contract (out-of-wire, no api/route); the live production triggers + consumers + freeze/reactivate + reads
// are DEFERRED — this is the function they will call, invoked directly by tests. The M0 `appendAuditRecord` +
// `writeOutboxEvent` are INJECTED by contract TYPE. MUST be invoked INSIDE a staff-scoped tx
// (`app.is_platform_staff = true`) so the firewall-scoped input reads (verification_records +
// performance_scores) + outbox INSERT + audit append are RLS-admitted (natural for the System actor).

/** `trust.compute_trust_score.v1` (Doc-4G §G5.1) — compute + publish-on-change `TrustScoreUpdated` + audit
 *  (System); reads Verification + Performance + Fraud ONLY (INVARIANT to Financial Tier — Invariant #6). */
export type ComputeTrustScore = (
  input: ComputeTrustScoreInput,
  deps: TrustScoreDeps,
  db?: DbExecutor,
) => Promise<ComputeTrustScoreOutcome>;

/** Concrete `trust.compute_trust_score.v1` facade (M5 contracts → M5 service). */
export const computeTrustScore: ComputeTrustScore = (input, deps, db) =>
  computeTrustScoreService(input, deps, db);

// ── W3-TRUST-4c — the BC-TRUST-4 Fraud & Risk Signal write-lifecycle facades (Doc-4G §G7.1/§G7.2) ───────
// The PUBLIC, contracts-only faces over the private M5 fraud-signal service. This is an IN-BAND
// AUDITED-WRITE aggregate — each writes `fraud_signals` + appends ONE `[ESC-TRUST-AUDIT]` audit atomically
// on the caller's tx; NO event (Doc-4G §H.7 — Doc-2 §8 has no Trust fraud event); NO SD (Doc-6G §3.4);
// firewall (mutates no score/verification/tier; never a ban — Doc-4G §H.9b/c). The §G7.3 staff reads, the
// Admin HTTP wiring, and the `staff_can_ban` composition-edge authz are DEFERRED — these are the functions
// they will call, invoked directly by tests. The M0 `appendAuditRecord` is INJECTED by contract TYPE (NO
// `writeOutboxEvent`). MUST be invoked INSIDE a staff-scoped tx (`app.is_platform_staff = true`) so the
// in-band `fraud_signals` write + the audit append are RLS-admitted (natural for the Admin/System actor).

/** The re-exported fraud-signal DTOs (create + triage; actor context; deps) so the DEFERRED Admin command /
 *  System detector (and consumers) build them via `@/modules/trust/contracts`. */
export type {
  CreateFraudSignalInput,
  CreateFraudSignalResult,
  CreateFraudSignalOutcome,
  FraudSignalTriageInput,
  FraudSignalTriageResult,
  FraudSignalTriageOutcome,
  FraudSignalActorContext,
  FraudSignalDeps,
  FraudSignalError,
  FraudSignalStateValue,
} from "./types";

// The Doc-2 §7 platform-staff AUTHZ slug (bound by pointer) — surfaced so the DEFERRED composition edge
// references ONE source (staff-reported create + all triage; System-detected create carries no slug).
export { STAFF_CAN_BAN_SLUG } from "../domain/fraud-signal.constants";

/** `trust.create_fraud_signal.v1` (Doc-4G §G7.1) — open a fraud signal (System-detected or staff-reported);
 *  IN-BAND write + ONE audit, atomic; idempotent on the detection key; NO event. */
export type CreateFraudSignal = (
  input: CreateFraudSignalInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<CreateFraudSignalOutcome>;

/** `trust.review_fraud_signal.v1` (Doc-4G §G7.2) — open → reviewed (Admin). */
export type ReviewFraudSignal = (
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<FraudSignalTriageOutcome>;

/** `trust.action_fraud_signal.v1` (Doc-4G §G7.2) — reviewed → actioned, terminal (Admin). */
export type ActionFraudSignal = (
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<FraudSignalTriageOutcome>;

/** `trust.dismiss_fraud_signal.v1` (Doc-4G §G7.2) — reviewed → dismissed, terminal (Admin). */
export type DismissFraudSignal = (
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<FraudSignalTriageOutcome>;

/** Concrete `trust.create_fraud_signal.v1` facade (M5 contracts → M5 service). */
export const createFraudSignal: CreateFraudSignal = (input, ctx, deps, db) =>
  createFraudSignalService(input, ctx, deps, db);

/** Concrete `trust.review_fraud_signal.v1` facade. */
export const reviewFraudSignal: ReviewFraudSignal = (input, ctx, deps, db) =>
  reviewFraudSignalService(input, ctx, deps, db);

/** Concrete `trust.action_fraud_signal.v1` facade. */
export const actionFraudSignal: ActionFraudSignal = (input, ctx, deps, db) =>
  actionFraudSignalService(input, ctx, deps, db);

/** Concrete `trust.dismiss_fraud_signal.v1` facade. */
export const dismissFraudSignal: DismissFraudSignal = (input, ctx, deps, db) =>
  dismissFraudSignalService(input, ctx, deps, db);

// ── W3-TRUST-5a — the BC-TRUST-5 (Part A) Public Review facades (Doc-4G §G8.1/§G8.2/§G8.3/§G8.5) ─────────
// The PUBLIC, contracts-only faces over the private M5 Public Review command/services. This is an IN-BAND
// AUDITED-WRITE aggregate (the D7 / WP4c fraud pattern) — each mutation writes `public_reviews` + appends ONE
// ENUMERATED §9 audit (Doc-2 §9 line 693 Reviews — submit/moderation/publish/remove) atomically on the
// caller's tx; NO event (Doc-4G §H.7 — Doc-2 §8 has no Trust review event); NO SD (Doc-6G §3.5.2); firewall
// (a review mutates no score/verification/fraud/tier and issues no ban — Doc-4G §H.9). `author_organization_id`
// is SERVER-derived from the active-org context (Invariant #5), never client input.
//
// PUBLISH is the TWO-STEP model (patch F4G-PB5-MA2): Step 1 = state+audit atomic; Step 2 = the in-module
// BC-TRUST-3 ingestion service (Path B, F4G-M2 single-writer — the ONLY downstream write; never a direct
// `performance_inputs` write). Step 2 failure does NOT roll back the `published` review. The Admin HTTP wiring
// + the `can_submit_review` (buyer) / `staff_can_verify`|`staff_super_admin` (staff) composition-edge authz +
// the DG-4 engagement / DG-2 vendor resolution are DEFERRED to the composition edge (the WP2 precedent) —
// these are the functions they will call, invoked directly by tests. **Admin Ratings (§G8.4) are a SEPARATE
// aggregate (WP5b) — not built here.** The M0 `appendAuditRecord` is INJECTED by contract TYPE (NO
// `writeOutboxEvent`). submit MUST run inside `withActiveOrgContext` (active-org GUC); moderate/remove inside
// a staff-scoped tx (`app.is_platform_staff = true`); publish takes the BASE client (owns two tx boundaries).

/** The stage-1 SYNTAX validator + its result→outcome mapper — surfaced so the DEFERRED composition edge runs
 *  SYNTAX BEFORE AUTHZ (Doc-4A §11.2 fixed order), from the SAME single source the command re-runs (self-guard). */
export {
  submitReviewSyntaxOutcome,
  validateSubmitReviewInput,
} from "../application/commands/submit-review.command";
export type { SubmitReviewSyntaxResult } from "../application/commands/submit-review.command";

// The Doc-2 §7 AUTHZ slugs (bound by pointer) — surfaced so the DEFERRED composition edge references ONE source.
export {
  CAN_SUBMIT_REVIEW_SLUG,
  STAFF_CAN_VERIFY_SLUG,
  STAFF_SUPER_ADMIN_SLUG,
} from "../domain/public-review.constants";

// The re-exported Public Review DTOs so the DEFERRED Admin command / composition edge (and consumers) build
// them via `@/modules/trust/contracts`. NO event export (BC-TRUST-5 emits none).
export type {
  SubmitReviewInput,
  SubmitReviewContext,
  SubmitReviewDeps,
  SubmitReviewResult,
  SubmitReviewError,
  SubmitReviewOutcome,
  ModerateReviewInput,
  ModerateReviewOutcome,
  PublishReviewInput,
  PublishReviewDeps,
  PublishReviewOutcome,
  PublishReviewResult,
  RemoveReviewInput,
  RemoveReviewOutcome,
  ReviewStaffContext,
  ReviewStaffResult,
  ReviewStaffError,
  PublicReviewStatusValue,
  ReviewModerationDecisionValue,
  GetReviewInput,
  GetReviewOutcome,
  ListReviewsInput,
  ListReviewsOutcome,
  PublicReviewView,
  ListReviewsResult,
  ReviewReadError,
} from "./types";

/** `trust.submit_review.v1` (Doc-4G §G8.1) — buyer-authored submit (User + active-org). MUST be invoked
 *  INSIDE `withActiveOrgContext` (the `db` executor carries `app.active_org`/`app.user_id`). Emits no event. */
export type SubmitReview = (
  input: SubmitReviewInput,
  ctx: SubmitReviewContext,
  deps: SubmitReviewDeps,
  db?: DbExecutor,
) => Promise<SubmitReviewOutcome>;

/** `trust.moderate_review.v1` (Doc-4G §G8.2) — staff approve/reject a submitted review. MUST run inside a
 *  staff-scoped tx (`app.is_platform_staff = true`). Emits no event. */
export type ModerateReview = (
  input: ModerateReviewInput,
  ctx: ReviewStaffContext,
  deps: SubmitReviewDeps,
  db?: DbExecutor,
) => Promise<ModerateReviewOutcome>;

/** `trust.publish_review.v1` (Doc-4G §G8.3; patch F4G-PB5-MA2 two-step) — staff publish; Step 2 feeds
 *  Buyer-Feedback (Path B) via the in-module BC-TRUST-3 ingestion service. Takes the BASE client (owns two tx
 *  boundaries; sets the staff GUC itself). Emits no event. */
export type PublishReview = (
  input: PublishReviewInput,
  ctx: ReviewStaffContext,
  deps: PublishReviewDeps,
  client?: PrismaClient,
) => Promise<PublishReviewOutcome>;

/** `trust.remove_review.v1` (Doc-4G §G8.3) — staff hide a review (soft-delete, SD=YES). MUST run inside a
 *  staff-scoped tx. Emits no event; no Path-B. */
export type RemoveReview = (
  input: RemoveReviewInput,
  ctx: ReviewStaffContext,
  deps: SubmitReviewDeps,
  db?: DbExecutor,
) => Promise<RemoveReviewOutcome>;

/** `trust.get_review.v1` (Doc-4G §G8.5) — read one PUBLISHED review (public projection; not audited). */
export type GetReview = (input: GetReviewInput, db?: DbExecutor) => Promise<GetReviewOutcome>;

/** `trust.list_reviews.v1` (Doc-4G §G8.5) — list a vendor's PUBLISHED reviews (public projection; not audited). */
export type ListReviews = (input: ListReviewsInput, db?: DbExecutor) => Promise<ListReviewsOutcome>;

/** Concrete `trust.submit_review.v1` facade (M5 contracts → M5 application command). */
export const submitReview: SubmitReview = (input, ctx, deps, db) =>
  submitReviewCommand(input, ctx, deps, db);

/** Concrete `trust.moderate_review.v1` facade. */
export const moderateReview: ModerateReview = (input, ctx, deps, db) =>
  moderateReviewService(input, ctx, deps, db);

/** Concrete `trust.publish_review.v1` facade (two-step publish). */
export const publishReview: PublishReview = (input, ctx, deps, client) =>
  publishReviewService(input, ctx, deps, client);

/** Concrete `trust.remove_review.v1` facade. */
export const removeReview: RemoveReview = (input, ctx, deps, db) =>
  removeReviewService(input, ctx, deps, db);

/** Concrete `trust.get_review.v1` facade (M5 contracts → M5 read service). */
export const getReview: GetReview = (input, db) => getReviewService(input, db);

/** Concrete `trust.list_reviews.v1` facade. */
export const listReviews: ListReviews = (input, db) => listReviewsService(input, db);

// ── W3-TRUST-5b — the BC-TRUST-5 (Part B) Admin Rating facades (Doc-4G §G8.4/§G8.5) ─────────────────────
// The PUBLIC, contracts-only faces over the private M5 Admin Rating service. A SEPARATE authority from the
// Public Review (Doc-4G §H.9a — "never merged"). Admin ratings are STAFF-INTERNAL: never public, never
// tenant-visible, never exposed externally (F4G-PB5-M3 / Doc-4A §7.5) — the table has ONLY the
// `admin_ratings_staff FOR ALL` RLS policy (NO public/author/tenant), so a non-staff caller sees ZERO rows and
// the DEFERRED comp-edge collapses to NOT_FOUND (never AUTHORIZATION). This is an IN-BAND AUDITED-WRITE
// aggregate: `set_admin_rating` writes `admin_ratings` + appends ONE `[ESC-TRUST-AUDIT]` `admin_rating_set`
// audit atomically (Doc-2 §9 693/694 enumerate no admin-rating action → nearest §9 Trust action by pointer);
// NO event (Doc-4G §H.7 — Doc-2 §8 has none); NO SD (Doc-6G §3.5.1); firewall (mutates no score/verification/
// fraud/tier; no ban). The per-vendor SINGLETON is app-enforced (advisory-xact-lock; the frozen §3.5.1 DDL has
// NO UNIQUE(vendor_profile_id)). The Admin HTTP wiring + the `staff_can_verify`/`staff_super_admin`
// comp-edge authz + the DG-2 vendor resolution are DEFERRED (the WP2 precedent) — these are the functions they
// will call, invoked directly by tests. **No delete op (no delete contract in scope).** The M0
// `appendAuditRecord` is INJECTED by contract TYPE (NO `writeOutboxEvent`). set MUST run inside a staff-scoped
// tx (`app.is_platform_staff = true`).

// The Doc-2 §7 staff AUTHZ slugs (bound by pointer) — surfaced so the DEFERRED comp-edge references ONE source.
export {
  STAFF_CAN_VERIFY_SLUG as ADMIN_RATING_STAFF_CAN_VERIFY_SLUG,
  STAFF_SUPER_ADMIN_SLUG as ADMIN_RATING_STAFF_SUPER_ADMIN_SLUG,
} from "../domain/admin-rating.constants";

// The re-exported Admin Rating DTOs so the DEFERRED Admin command / comp-edge (and consumers) build them via
// `@/modules/trust/contracts`. NO event export (BC-TRUST-5 emits none).
export type {
  SetAdminRatingInput,
  AdminRatingStaffContext,
  SetAdminRatingDeps,
  SetAdminRatingResult,
  SetAdminRatingError,
  SetAdminRatingOutcome,
  AdminRatingOperation,
  ListAdminRatingsInput,
  ListAdminRatingsOutcome,
  ListAdminRatingsResult,
  AdminRatingView,
  AdminRatingReadError,
} from "./types";

/** `trust.set_admin_rating.v1` (Doc-4G §G8.4) — staff create-or-update the vendor's singleton admin rating.
 *  MUST run inside a staff-scoped tx (`app.is_platform_staff = true`). Emits no event. */
export type SetAdminRating = (
  input: SetAdminRatingInput,
  ctx: AdminRatingStaffContext,
  deps: SetAdminRatingDeps,
  db?: DbExecutor,
) => Promise<SetAdminRatingOutcome>;

/** `trust.list_admin_ratings.v1` (Doc-4G §G8.5) — staff-only read of the vendor's admin ratings (not audited;
 *  a non-staff/no-GUC caller sees an empty page — the non-disclosure posture). */
export type ListAdminRatings = (
  input: ListAdminRatingsInput,
  db?: DbExecutor,
) => Promise<ListAdminRatingsOutcome>;

/** Concrete `trust.set_admin_rating.v1` facade (M5 contracts → M5 service). */
export const setAdminRating: SetAdminRating = (input, ctx, deps, db) =>
  setAdminRatingService(input, ctx, deps, db);

/** Concrete `trust.list_admin_ratings.v1` facade. */
export const listAdminRatings: ListAdminRatings = (input, db) => listAdminRatingsService(input, db);
