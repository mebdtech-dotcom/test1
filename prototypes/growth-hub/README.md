# Growth Hub — Clickable Prototype (Stage-3)

**NON-AUTHORITATIVE design artifact.** Coins nothing; every contract, state, slug, and rule shown is
bound by pointer to the **folded Growth Hub 10-patch set** (Board resolution 2026-07-19 —
`governanceReviews/GrowthHub_P0_Additive_Patch_Set_PROPOSAL_v1.0.md`; corpus copies in
`generatedDocs/`, Authority Map §3 set row). Seed data is illustrative and labeled.

## Run

```bash
npm run prototype growth-hub        # → http://localhost:8080
```

## What it demonstrates (the folded spec, faithfully)

1. **Growth Hub** (`/account/rewards`, Doc-7E v1.0.1 §2(a)) — navy hero, **"Invite a business"** CTA,
   wired stat band (`get_reward_balance` + `list_referrals` sample values), filterable referral
   history (frozen `pending → qualified → rewarded`, opaque org refs), and the **honestly-deferred
   funnel**: Sent/Accepted/Registered render as flagged placeholders — no wired read exists
   (`[ESC-7-API]`), so no figures are fabricated.
2. **Invite flow** (Doc-5C row 36 / Doc-4C §C13) — campaign pinned to the static `referral` key (no
   enumeration; no registry read exists); `recipient_type` picker with the §C13 presence rule
   (targeted → recipient required; open `link`/`qr` → the field is not collected at all).
3. **Token-once modal** (GI-2) — the raw link shown exactly once with copy affordance and the
   "you won't see this again" notice; closing it permanently masks the token (only the hash persists);
   QR rendered client-side from the one response for `qr`.
4. **Token landing — valid** (`(public)`, Doc-5C row 37) — campaign framing, **anonymous referrer**
   (Q-4 default), signup CTA into the ER1 flow; the token rides the registration flow state.
5. **Token landing — invalid** — the **one uniform message** (anti-oracle: unknown/expired/revoked are
   indistinguishable).
6. **Post-signup explainer** — attribution binds inside `provisionIdentity` (GI-1 atomic guard →
   conversion `registered` → `InvitationConverted` → M7 referral `pending`); registration never fails
   on token grounds.

Toggle **governance notes** in the top bar to show/hide the per-screen binding annotations.

## Status

Stage-3 artifact awaiting live Stage-4 visual review. Not production code; the production surface
lands via the authorized P1 M1 implementation.
