> **✅ STATUS: APPROVED (Board resolution 2026-07-19) + FOLDED into the corpus.**
> Corpus copy `generatedDocs/Doc-7E_GrowthHub_Patch_v1.0.2.md`, registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`,
> carried **alongside** its unedited frozen base document(s) — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-7E_GrowthHub_Patch_v1.0.2_PROPOSAL.md` (the authoring + per-patch
> Review-A/Review-B/fix-verification record).
>
> **Atomic linked set:** one of the **10 Growth Hub patches folded together** under
> `GrowthHub_P0_Additive_Patch_Set` v1.4. Board resolution: Growth Hub Architecture = **FROZEN** ·
> P0 Additive Patch Set = **APPROVED** · 10 linked additive patches = **FOLDED** · Implementation =
> **AUTHORIZED**. Final-Gate Set Integrity Audit (3 lanes, 7 scopes): **BLOCKER 0 · MAJOR 0 ·
> MINOR 0 · Dangling Reference 0**.

# Doc-7E — Additive Patch v1.0.2 (Growth Hub Surface) — Account & Identity Shell

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive; carried alongside `Doc-7E_SERIES_FROZEN_v1.0` (Structure + Content Pass1/Pass2 + their pre-freeze pass-level patches) **without editing them in place**. |
| **Version note** | This is the first **series-level** additive patch on the frozen Doc-7E v1.0, producing Doc-7E **v1.0.2**. `v1.0.1` is deliberately **not** used: `main` already carries two `Doc-7E_Content_Pass{1,2}_Patch_v1.0.1` files (pre-freeze components of v1.0, applied inside the frozen effective set), so a third `Doc-7E … v1.0.1` label would be ambiguous. Owner-ruled 2026-07-23 per **Amendment A-1** of `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md` — a target is unavailable if the label is already in visible use for that document, even in a different (pre-freeze) namespace. `v1.0.2` verified free on `main`. |
| **Date** | 2026-07-19 · **Kind** Additive — extends the **ER6 Rewards row** (§5.1) with the Growth Hub bindings, adds the **token-landing surface** (the ER1/ER3 `(public)`→`(auth)`→`(app)` span), and pins the funnel/authz/hygiene rules. **Renders only wired reads** — the invitation-side funnel carries an explicit `[ESC-7-API]`-class gap flag, never a fabricated tile. Coins **no** contract, route convention, slug, state, or design primitive. |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) **§B8** (the surface mandate: Growth Hub at `/account/rewards` · CTA "Invite a business" · funnel re-mapped to the two-entity states · token-landing = a `(public)`/`(auth)` surface · slug-gating = UX over server enforcement) + §A.2 (the funnel re-map); `Doc-5C_…v1.0.1` (wire rows 36/37 + the §6 missing-read seam); frozen Doc-7E ER1–ER10 (notably ER1 signup-creates-no-user, ER3 invitation-flow span, ER8/§7.2 authz-UX rule); Doc-7B kit + the motion standard by pointer; Q-4 (default-anonymous, open). |
| **Depends on** | `Doc-5C_…v1.0.1` (the wire — **review-clean upstream**) · `Doc-4C_…v1.0.3` (§PROV-EXT — attribution at provisioning) · `Doc-2_Patch_v1.0.11` (states) · `Doc-3_…v1.12_GrowthHub` (keys, by effect). **Atomic fold.** |

---

## §1 — §5.1 binding-row extension (ER6; the frozen binding-by-actor-leg table format)

The frozen row — *"| **Rewards / referrals** | `get_reward_balance`, `list_referrals` (BC-BILL-6) |
own-org reads |"* — reads effectively as:

| View family | Bound contracts | Actor leg |
|---|---|---|
| **Growth Hub (Rewards / referrals)** | `get_reward_balance`, `list_referrals` (BC-BILL-6 — frozen, unchanged) **+ `identity.create_invitation.v1`** (`Doc-5C_…v1.0.1` row 36) | own-org reads + **user-initiated command** (slug `can_manage_growth_invites` — §3 gating) |
| **Token landing** *(new — §2)* | `identity.resolve_invitation_token.v1` (`Doc-5C_…v1.0.1` row 37; **server-side call from the landing surface**) | **Public** (anonymous invitee) |

