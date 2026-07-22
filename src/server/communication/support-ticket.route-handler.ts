// App-layer COMPOSITION for the BC-COMM-4 Support-Ticket caller-facing surface (W3-COMM-1;
// REPOSITORY_STRUCTURE §5/§8 — `src/server` wires Supabase Auth ↔ active-org / staff context ↔ M6
// contracts). This is where the M0 `appendAuditRecord` concrete is INJECTED into the M6 commands (the
// boundary-legal wiring — M6 depends only on the M0 contract TYPE), and where the TWO-SIDED actor
// (Doc-5H §7.3) is resolved:
//
//   • USER leg (`can_raise_support_ticket`, own active org): `withActiveOrg` sets the RLS GUCs; the
//     slug is gated via `check_permission` (`src/server/authz` — the SOLE authority, no shadow authz);
//     the audit runs under the tenant-user leg (`actor_type='user'`, org = active org).
//   • ADMIN (Support Staff) leg (`staff_can_support`, no active org — Doc-4A §5.6): the server-derived
//     platform-staff basis via the injectable `resolveStaffContext` port (PRODUCTION default = the DC-3
//     FAIL-CLOSED resolver — no staff roster exists, so the Admin surface is live-but-unreachable in
//     prod; tests inject a staff context to exercise it). `withStaffContext` sets
//     `app.is_platform_staff = true`; the audit runs under the staff leg (`actor_type='admin'`).
//
// `create_ticket` is USER-ONLY (Admin authority = n/a — Doc-5H §7.3). The other three mutations + two
// reads are two-sided. Every mutation is idempotent (Doc-5H §7.5 — the M6 §B.6 dedup wrap). Reads are
// unaudited and RLS-scoped (User own-org / Staff all); out-of-scope collapses to NOT_FOUND (R10).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveStaffContext, withActiveOrg, withStaffContext } from "@/server/context";
import type { ResolveStaffContext } from "@/server/context";
import { authorize } from "@/server/authz";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  addTicketMessage,
  CAN_RAISE_SUPPORT_TICKET_SLUG,
  closeTicket,
  createTicket,
  getTicket,
  listTickets,
  mapAddTicketMessage,
  mapCloseTicket,
  mapCreateTicket,
  mapGetTicket,
  mapListTickets,
  mapUpdateTicket,
  STAFF_CAN_SUPPORT_SLUG,
  SupportTicketErrorCode,
  updateTicket,
  type AddTicketMessageInput,
  type AddTicketMessageResult,
  type CloseTicketInput,
  type CloseTicketResult,
  type CreateTicketInput,
  type CreateTicketResult,
  type ListTicketsInput,
  type ListTicketsResult,
  type SupportTicketActorContext,
  type TicketView,
  type UpdateTicketInput,
  type UpdateTicketResult,
} from "@/modules/communication/contracts";
import { authChallengeResponse, errorResponse, type WireResponse } from "@/shared/http";
import type { DbExecutor } from "@/shared/db";
import {
  claimStoredReplay,
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  releaseStoredClaim,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

// ─────────────────────────────────────────────────────────────────────────────
// [ESC-COMM-STAFF-AUTHZ] — the staff-support authority gate (Doc-5H §7.3: "Admin acts via
// `staff_can_support`; check_permission sole authority; no shadow path"). ADVISORY-UNTIL-DC-3, faithfully
// mirroring the ratified identity DC-3 posture (`set-user-account-status.route-handler.ts`): the staff
// BASIS is `resolveStaffContext` (Doc-5C §3.2 actor-type determination), and the platform's
// `check_permission` CANNOT yet resolve staff-SPACE slugs (the staff-space firewall denies them through
// org roles — RV-0147 B8), so the required-slug check is OBSERVED, never the decision source. The hook
// references `STAFF_CAN_SUPPORT_SLUG` as LIVE code (not a dead export) and is injectable so the required
// slug is asserted in tests.
//
// ⚠ DC-3 WP MAINTAINER WARNING: when the DC-3 staff roster + staff-space slug resolution land, replace
// ONLY the default hook below to HARD-GATE on `staff_can_support` — a resolved platform-staff principal
// WITHOUT `staff_can_support` (e.g. a `staff_can_verify`-only Verification Admin) MUST then be denied
// this support surface. Do NOT gate on org-context `check_permission` here (the staff space is §3.2
// actor-type determination, never an org-role resolution — an org-role path would be fail-open risk).
// ─────────────────────────────────────────────────────────────────────────────

/** The advisory staff-support authority check ([ESC-COMM-STAFF-AUTHZ]). Observed, NOT the decision
 *  source, until the DC-3 roster lands (see the warning above). Injectable for test assertion. */
export type StaffSupportAuthorityCheck = (input: {
  staffUserId: string;
  requiredSlug: string;
}) => Promise<void>;

/** The default advisory hook — a NO-OP (the staff BASIS is `resolveStaffContext` until DC-3; the
 *  production `resolveStaffContext` resolves no principal, so the staff surface is unreachable in prod). */
const advisoryStaffSupportAuthority: StaffSupportAuthorityCheck = async () => {};

/** Dependencies for a BC-COMM-4 MUTATION composition. All injectable (defaults bind production wiring). */
export interface SupportTicketMutationDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The server-side staff-principal resolution port (default: the DC-3 FAIL-CLOSED resolver). */
  resolveStaffContext?: ResolveStaffContext;
  /** The advisory `staff_can_support` authority hook ([ESC-COMM-STAFF-AUTHZ]; default: no-op). */
  staffSupportAuthority?: StaffSupportAuthorityCheck;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`; routes pass string|null). */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Dependencies for a BC-COMM-4 READ composition (no idempotency — reads are side-effect-free). */
export interface SupportTicketReadDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  resolveStaffContext?: ResolveStaffContext;
  /** The advisory `staff_can_support` authority hook ([ESC-COMM-STAFF-AUTHZ]; default: no-op). */
  staffSupportAuthority?: StaffSupportAuthorityCheck;
}

/**
 * The advisory staff-support authority gate ([ESC-COMM-STAFF-AUTHZ]; see the warning block). Invoked on
 * the staff leg, referencing `STAFF_CAN_SUPPORT_SLUG` as the required authority. OBSERVED, not gated,
 * until the DC-3 roster hard-gates it. Kept in one place so both the mutation + read staff legs honor it.
 */
async function assertStaffSupportAuthority(
  staff: { userId: string },
  hook: StaffSupportAuthorityCheck | undefined,
): Promise<void> {
  await (hook ?? advisoryStaffSupportAuthority)({
    staffUserId: staff.userId,
    requiredSlug: STAFF_CAN_SUPPORT_SLUG,
  });
}

/** SYNTAX 400 for a missing/over-bound `Idempotency-Key` (Doc-5H §7.5 mandatory header). */
function missingKey(): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: SupportTicketErrorCode.INVALID_INPUT,
    message: "Idempotency-Key header is required.",
    retryable: false,
  });
}

/** AUTHORIZATION 403 — the caller does not hold `can_raise_support_ticket` (Doc-4H Stage 3 AUTHZ). */
function forbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: SupportTicketErrorCode.FORBIDDEN,
    message: "Not permitted to act on support tickets.",
    retryable: false,
  });
}

/**
 * The §B.6 idempotent-execution core (Doc-5A §9.3 / Doc-4A §14.3), on the composition's tx: replay
 * lookup → claim → run → persist-on-success / release-on-error. The claim is the single-execution guard
 * for the create/append legs (no CAS); update/close claim uniformly (their CAS is a second guard).
 */
async function runIdempotent<TOutcome, TResult>(
  scope: ReturnType<typeof dedupScope>,
  tx: DbExecutor,
  run: () => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
): Promise<WireResponse<TResult>> {
  const replay = await findStoredReplay<TResult>(scope, tx);
  if (replay !== null) return replay;

  const claim = await claimStoredReplay(scope, tx);
  if (claim === "lost") {
    const winner = await findStoredReplay<TResult>(scope, tx);
    if (winner !== null) return winner;
    // Unreachable by construction (pending rows never commit); fail CLOSED per Doc-4A §14.3.
    throw new Error(
      "command-dedup: claim lost but no stored record resolved (failing closed per Doc-4A §14.3).",
    );
  }

  const outcome = await run();
  const wire = mapper(outcome);
  if (isOk(outcome)) {
    await persistWireReplay(scope, wire, tx);
  } else {
    await releaseStoredClaim(scope, tx);
  }
  return wire;
}

/**
 * The two-sided mutation composition (update / add_ticket_message / close): staff leg via
 * `withStaffContext`, user leg via `withActiveOrg` + the `can_raise_support_ticket` gate. `runCommand`
 * binds the input + command; `mapper`/`isOk` are the contract's wire face.
 */
async function handleTwoSidedMutation<TOutcome, TResult>(
  contractId: string,
  runCommand: (ctx: SupportTicketActorContext, tx: DbExecutor) => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
  deps: SupportTicketMutationDeps,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();

  if (deps.idempotencyKey === null) return missingKey();
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  // ── ADMIN (Support Staff) leg — the server-derived platform-staff basis (never client-asserted). ──
  const staff = await (deps.resolveStaffContext ?? resolveStaffContext)(session);
  if (staff !== null) {
    // [ESC-COMM-STAFF-AUTHZ] advisory `staff_can_support` gate (observed, not gated until DC-3).
    await assertStaffSupportAuthority(staff, deps.staffSupportAuthority);
    return withStaffContext(staff.userId, (tx) =>
      runIdempotent(
        dedupScope(contractId, staff.userId, null, key ?? ""),
        tx,
        () =>
          runCommand(
            {
              actorType: "admin",
              userId: staff.userId,
              ipAddress: deps.ipAddress ?? null,
              userAgent: deps.userAgent ?? null,
            },
            tx,
          ),
        mapper,
        isOk,
      ),
    );
  }

  // ── USER leg — own active org + the `can_raise_support_ticket` slug gate (check_permission). ──
  const ran = await withActiveOrg(session, async (tx, context) => {
    const decision = await authorize(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_RAISE_SUPPORT_TICKET_SLUG,
      },
      undefined,
      tx,
    );
    if (decision.decision === "deny") return forbidden();

    return runIdempotent(
      dedupScope(contractId, context.userId, context.activeOrgId, key ?? ""),
      tx,
      () =>
        runCommand(
          {
            actorType: "user",
            userId: context.userId,
            activeOrgId: context.activeOrgId,
            ipAddress: deps.ipAddress ?? null,
            userAgent: deps.userAgent ?? null,
          },
          tx,
        ),
      mapper,
      isOk,
    );
  });

  if (!ran.resolved) return mapper(null); // §6.6 collapse (no user / no active membership) → 404.
  return ran.value;
}

/**
 * The two-sided read composition (get / list): staff leg via `withStaffContext`, user leg via
 * `withActiveOrg` + the `can_raise_support_ticket` gate. RLS scopes the read (User own-org / Staff all);
 * out-of-scope collapses to NOT_FOUND inside `runQuery`/`mapper` (R10). Reads are unaudited.
 */
async function handleTwoSidedRead<TQueryResult, TResult>(
  runQuery: (scopeOrgId: string | null, tx: DbExecutor) => Promise<TQueryResult>,
  mapper: (result: TQueryResult | null) => WireResponse<TResult>,
  deps: SupportTicketReadDeps,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();

  await deps.ensureProvisioned(session);

  // Staff leg → `null` scope (all tickets); User leg → own active org (the app-layer scope gate).
  const staff = await (deps.resolveStaffContext ?? resolveStaffContext)(session);
  if (staff !== null) {
    // [ESC-COMM-STAFF-AUTHZ] advisory `staff_can_support` gate (observed, not gated until DC-3).
    await assertStaffSupportAuthority(staff, deps.staffSupportAuthority);
    return withStaffContext(staff.userId, async (tx) => mapper(await runQuery(null, tx)));
  }

  const ran = await withActiveOrg(session, async (tx, context) => {
    const decision = await authorize(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_RAISE_SUPPORT_TICKET_SLUG,
      },
      undefined,
      tx,
    );
    if (decision.decision === "deny") return forbidden();
    return mapper(await runQuery(context.activeOrgId, tx));
  });

  if (!ran.resolved) return mapper(null); // §6.6 collapse → the mapper's non-disclosure default.
  return ran.value;
}

// ─────────────────────────────────────────────────────────────────────────────
// The six caller-facing HTTP faces (Doc-5H §7.1).
// ─────────────────────────────────────────────────────────────────────────────

/** `POST /communication/tickets` — `comm.create_ticket.v1` (USER-ONLY; 201 + Location). */
export async function handleCreateTicket(
  input: CreateTicketInput,
  deps: SupportTicketMutationDeps,
): Promise<WireResponse<CreateTicketResult>> {
  const session = await deps.resolveSession();
  if (session === null) return authChallengeResponse();

  if (deps.idempotencyKey === null) return missingKey();
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const decision = await authorize(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_RAISE_SUPPORT_TICKET_SLUG,
      },
      undefined,
      tx,
    );
    if (decision.decision === "deny") return forbidden();

    return runIdempotent(
      dedupScope("comm.create_ticket.v1", context.userId, context.activeOrgId, key ?? ""),
      tx,
      () =>
        createTicket(
          input,
          {
            actorType: "user",
            userId: context.userId,
            activeOrgId: context.activeOrgId,
            ipAddress: deps.ipAddress ?? null,
            userAgent: deps.userAgent ?? null,
          },
          { appendAuditRecord },
          tx,
        ),
      mapCreateTicket,
      (o) => o.ok,
    );
  });

  if (!ran.resolved) return mapCreateTicket(null); // no active org → 404 collapse.
  return ran.value;
}

/** `POST /communication/tickets/{id}/update_ticket` — `comm.update_ticket.v1` (User/Admin; 200). */
export async function handleUpdateTicket(
  input: UpdateTicketInput,
  deps: SupportTicketMutationDeps,
): Promise<WireResponse<UpdateTicketResult>> {
  return handleTwoSidedMutation(
    "comm.update_ticket.v1",
    (ctx, tx) => updateTicket(input, ctx, { appendAuditRecord }, tx),
    mapUpdateTicket,
    (o) => o.ok,
    deps,
  );
}

/** `POST /communication/tickets/{id}/ticket-messages` — `comm.add_ticket_message.v1` (User/Admin; 201). */
export async function handleAddTicketMessage(
  input: AddTicketMessageInput,
  deps: SupportTicketMutationDeps,
): Promise<WireResponse<AddTicketMessageResult>> {
  return handleTwoSidedMutation(
    "comm.add_ticket_message.v1",
    (ctx, tx) => addTicketMessage(input, ctx, { appendAuditRecord }, tx),
    mapAddTicketMessage,
    (o) => o.ok,
    deps,
  );
}

/** `POST /communication/tickets/{id}/close_ticket` — `comm.close_ticket.v1` (User/Admin; 200). */
export async function handleCloseTicket(
  input: CloseTicketInput,
  deps: SupportTicketMutationDeps,
): Promise<WireResponse<CloseTicketResult>> {
  return handleTwoSidedMutation(
    "comm.close_ticket.v1",
    (ctx, tx) => closeTicket(input, ctx, { appendAuditRecord }, tx),
    mapCloseTicket,
    (o) => o.ok,
    deps,
  );
}

/** `GET /communication/tickets/{id}` — `comm.get_ticket.v1` (User/Admin; 200/404). */
export async function handleGetTicket(
  ticketId: string,
  deps: SupportTicketReadDeps,
): Promise<WireResponse<TicketView>> {
  return handleTwoSidedRead(
    (scopeOrgId, tx) => getTicket(ticketId, scopeOrgId, tx),
    mapGetTicket,
    deps,
  );
}

/** `GET /communication/tickets` — `comm.list_tickets.v1` (User/Admin; 200). */
export async function handleListTickets(
  input: ListTicketsInput,
  deps: SupportTicketReadDeps,
): Promise<WireResponse<ListTicketsResult>> {
  return handleTwoSidedRead(
    (scopeOrgId, tx) => listTickets(input, scopeOrgId, tx),
    mapListTickets,
    deps,
  );
}
