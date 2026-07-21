// M1 application (PRIVATE) — `identity.resolve_invitation_token.v1` (Doc-4C v1.0.3 §C13; Doc-5C
// v1.0.1 row 37: `GET /identity/growth_invitations/resolve?token=…` · 200 · PUBLIC). P1 Growth
// Hub M1 core slice — M1's FIRST Public contract (the frozen
// `marketplace.get_public_product_detail.v1` public-actor precedent).
//
// SERVICE-ROLE READ (Doc-6C v1.0.4 §5 — the first of the two sanctioned cross-tenant read paths):
// the anonymous caller has NO tenant context, so the resolve runs in its OWN transaction under the
// transaction-local staff-GUC service context (`set_config('app.is_platform_staff','true',true)` —
// the activate-membership/expire-invitations System-transaction idiom; RLS stays ENFORCED and the
// staff leg admits the read). Authorization is the APP LAYER (CHK-6-023): the COLUMN ALLOW-LIST
// below is the binding — the read touches `state`, `expires_at`, `campaign_key` ONLY. Never
// `recipient_identifier`, never `referrer_organization_id`, never `token_hash` itself (GI-3 /
// anti-oracle; Q-4 default-anonymous).
//
// ANTI-ORACLE (Review-B MAJOR-3 — binding): `valid` is true IFF the token resolves to a live
// `issued`, non-expired, non-revoked invitation; EVERY non-live cause (unknown / expired /
// revoked / soft-deleted) collapses uniformly to `valid = false` — NO state disclosure, no
// error-class leak, one indistinguishable shape.
//
// CAPACITY IS NOT VALIDITY [comment mandated by the slice spec]: `max_redemptions` /
// `redemption_count` are deliberately NOT consulted — Doc-4C §C13 defines resolve-validity as
// live `issued`/non-expired/non-revoked ONLY; capacity enforcement is the GI-1 atomic guard's job
// at the redemption seam (`provisionIdentity` §PROV-EXT), never this read's.
//
// Read-only (§22.3): no audit (§17.1), no event; the wire face adds `Cache-Control: no-store`
// (packet §B6 — a token-resolution response never enters any cache tier).

import { createHash } from "node:crypto";
import { prisma } from "../../../../shared/db";
import type {
  ResolveInvitationTokenInput,
  ResolveInvitationTokenResult,
} from "../../contracts/types";

/**
 * Resolve a raw invite token to its public-safe validity framing (Doc-4C v1.0.3 §C13). The token
 * is hashed server-side (only `token_hash` is ever compared — the raw token is never persisted or
 * logged, GI-2/G-6) and resolved on `growth_invitations_token_hash_live_uq`.
 */
export async function resolveInvitationToken(
  input: ResolveInvitationTokenInput,
  db: typeof prisma = prisma,
): Promise<ResolveInvitationTokenResult> {
  const tokenHash = createHash("sha256").update(input.token).digest("hex");

  return db.$transaction(async (tx) => {
    // Service-lane context — transaction-local ONLY (never leaks past this read tx).
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // The GI-3 column allow-list: state + expires_at + campaign_key ONLY (Doc-6C v1.0.4 §5).
    const row = await tx.growthInvitation.findFirst({
      where: { tokenHash, deletedAt: null },
      select: { state: true, expiresAt: true, campaignKey: true },
    });

    if (row !== null && row.state === "issued" && row.expiresAt.getTime() > Date.now()) {
      return { valid: true, campaignKey: row.campaignKey };
    }
    // Uniform non-live collapse (anti-oracle): unknown / expired / revoked → the same shape.
    return { valid: false };
  });
}
