// M1 application (PRIVATE) — lazy first-login identity provisioning (WP-1.3 [W1-AUTH-001]).
//
// Out-of-band provisioning (Doc-7E §2 / [ESC-7-API-SIGNUP]): signup coins NO `create_user` wire
// contract; the user record + a default Personal Organization + the founding Owner membership are
// materialized here on first authenticated login. This realizes the Doc-4C §C5 `create_organization`
// FROZEN create-flow shape (org + Owner membership + `human_ref` via Module 0) as the lazy
// provisioning mechanism, plus the Solo-Trader Rule (Architecture §5.2 — every user ends with ≥1 org,
// Invariant #5). Orchestration only; M1 OWNS the `identity.*` writes (One Module, One Owner).
//
// ATOMIC + IDEMPOTENT (the load-bearing guarantees):
//   - ONE interactive transaction: user + org + membership all-or-nothing (Doc-4C §C5 "founding
//     Owner membership created in the same transaction"); a mid-bootstrap failure rolls back the
//     whole identity (no partial user/org).
//   - Idempotent on the natural key `auth_user_id`: a second OR concurrent first-login creates
//     nothing. Existence is checked inside the transaction; the concurrent race is closed by the
//     `users_auth_user_id_uq` partial-unique index (Doc-6C §3.1) — a losing concurrent insert
//     surfaces P2002 and is treated as "already provisioned" (re-read, return the existing identity).
//
// RLS-AT-BOOTSTRAP (corpus-faithful — never a bypass): the bootstrap inserts run BEFORE the user has
// an `app.active_org`, and `identity.users` has NO INSERT policy at all (Doc-6C §6.2a) — so these
// inserts cannot satisfy tenant `WITH CHECK (org = active_org OR is_platform_staff)` as a normal user.
// The FROZEN mechanism is the System/platform-staff provisioning context: Doc-6C §6.2a line
// "-- (INSERT at provisioning / DELETE-anonymize = System/staff)" + §2.1 (`app.is_platform_staff`
// gates platform-owned writes; the staff backstop is the satisfiable leg of every org/membership
// WITH CHECK) + Doc-6B §2.2 (the platform-staff RLS backstop). We set the three server-set GUCs
// (§2.1) for this single provisioning transaction: `app.is_platform_staff=true` (System/staff
// bootstrap), `app.user_id` (the just-ensured user), and `app.active_org` (the new org) so the
// membership WITH CHECK is also met by its primary leg. GUCs are set transaction-local
// (`set_config(.,.,true)`) so they never leak past this transaction — RLS is not weakened.

import { createHash } from "node:crypto";
import { Prisma, prisma } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type {
  AllocateHumanReference,
  AppendAuditRecord,
  WriteOutboxEvent,
} from "@/modules/core/contracts";
import { buildUserAuditInput } from "./_audit";
import {
  GrowthInvitationAuditAction,
  INVITATION_CONVERSION_ENTITY_TYPE,
} from "../../domain/audit-actions";
import {
  INVITATION_CONVERTED_EVENT,
  type InvitationConvertedPayload,
} from "../../contracts/events";
import type { ProvisionIdentityInput, ProvisionIdentityResult } from "../../contracts/types";

// The seeded Owner system-bundle role (Doc-6C §5.2 / migration seed): organization_id IS NULL,
// is_system_bundle = true, name = 'Owner'. Bound by its FROZEN seed identity, never coined here.
const OWNER_SYSTEM_BUNDLE_ROLE_NAME = "Owner" as const;

// Entity-type prefix for the org human_ref sequence (Doc-2 §0.1 registry; Doc-4C §C5 — `ORG-…`).
// Owned by Module 0 / Doc-2 §0.1; bound by pointer, never invented.
const ORG_HUMAN_REF_ENTITY_TYPE = "ORG" as const;

/**
 * Derive the Personal Organization name (Architecture §5.2 Solo-Trader Rule).
 *
 * [ESC-W1-USER-PROVISION] — the corpus gives an *example* ("Musa Trading", Architecture §5.2),
 * not a deterministic naming RULE. The personal-org name format is therefore genuinely unspecified.
 * Interim derivation: the email local-part (the only person-identifying token available at first
 * login; display_name may be absent), title-cased, suffixed " Trading" to match the §5.2 example
 * shape. Flagged for a future Doc-4C/Architecture additive that ratifies the naming rule; no
 * business-naming convention is silently invented as final.
 */
