# Doc-5C — Additive Patch v1.0.1 (Growth Hub: Invitation Wire Realization) — M1 `identity` API Realization

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive; carried alongside `Doc-5C_SERIES_FROZEN_v1.0` (Structure + Pass1/Pass2) **without editing it in place** — the folded `Doc-5D_PublicProductDetail_Patch_v1.0.1` mechanism (PATCH-5D-PPD-01, the house precedent for adding wire rows incl. a Public rate-limited read). |
| **Patch ID** | **PATCH-5C-GRW-01** · Produces Doc-5C **v1.0.1** (v1.0 + this patch; v1.0.1 free — no prior Doc-5C patch exists). |
| **Date** | 2026-07-19 · **Kind** Additive — **2 caller-facing wire rows** (inventory 35 → **37**) + **1 out-of-wire addition** (7 → **8**; total **partitioned** Doc-4C contracts 42 → **45**) + the R2/R6 effective-reading notes + the §1 stamped-token deviation note. **No REST row for the delivery-payload contract** (packet §B6 — System-internal). Coins no code, slug, event, or audit action (the one path-token deviation is Board-stamped, disclosed in §1). |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.4 + **§B6** (the wire mandate: `POST /identity/growth_invitations` 201 · `GET /identity/growth_invitations/resolve?token=…` 200 Public rate-limited · delivery-payload no-REST-row · attribution rides provisioning · `Cache-Control: no-store`); `Doc-4C_…v1.0.3` §C13 (the contracts realized); Doc-5A §5.2/§5.3/§5.5/§5.7 (wire grammar), §6.2 (error envelope), §7 (actor carriage), **§9 (idempotency header rule)**, Appendix B.1 (`identity` prefix — R3); Doc-4A §18.2/§19; the Doc-5D public-carriage precedent. |
| **Depends on** | `Doc-4C_…v1.0.3` (contracts) · `Doc-3_…v1.12_GrowthHub` (the resolve rate-limit key + the **`identity.growth_invite_dedup_window`** idempotency key + quota/TTL keys — the DC-5-class finalization gate) · `Doc-2_Patch_v1.0.11` · `Doc-6C_…v1.0.4` (persistence). **Atomic fold.** |

All frozen Doc-5C decisions — **R1** out-of-wire boundary · **R2** User-primary/server-validated
active-org · **R3** `identity` prefix · **R4** no token invented · **R5** delegation fencing · **R6** no
event surface — are **preserved and bound by pointer**; R2 and R6 carry the additive effective-reading
notes in §4 (extension/rationale-refresh, no decision changed).

---

## §1 — Inventory rows (appended; new §-group "Growth Invitation Surface"; Doc-5A §5.7 wire modeling)

Same row format as the frozen §2.2–§2.4 tables:

| # | Doc-4C Contract-ID | Actor | Method | Path | Active-Org | Success |
|---|---|---|---|---|---|---|
| 36 | `identity.create_invitation.v1` | User | `POST` | `/identity/growth_invitations` | Y | `201` |
| 37 | `identity.resolve_invitation_token.v1` | Public | `GET` | `/identity/growth_invitations/resolve?token=…` | N (public) | `200` |

- **Path grammar (Doc-5A §5.3; the frozen §2.1 note):** `growth_invitations` = the owning entity table
  (Doc-2 v1.0.11 §1), rendered plural — grammar-conformant. Row 37's `resolve` is a collection-level
  command-name placement (`[/{command-name}]` with `{id}` omitted — the row-29
  `/identity/active_context/switch_active_organization` placement analogue); the token rides the query
  string **as mandated** (see the §3 hygiene note).