`resolve_invitation_delivery_payload` is **out-of-wire/M6-only** — no frontend binding exists or may be
added. The **attribution bind has no frontend contract**: it rides `provisionIdentity` (§PROV-EXT) when
registration completes — the frontend's whole obligation is to **carry the token through the
registration flow** (§2), never to call an attribution API.

## §2 — The two surfaces

**(a) Growth Hub at `/account/rewards` (the §B8 mandate; `(app)`, org-scoped).** The existing rewards
view evolves: **CTA "Invite a business"** (supersedes the presentation-era "Refer an organization"
affordance) opens the create-invitation flow — **campaign MVP realization (Review-A MINOR-2): the flow submits the
corpus-grounded static `referral` key; NO campaign enumeration is rendered** (no wired read over the
registry exists — the enumeration read joins the §5 `[ESC-7-API]` future-read seam; the server-side
REFERENCE stage backstops every submission); `recipient_type` choice (targeted email/sms/whatsapp → the
recipient field, **required**; open link/qr → **no recipient field collected and none submitted — the
§C13 rule makes it *forbidden***, never an empty string). **Token-once UX (GI-2, binding):** the `201` response's
raw `token`/link is displayed **exactly once** with a copy affordance and an explicit "you won't see
this again" notice; **no independent re-read surface exists and the token is never re-displayed after
the once-view** (`Doc-5C` G-2). *(Replay gloss — Review-A MINOR-3 / Review-B F-2, the Doc-5C seam told
identically: an **idempotent replay of the same create** — the stable `Idempotency-Key`, Doc-5A §9.7 —
returns the **same logical response** and MAY be the displayed instance after a timeout/ambiguous
outcome: that is **delivery recovery of the once-view, never an independent re-read**; token-once counts
logical responses, not deliveries.)* For open `link`/`qr` invitations the sharing artifact (URL/QR
render) is generated client-side **from that one response** at display time.

**Funnel (the §A.2 re-map — rendered honestly):**

| Funnel stage | Source | Status in this patch |
|---|---|---|
| Qualified · Rewarded (+ pending referrals) | `list_referrals` states (frozen `pending → qualified → rewarded`) | **wired now** (the frozen ER6 read) |
| Balance | `get_reward_balance` | **wired now** |
| Sent (= invitation `issued`) · Accepted (= conversion `started`) · Registered (= conversion `registered`) | the two M1 entities | **NO wired read exists** (`Doc-5C_…v1.0.1` §6 seam — §C13 coins no list/read over `growth_invitations`/`invitation_conversions`) → **`[ESC-7-API]`-class flag (§5); the tiles are NOT rendered** (no placeholder figures, no fabricated counts — the reference-fidelity rule); they mount only when the future additive Doc-4C+Doc-5C read pair lands |

**(b) Token-landing surface (new; the ER3 `(auth)`-span precedent, extended `(public)`-first).** The
signed invitation URL lands on a **`(public)` route**; the surface calls **row 37 server-side** (the
Doc-7C wired-client posture — the token never enters client-side analytics/logging; G-6 alignment):

- `valid: true` → campaign framing (MVP `referral` copy) + the **signup CTA** into the ER1 `(auth)` flow
  (Supabase Auth; **signup creates no user record** — ER1 verbatim); the **token is carried through the
  registration flow state** so provisioning can bind attribution (§PROV-EXT — invalid/expired at that
  later moment simply never binds; **registration never fails on token grounds**).
- `valid: false` → **one uniform, generic message** ("this invitation link isn't valid") — never which
  of unknown/expired/revoked (the anti-oracle rule carried into UX), **never the referrer's identity**
  (Q-4 default-anonymous — no disclosure surface exists unless Q-4 is ever ruled otherwise).
- An already-authenticated visitor with a valid token: the flow routes per the intent-preserving auth
  ruling (**owner-ruled 2026-07-16 — destination-resume, never payload-replay; NOT yet landed as an
  on-disk corpus artifact** (Review-B F-3) — provenance carried via the §5 flag until the deferred
  Doc-7C/7E returnTo patch documents it); the token still rides the flow state — and attribution can
  bind **only for an authenticated-but-not-yet-provisioned subject** (the sole attribution-bearing case
  — §PROV-EXT binds inside `provisionIdentity` only; an already-provisioned visitor's token never binds
  and is never routed toward `create_organization` — Review-A OBS-1). Realization deferred, flagged in §5.