function derivePersonalOrgName(email: string | null | undefined): string {
  const localPart = (email ?? "").split("@")[0]?.trim() ?? "";
  if (localPart.length === 0) return "Personal Organization"; // safe non-empty fallback
  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const titled = cleaned
    .split(" ")
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `${titled || "Personal"} Trading`;
}

/**
 * Derive a URL-safe org slug from the human_ref (always unique + live — `organizations_slug_live_uq`,
 * Doc-6C §3.2). The human_ref (`ORG-YYYY-NNNNNN`) is guaranteed unique by Module 0's never-reused
 * sequence (Doc-2 §0.1), so a slug derived from it collides only with a soft-deleted row's slug, which
 * the restore-conflict regeneration rule owns (DC-CR5) — not reachable on a fresh personal-org create.
 */
function deriveOrgSlug(humanRef: string): string {
  return humanRef.toLowerCase();
}

interface ProvisionDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), injected by the
   * contract TYPE (`@/modules/core/contracts`). Dependency-injected — never imported as a concrete
   * cross-module value (the only boundary-legal cross-module call mechanism). Bound into THIS
   * transaction so the ref allocation is atomic with the org create (Doc-4C §C5 "no second ref on
   * replay"; Doc-4B §A7 atomicity).
   */
  allocateHumanReference: AllocateHumanReference;
  /**
   * `core.write_outbox_event.v1` (Doc-4B), injected by the contract TYPE — OPTIONAL (§PROV-EXT,
   * Doc-4C v1.0.3): when present and a valid `referralToken` binds, the attribution appends
   * `InvitationConverted` to the M0 outbox INSIDE this same transaction (Doc-6A §7.1 write+emit).
   * Absent → the bind still commits; the event leg is skipped (compatibility: with no token,
   * provisioning behaves exactly as frozen).
   */
  writeOutboxEvent?: WriteOutboxEvent;
  /**
   * `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE — OPTIONAL
   * (§PROV-EXT, Doc-4C v1.0.3 — Audit: yes, "invitation converted (referral attribution)"): when
   * present and the GI-1 bind lands, ONE User-attributed audit record appends INSIDE this same
   * transaction (D7 atomicity — audit atomic with the conversion write). Absent → the bind still
   * commits; the audit leg is skipped (same optional posture as `writeOutboxEvent`).
   */
  appendAuditRecord?: AppendAuditRecord;
}

/**
 * Provision (lazily, on first login) the identity for an authenticated Supabase user: ensure the
 * `identity.users` record (keyed by `auth_user_id`), a default Personal Organization
 * (`is_personal_org = true`, `human_ref` via Module 0), and the founding Owner membership (active).
 *
 * Idempotent + atomic: a second/concurrent call with the same `auth_user_id` creates nothing and
 * returns the existing identity; any mid-bootstrap failure rolls back entirely.
 *
 * @param input  the authenticated subject — `auth_user_id` (the Supabase `auth.users` id) + email.
 * @param deps   injected Module 0 contract service(s).
 * @param db     optional executor; defaults to the shared client (the command opens its own
 *               interactive transaction internally).
 */