- **⚠ Stamped-token deviation note (Review-A MAJOR-2 — both sources cited, neither resolved locally):**
  the frozen §2.1 rule requires command tokens to be the **verbatim** Doc-4C operation name ("no
  shortening") — which would render `…/resolve_invitation_token`; the stamped §B6 literal is
  **`resolve`** — a shortening. This patch renders the **Board-stamped literal** (the stamp supersedes
  for this row; **not a precedent** for any other row) and puts the tension on the fold record: the
  Board either pins the `resolve` literal as a stamped exception or rules §B6's `resolve` as shorthand
  for the verbatim `resolve_invitation_token` segment — the one reading that satisfies both sources.
- **Row 36 carriage (R2):** `Authorization` + server-validated `Iv-Active-Organization` (the referrer =
  the active org); slug `can_manage_growth_invites` enforced app-layer per Doc-4C §C13 — no wire
  assertion of actor/permission (frozen §3 forbidden-input rule).
- **Row 37 carriage (Public — M1's FIRST Public wire actor; the Doc-5D `get_public_product_detail`
  precedent):** **no `Authorization`, no `Iv-Active-Organization`** — anonymous; identical response for
  every caller class. **Unlike** the Doc-5D precedent it is **NOT anonymous-cacheable**:
  **`Cache-Control: no-store`** on every response (packet §B6 — a token-resolution response must never
  enter any cache tier).

## §2 — Response realization (Doc-5A §5.5; top-level `reference_id` per the C-05 convention)

- **Row 36 — `201`** → `{ result: { growth_invitation_id, state /* = issued */, token }, reference_id }`.
  **`token` is returned ONCE, as one logical response** — never re-readable (only `token_hash` persists —
  GI-2; Doc-4C §C13). `Cache-Control: no-store` on this response too — it carries the raw token
  **[realization convention** — §B6 pins `no-store` textually on the resolve leg; extending it to the
  token-bearing create response is protective hardening, Review-A OBS-1**]**.
  Errors from the frozen-patched §C13 register, statuses per Doc-5A §6.2 by pointer:
  `identity_growth_invite_invalid_input` (VALIDATION) · `identity_growth_invite_forbidden`
  (AUTHORIZATION) · `identity_growth_invite_campaign_unknown` (REFERENCE) ·
  `identity_growth_invite_quota_exceeded` (QUOTA). No code coined.
- **Row 36 — idempotency · audit · events (Review-A MAJOR-1 / Review-B F-1/F-2):**
  - **`Idempotency: required`** (Doc-4C §C13) → the **`Idempotency-Key` header is mandatory** (Doc-5A §9;
    the frozen Pass-2 §4.3 house rule); dedup window = **`identity.growth_invite_dedup_window`** `[DC-5]`
    (`Doc-3_…v1.12_GrowthHub` §3A key 1), by pointer — never a literal.
  - **Replay semantics, reconciled with token-once:** a replay within the window returns the **cached
    original response — including the raw `token` — as the same logical single response** (Doc-5A §9.7);
    no duplicate `growth_invitations` row, **no duplicate audit record, no duplicate `InvitationIssued`
    emission**. Token-once (G-2) counts logical responses, not deliveries. *(Reconciliation gloss: the
    idempotency replay store is transaction-scoped **application state within the dedup window** — not
    an HTTP **cache tier** (G-3's term) and not an authoritative persistence surface (GI-2's "only
    `token_hash` persists" refers to the aggregate); the three statements are disjoint by layer.)*
  - **Audit:** audited per Doc-4C §C13 / its §9 audit-token realization (`growth_invitation_created`;
    `new_value` GI-3-restricted), by pointer.
  - **Events:** emits `InvitationIssued` **iff targeted** (Doc-2 v1.0.11 §4 / Doc-4C §C13) via the M0
    outbox — **no wire/webhook surface** (the §4 R6 note); a replay emits none.
  - **`Location` header — expressly waived [realization convention, flagged]:** the frozen §2.5 create
    convention (`201` + `Location`) is **not** realized for row 36 because no
    `GET /identity/growth_invitations/{id}` wire row exists in the stamped set (the §6 missing-read seam)
    — a `Location` target would dangle. If the follow-up invitation-read pair lands (additive
    Doc-4C+Doc-5C), `Location` binds then. On the fold record.
- **Row 37 — `200` always for a well-formed request** → `{ result: { valid, campaign_key? }, reference_id }`
  — `campaign_key` present **iff** `valid = true`; **no `invitation_state`, no referrer identity, no
  recipient facts** (the anti-oracle rule, Doc-4C §C13; uniform timing across unknown/expired/revoked —
  an invalid token is `valid: false`, **never** `404`/error). Malformed request (absent token) →
  `identity_growth_invite_invalid_input` (VALIDATION — **bound by pointer to the resolve register as
  extended at the Doc-4C seam**, Review-A MINOR-1/Review-B F-3: the frozen-patched resolve register
  declared "none in the validation flow" while its SYNTAX stage ("token present") carried no code — a
  latent §C13 gap; the Doc-4C sibling now declares the code on the resolve register **SYNTAX-only**
  (absent/malformed request — never token invalidity, which stays `valid=false`); no code coined — the
  spelling is the existing create-register code reused per §B.5). Rate-limit exceedance → `RATE_LIMITED`
  (retryable; §3). Reads unaudited; no event emitted; idempotency n/a.

## §3 — Rate limiting & token hygiene (Doc-4A §19; §18.2 gate)

- Row 37 binds the registered **`identity.growth_invite_resolve_rate_limit`**
  (`Doc-3_…v1.12_GrowthHub` §3A key 5 — the v1.11 `PublicReadRateLimit` model: the POLICY exists; no
  number committed) — the Doc-5D §1.4 binding pattern. Row 36 throughput rides the standard authenticated
  surface; its **quota** (invitations per org per window) is the Doc-4C §C13 POLICY stage
  (`identity.growth_invite_quota_*`), a business quota — not a wire rate limit; not restated here.
- **Token-in-query hygiene note (OBS, binding on implementation):** the stamped §B6 shape carries the raw
  token in the query string. `Cache-Control: no-store` is bound above; **URL/access-log redaction of the
  `token` parameter is an implementation obligation** — the token is a **bearer credential**
  (secret-minimization posture, the Doc-4A §16.5-family discipline; Doc-4A §7.5 is cited **as analogy
  only, not membership** — its invariant is a closed five-item non-disclosure list, Review-A MINOR-3).
  The signed URL the invitee clicks lands on the **Doc-7E patch's token-landing surface, which then
  calls this endpoint** (the API URL is not the clicked URL — Review-A NIT-1); referrer-leak surface is
  bounded by that landing page. Flagged for the fold record; the wire shape itself is Board-stamped
  (§B6) and not re-opened here.

## §4 — Out-of-wire addition (§7, R1) + the two effective-reading notes

- **§7 gains one contract:** `identity.resolve_invitation_delivery_payload.v1` — **internal-service
  (M6 sole caller)**, 21.3-with-response (`Doc-4C_…v1.0.3` §C13) — the **§C3 internal-service family**
  (the `get_membership` fence precedent): **no wire row exists or may be added** (packet §B6
  "System-internal (no public REST row)"); consumption is in-process/service-lane only. Out-of-wire set
  7 → **8**.
- **Attribution rides provisioning (no wire):** the `provisionIdentity` attribution extension
  (`Doc-4C_…v1.0.3` §PROV-EXT) is an extension of the **out-of-wire provisioning seam** (a WP-1.3 code
  command — Doc-7C §3.2 home), not an M1 REST endpoint; the invite token reaches it via the
  registration flow (the Doc-7E patch's landing surface — the pending sibling), never via a Doc-5C wire
  input. No row; no count change
  beyond the delivery-payload addition.
- **R2 effective-reading note (additive extension, decision unchanged):** the surface remains
  **User-primary**; row 37 adds M1's **first Public wire actor** under the established Doc-5A §7/Doc-5D
  public-carriage model. R2's server-validated active-org rule is untouched (row 37 carries no org
  context at all).
- **R6 effective-reading note (rationale refresh, conclusion unchanged):** R6's rationale ("no `identity`
  domain event" — DC-1) is superseded by `Doc-2_Patch_v1.0.11` §4 (M1's two §8 events). The **conclusion
  stands verbatim**: the events transport via the **M0 outbox → consumers** (Doc-4B; catalog
  `Doc-4J_…v1.0.1`; flow `Doc-4L_…v1.0.1`) — **no Doc-5C wire/webhook surface exists or is added** for
  them. §11 stays N/A.
- **DC-5 note:** the frozen DC-5 gate ("contracts not finalized until Doc-3 §12.2 registration") is
  satisfied for the growth contracts by `Doc-3_…v1.12_GrowthHub` at the atomic fold.

## §5 — Conformance rows carried for Doc-8 (wired at fold time; the Doc-5D Part-4 model)

| # | Check |
|---|---|
| G-1 | **Anti-oracle uniformity:** unknown / expired / revoked tokens → byte-identical `200 { valid: false }` — status, body shape, timing — across every absence cause; never a `404`/error-class leak |
| G-2 | **Token once (caller-facing wire):** the raw `token` appears in exactly one **caller-facing wire** logical response — row 36's `201`, **including its idempotent replay (the cached original = the same logical response)** — and in no log, audit record, or independent re-read surface; only `token_hash` persists. **Sole sanctioned exception:** the out-of-wire A.4(4)/GI-3 `signed_invitation_url` egress to M6 (delivery-only, transient) |
| G-3 | **`no-store` on both rows:** no cache tier ever holds a token-bearing or resolution response |
| G-4 | **Rate-limit binding:** row 37 rejects over-budget calls with `RATE_LIMITED` under `identity.growth_invite_resolve_rate_limit`; row 36 is unaffected by that key |
| G-5 | **No delivery-payload wire:** no HTTP route resolves `resolve_invitation_delivery_payload` (out-of-wire fence holds) |
| G-6 | **Query-token redaction:** access/error logs redact the `token` query parameter (the §3 hygiene obligation) |

## §6 — Explicit NOT-changes

No other inventory row or §3–§7 text touched · R1–R6 decisions intact (two effective-reading notes + one
stamped-token deviation note only) · no error code / slug / event / audit action coined · the §C3
authorization root, System timers, and DC-1 integration legs stay out-of-wire · no webhook · no
pagination surface added (row 36 is a create command; row 37 a single command-read) · counts:
caller-facing 35 → **37**, out-of-wire 7 → **8**, total 42 → **45** — arithmetic = the three §C13
contracts, nothing else.

**Set-level seam recorded for the fold (Review-A OBS-2):** **no referrer-facing funnel read exists in
the stamped set** — §C13 coins no list/read contract over `growth_invitations`/`invitation_conversions`,
so no wire row can exist here (faithful realization). The Doc-7E patch's surface renders **only** wired
reads (reward balance + `list_referrals`, frozen BC-BILL-6) and flags the invitation-side funnel as its
`[ESC-7-API]`-class gap; the remedy, if wanted, is a **future additive Doc-4C + Doc-5C read pair** —
never a coin here. Atomic fold with the 9 sibling patches.