## §3 — Authz & non-disclosure (ER8; frozen §7.2 verbatim posture)

- **Slug-gating = UX over server enforcement** (§B8; the frozen §7.2 rule): the CTA/flow renders for
  holders of `can_manage_growth_invites` (O/D/M indicative defaults); the M1 app layer authorizes —
  the UI gate is never the enforcement.
- Own-org reads only (ER8): the funnel and balance are the referrer org's; **cross-org → `NOT_FOUND`**
  (the frozen posture). The **referred org never sees** invitation/conversion data (no surface exists).
- **Hygiene (Review-A NIT-1 — no analytics exemption):** the raw token appears in exactly one rendered
  view (the §2 once-notice) and **never in client-side logs or analytics events — including pageview
  autocapture URL fields** (the stack's PostHog `$current_url` records the landing URL, which carries
  the token: **the landing route's URL MUST be redacted/stripped in any client analytics** —
  implementation-binding, the Doc-5C G-6 analog). The only sanctioned token-bearing URL surface is the
  browser's own history of the stamped landing URL itself (history-only carve-out).

## §4 — Presentation lineage (non-normative note)

The presentation-only Growth Hub redesign already built at `app/(app)/account/rewards/` (navy hero +
filterable referral history; sample data, explicitly labeled) is the **visual precursor** of this
surface: on fold + wiring, its CTA label changes to **"Invite a business"** (§B8), its seed data yields
to the wired reads, and its hero stat band renders only the §2 wired tiles. The design system, kit
primitives, and motion standard bind by pointer (Doc-7B; `motion_standard.md`) — nothing visual is
normatively fixed here.

## §5 — Conformance & carried items (ER10 model)

- **Applicable CHK-7 rows (Review-A MINOR-1 / Review-B F-1 — the Doc-7D anonymous-surface precedent):**
  the `(app)` Growth Hub view keeps the frozen ER10 set **unchanged**. The new **`(public)` landing leg**
  is scoped explicitly: **CHK-7-010 N/A** (anonymous — no active-org exists to resolve; the Doc-7D
  "anonymous — no active-org" treatment; an **N/A extension** from the frozen "(app)"-scoping, declared
  here) · **CHK-7-011 APPLIES CTA-scoped** (the signup CTA is UX gating; the server enforces in the
  destination flow) · CHK-7-012 N/A unchanged.
- **Carried flags:**
  - **`[ESC-7-API]` — invitation-side funnel reads + campaign-enumeration read + revoke affordance**
    (the `Doc-5C_…v1.0.1` §6 seam + Final-Gate L3-M1): Sent/Accepted/Registered tiles unmountable, no
    campaign enumeration renderable, and **no revoke control renderable** (the 5.11 `revoke` executor
    contract does not exist in this set) until the additive Doc-4C+Doc-5C follow-up lands. Not
    fold-blocking (the surface renders wired-only; the MVP submits the static `referral` key).
  - **`[ESC-7-API]`-class — authenticated-visitor token flow** (§2(b) third bullet): realization under
    the intent-preserving auth ruling (**owner-ruled 2026-07-16; not yet an on-disk artifact — this flag
    is its provenance carrier until the deferred Doc-7C/7E returnTo patch lands**); implementation scope.
  - **Q-4 (Board, open):** disclosure default = anonymous; any future referrer-identity framing on the
    landing page requires the Q-4 ruling first.
- **Coins nothing:** no contract, route convention (the landing route slug is implementation scope under
  Doc-7C's `(public)` shell), slug, state, event, or design primitive. The funnel labels
  (Sent/Accepted/Registered/Qualified/Rewarded) are **presentation vocabulary** over frozen states
  (the §A.2 re-map) — the Appendix skeleton convention ("names = presentation vocabulary; bound
  contracts frozen").

## §6 — Explicit NOT-changes

ER1–ER10 intact (ER1's signup-creates-no-user posture verbatim; ER3's span precedent extended, not
altered) · no other §5.1 row touched · no state machine change (M7 `pending→qualified→rewarded` +
5.11/5.12 by pointer) · no entitlement/billing surface change (R6/R10/R11 firewalls stand) · no kit or
motion change · `[ESC-IDN-DELEG-EXPIRY]` and every other carried item untouched · atomic fold with the
9 sibling patches.