export async function provisionIdentityForAuthUser(
  input: ProvisionIdentityInput,
  deps: ProvisionDeps,
  db: typeof prisma = prisma,
): Promise<ProvisionIdentityResult> {
  const year = new Date().getUTCFullYear(); // server-clock UTC year (Doc-2 §0.1)

  return db.$transaction(async (tx) => {
    // ── Bootstrap RLS context (System/platform-staff — Doc-6C §6.2a / §2.1; Doc-6B §2.2). ──
    // Transaction-local (set_config(.,.,true)) so it never leaks past this provisioning tx.
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // ── (1) Ensure identity.users (idempotent on auth_user_id; no secret column — DC-4). ──
    const existingUser = await tx.user.findFirst({
      where: { authUserId: input.authUserId, deletedAt: null },
    });

    if (existingUser !== null) {
      // Already provisioned — re-read the existing personal org + owner membership and return.
      // (A prior provisioning is the authoritative identity; create nothing.)
      const existingOrg = await tx.organization.findFirst({
        where: {
          isPersonalOrg: true,
          deletedAt: null,
          memberships: { some: { userId: existingUser.id, deletedAt: null } },
        },
      });
      const existingMembership = existingOrg
        ? await tx.membership.findFirst({
            where: { userId: existingUser.id, organizationId: existingOrg.id, deletedAt: null },
          })
        : null;

      return {
        created: false,
        userId: existingUser.id,
        organizationId: existingOrg?.id ?? null,
        organizationHumanRef: existingOrg?.humanRef ?? null,
        ownerMembershipId: existingMembership?.id ?? null,
      };
    }

    const userId = uuidv7(); // M0 ID generator (Doc-4B §8) — never a raw UUID in app code.

    let createdUserId: string;
    try {
      const user = await tx.user.create({
        data: {
          id: userId,
          authUserId: input.authUserId,
          email: input.email ?? null,
          status: "active",
          createdBy: userId, // self-provisioned: the subject is the actor (server-populated)
          updatedBy: userId,
        },
      });
      createdUserId = user.id;
    } catch (e) {
      // Concurrent first-login race: the other tx won the `users_auth_user_id_uq` partial-unique.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const winner = await tx.user.findFirst({
          where: { authUserId: input.authUserId, deletedAt: null },
        });
        if (winner === null) throw e; // not the expected uniqueness collision — surface it
        const winnerOrg = await tx.organization.findFirst({
          where: {
            isPersonalOrg: true,
            deletedAt: null,
            memberships: { some: { userId: winner.id, deletedAt: null } },
          },
        });
        const winnerMembership = winnerOrg
          ? await tx.membership.findFirst({
              where: { userId: winner.id, organizationId: winnerOrg.id, deletedAt: null },
            })
          : null;
        return {
          created: false,
          userId: winner.id,
          organizationId: winnerOrg?.id ?? null,
          organizationHumanRef: winnerOrg?.humanRef ?? null,
          ownerMembershipId: winnerMembership?.id ?? null,
        };
      }
      throw e;
    }

    // Set app.user_id for the rest of the bootstrap (platform-owned write context — §2.1).
    await tx.$executeRaw`SELECT set_config('app.user_id', ${createdUserId}::text, true)`;

    // ── (2) Allocate the org human_ref via the Module 0 contract service (NEVER cross-schema SQL). ──
    // Bound INTO this transaction (tx executor) so allocation is atomic with the org create
    // (Doc-4C §C5 "allocate the ref via Module 0, not locally"; Doc-4B §A7 atomicity).
    const { humanRef } = await deps.allocateHumanReference(
      { entityType: ORG_HUMAN_REF_ENTITY_TYPE, year },
      tx,
    );

    const organizationId = uuidv7();

    // Set app.active_org so the membership INSERT meets its primary WITH CHECK leg (§2.1 / §6.2a).
    await tx.$executeRaw`SELECT set_config('app.active_org', ${organizationId}::text, true)`;

    // ── (3) Ensure the Personal Organization (is_personal_org = true; §5.1 → active). ──
    await tx.organization.create({
      data: {
        id: organizationId,
        humanRef,
        name: derivePersonalOrgName(input.email), // [ESC-W1-USER-PROVISION] derived; see above
        slug: deriveOrgSlug(humanRef),
        orgStatus: "active",
        isPersonalOrg: true,
        verificationLevel: "unverified",
        createdBy: createdUserId,
        updatedBy: createdUserId,
      },
    });

    // ── (4) Resolve the seeded Owner system-bundle role (organization_id IS NULL; §5.2 seed). ──
    const ownerRole = await tx.role.findFirst({
      where: {
        name: OWNER_SYSTEM_BUNDLE_ROLE_NAME,
        organizationId: null,
        isSystemBundle: true,
        deletedAt: null,
      },
    });
    if (ownerRole === null) {
      // The Owner system-bundle seed is a migration invariant (Doc-6C §5.2). Its absence is a
      // conformance/setup failure, not a runtime fabrication — surface it (rolls back the tx).
      throw new Error(
        "provision-identity: Owner system-bundle role seed not found (Doc-6C §5.2) — cannot create founding membership",
      );
    }

    // ── (5) Ensure the founding Owner membership (state = active — Invariant #5; §5.2). ──
    const ownerMembershipId = uuidv7();
    await tx.membership.create({
      data: {
        id: ownerMembershipId,
        organizationId,
        userId: createdUserId,
        roleId: ownerRole.id,
        state: "active",
        joinedAt: new Date(), // set on → active (Doc-6C §3.3)
        createdBy: createdUserId,
        updatedBy: createdUserId,
      },
    });

    // ── (6) §PROV-EXT — referral attribution (Doc-4C v1.0.3 §PROV-EXT; Q-14 / Board MAJOR-2
    //    ruling: the `provisionIdentity` application service OWNS the single transaction;
    //    attribution is an IN-TXN internal step, never a separately-committed command). BEST
    //    EFFORT, fail-open on token grounds: an invalid/exhausted/expired token — or ANY
    //    unexpected attribution failure — never fails registration (§PROV-EXT rule 2: "attribution
    //    does not bind; provisioning still commits"). The GI-1 SQL is transcribed VERBATIM
    //    (Doc-6C v1.0.4 §4); the RLS staff-GUC context set at the top of this tx admits the
    //    cross-tenant growth writes (the Review-B F6 backstop model).
    if (typeof input.referralToken === "string" && input.referralToken.length > 0) {
      // DEP GUARD (fail-closed — L3-MINOR-2): the `InvitationConverted` outbox append AND the
      // `invitation_converted` audit record are UNCONDITIONAL consequences of a GI-1 bind per the
      // folded §PROV-EXT (Doc-4C v1.0.3) — absent either dep, the bind MUST NOT happen (a bind
      // without its event/audit legs would be a silent contract breach). Attribution fail-closed;
      // registration untouched (provisioning proceeds exactly as frozen).
      const writeOutboxEvent = deps.writeOutboxEvent;
      const appendAuditRecord = deps.appendAuditRecord;
      if (writeOutboxEvent === undefined || appendAuditRecord === undefined) {
        console.warn(
          "provision-identity: referral attribution skipped (§PROV-EXT — outbox/audit deps absent; the bind must not happen without its unconditional legs).",
        );
      } else {
        try {
          // SAVEPOINT (L3-MINOR-3 — closes the 25P02 aborted-transaction gap): a DB-level failure
          // inside attribution would otherwise abort the OUTER provisioning transaction, and the
          // catch's swallow could not save the commit. Rolling back TO the savepoint restores a
          // usable tx, so "registration never fails on token grounds" holds against in-tx DB
          // failures too. The one-txn §PROV-EXT ruling is preserved — a savepoint is an internal
          // step of THIS transaction, never a second transaction.
          await tx.$executeRaw`SAVEPOINT prov_ext_attribution`;

          // (a) Hash the token server-side (never client-trusted; only token_hash is compared —
          //     GI-2) and resolve the LIVE invitation. None → skip (no bind).
          const tokenHash = createHash("sha256").update(input.referralToken).digest("hex");
          const invitation = await tx.growthInvitation.findFirst({
            where: { tokenHash, deletedAt: null },
            select: {
              id: true,
              referrerOrganizationId: true,
              campaignKey: true,
              recipientType: true,
            },
          });
          if (invitation !== null) {
            // (b) GI-1 ATOMIC CAPACITY GUARD — the packet §A.7 / Doc-6C v1.0.4 §4 conditional
            //     UPDATE, verbatim. `$executeRaw` returns the affected-row count: 0 rows ⇒
            //     expired/exhausted/revoked (the guard's own predicate) ⇒ attribution does NOT
            //     bind. Same-row lock semantics serialize concurrent redemptions (EvalPlanQual
            //     under READ COMMITTED — the §G verification).
            const bound = await tx.$executeRaw`
              UPDATE identity.growth_invitations
                 SET redemption_count = redemption_count + 1
               WHERE id = ${invitation.id}::uuid AND state = 'issued' AND expires_at > now()
                 AND (max_redemptions IS NULL OR redemption_count < max_redemptions)`;
            if (bound === 1) {
              // (c) The conversion bind — `started → registered` COLLAPSES to ONE insert at
              //     registration (the sole insert path in this set: no persistent `started` row
              //     ever exists — Doc-6C v1.0.4 §7 fold-note; the 5.12 shape CHECK is satisfied:
              //     state/referred_organization_id/registered_at set together). Append-only (Inv #8).
              const conversionId = uuidv7();
              const registeredAt = new Date();
              await tx.invitationConversion.create({
                data: {
                  id: conversionId,
                  growthInvitationId: invitation.id,
                  referrerOrganizationId: invitation.referrerOrganizationId,
                  referredOrganizationId: organizationId,
                  state: "registered",
                  registeredAt,
                  createdBy: createdUserId,
                  updatedBy: createdUserId,
                },
              });

              // (d) `InvitationConverted` → the M0 outbox, SAME tx (Doc-6A §7.1 write+emit; Doc-2
              //     v1.0.10 §4 / Doc-4J v1.0.1 — the six declared snake_case fields; no token, no
              //     recipient identifier — GI-3/§16.5). The downstream M7 referral-create consumes
              //     it under `actor_type=System` (Doc-4I v1.0.1; the Q-15 guard).
              const payload: InvitationConvertedPayload = {
                conversion_id: conversionId,
                growth_invitation_id: invitation.id,
                campaign_key: invitation.campaignKey,
                recipient_type: invitation.recipientType,
                referrer_organization_id: invitation.referrerOrganizationId,
                referred_organization_id: organizationId,
              };
              await writeOutboxEvent(
                {
                  eventName: INVITATION_CONVERTED_EVENT.name,
                  eventVersion: INVITATION_CONVERTED_EVENT.version,
                  aggregateId: invitation.id,
                  payload,
                },
                tx,
              );

              // (d′) The §PROV-EXT attribution AUDIT (Doc-4C v1.0.3 §PROV-EXT — Audit: yes;
              //     Domain Organization "invitation converted (referral attribution)", Doc-2
              //     v1.0.10 §5; wire token = the §9 realization `invitation_converted`). SAME tx —
              //     audit atomic with the conversion write (D7); the staff-GUC context set at the
              //     top of this tx admits the append (the ADR-021 System/bootstrap leg).
              //     User-attributed (the WP-1.3 txn pattern / packet §A.4(3)): the registering
              //     user; `organizationId` = the REFERRER org (the org whose §9 Organization-domain
              //     stream the action extends — the invitation aggregate's owner). The `_audit`
              //     helper fits without contortion — its ctx shape is {userId, ipAddress?,
              //     userAgent?}, and the provisioning seam simply carries no ip/ua (the Doc-2 §9
              //     redaction-aware optionals → null); commented per the wiring directive.
              //     `new_value` = the FROZEN Doc-4C v1.0.3 §9 pin for this token —
              //     {growth_invitation_id, referred_organization_id, state} VERBATIM; it EXCLUDES
              //     `recipient_identifier` (GI-3 — the invitee contact never enters the immutable
              //     ledger). Inside the try/catch: an audit failure must not fail registration
              //     (the §PROV-EXT fail-open rule).
              await appendAuditRecord(
                buildUserAuditInput(
                  { userId: createdUserId },
                  {
                    organizationId: invitation.referrerOrganizationId,
                    entityType: INVITATION_CONVERSION_ENTITY_TYPE,
                    entityId: conversionId,
                    action: GrowthInvitationAuditAction.CONVERTED,
                    oldValue: null,
                    newValue: {
                      growth_invitation_id: invitation.id,
                      referred_organization_id: organizationId,
                      state: "registered",
                    },
                  },
                ),
                tx,
              );
            }
          }

          // Attribution complete (bound or legitimately skipped) — release the savepoint; the
          // outer provisioning transaction proceeds normally.
          await tx.$executeRaw`RELEASE SAVEPOINT prov_ext_attribution`;
        } catch (e) {
          // (e) §PROV-EXT ruling: registration NEVER fails on token/attribution grounds — roll
          //     back TO the savepoint (restoring a usable transaction after a DB-level failure —
          //     the 25P02 gap), swallow, log, and let provisioning commit (a THROWN escape here
          //     would roll back the minted identity, inverting the frozen priority). The
          //     idempotency story is unaffected: a re-provision returns `created:false` before
          //     this block; the append-only conversion + the incremented counter block a second
          //     bind.
          try {
            await tx.$executeRaw`ROLLBACK TO SAVEPOINT prov_ext_attribution`;
          } catch {
            /* session beyond recovery — the outer tx will fail; nothing more to do */
          }
          console.warn(
            "provision-identity: referral attribution skipped (§PROV-EXT — provisioning still commits):",
            e,
          );
        }
      }
    }

    return {
      created: true,
      userId: createdUserId,
      organizationId,
      organizationHumanRef: humanRef,
      ownerMembershipId,
    };
  });
}
