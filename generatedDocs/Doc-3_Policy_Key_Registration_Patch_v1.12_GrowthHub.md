> **✅ STATUS: APPROVED (Board resolution 2026-07-19) + FOLDED into the corpus.**
> Corpus copy `generatedDocs/Doc-3_Policy_Key_Registration_Patch_v1.12_GrowthHub.md`, registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`,
> carried **alongside** its unedited frozen base document(s) — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-3_Policy_Key_Registration_Patch_v1.12_GrowthHub_PROPOSAL.md` (the authoring + per-patch
> Review-A/Review-B/fix-verification record).
>
> **Atomic linked set:** one of the **10 Growth Hub patches folded together** under
> `GrowthHub_P0_Additive_Patch_Set` v1.4. Board resolution: Growth Hub Architecture = **FROZEN** ·
> P0 Additive Patch Set = **APPROVED** · 10 linked additive patches = **FOLDED** · Implementation =
> **AUTHORIZED**. Final-Gate Set Integrity Audit (3 lanes, 7 scopes): **BLOCKER 0 · MAJOR 0 ·
> MINOR 0 · Dangling Reference 0**.

# Doc-3 — POLICY Key Registration Patch v1.12 (Growth Hub: `identity.*` block extension + `billing.*` extension)

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive `Doc-3 §12.2` registration; patches frozen Doc-3 **without editing it in place** (the v1.0–v1.11 channel). |
| **Date** | 2026-07-19 |
| **Type** | **Additive POLICY-key registration** (the same §12.2 channel as `core.*` v1.0 and `rfq.*`…`ai.*` v1.1–v1.8, `identity.*` v1.9, and the v1.10–v1.11 singles). **No semantic / governance-signal / state / event / contract change.** |
| **Version note** | **Reconcile renumber (2026-07-23, D2-09 forward-PR): this patch takes `v1.12`** — the next verified-available version on `main`, whose folded Doc-3 §12.2 chain ends at **v1.11** (`…v1.11_PublicReadRateLimit`). Owner-ruled per **Amendment A-1** of `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md` (sibling version lines: use the next verified-available version on current `main`; never preserve branch-only version gaps). The branch lineage behind the earlier `v1.14` label — a branch-only `v1.12_FairnessShareWindow` plus a pending `v1.13_EvidenceHandling`, **neither on `main` nor carried here** — belongs to other slices; each takes its own next-available number when its slice lands. The packet's `_Identity` filename suffix is dropped — this file registers **both** namespace blocks (the packet's "+ a `billing.*` extension"), so the suffix would misdescribe the scope. **Doc-2 axis:** the Growth Doc-2 sibling is likewise renumbered **v1.0.11 / PATCH-D2-10**. |
| **Registers** | **`identity.*` extension — 7 keys** (5 names verbatim from the Growth Hub packet §A.5 / the `Doc-4C_…v1.0.3` contract bindings; **2 proposed names** for unnamed-but-unconditional bindings — §3.1, Board-confirm) **+ `billing.*` extension — 2 keys** (names verbatim from packet §A.5; values Board-pending on open **Q-6/Q-12**). One file, two namespace blocks — the packet's *"`…GrowthHub_Identity` + a `billing.*` extension (namespace split)"* instruction, kept atomic with the set. |
| **Clears / unblocks** | The `Doc-4C_…v1.0.3` growth-contract POLICY references (finalization per Doc-4A §18.2) · **unblocks `Doc-6C_…v1.0.4` authoring** (its POLICY-read bindings — TTL/dedup/quota reads from `core.system_configuration`, never literals). |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.5; `Doc-3 §12.2` (registration channel); Doc-4A §18.2 (reference form; escalate-never-invent); the v1.9 `identity.*` block precedent (incl. its §3.1 register-the-union-with-Board-confirm model); the v1.11 `public_read_rate_limit` precedent (rate key registered without committing a number). |

---

## §1 — Purpose

The Growth Hub M1 contracts (`Doc-4C_…v1.0.3` §C13) and the invitation entities (`Doc-2_Patch_v1.0.11`
§1 — its `expires_at` binds `identity.growth_invite_token_ttl` by name; the packet §A.1 phrase: "POLICY
TTL") bind tunable dedup/TTL/quota/rate-limit behavior **by POLICY-key reference**, and the M7 reward composition binds its qualification milestone and reward value to Doc-3
POLICY (the Board's founding directive: *milestone = Doc-3 POLICY, never hardcoded*). None of these keys
exists in the effective §12.2 registry (v1.9 registered the 7 pre-growth `identity.*` keys; v1.6 the
`billing.*` block — neither covers growth). Per Doc-4A §18.2 the referencing contracts are not finalized,
and `Doc-6C_…v1.0.4` cannot bind its reads, until registration. This patch registers both extensions
additively.

## §2 — Scope & non-impact (binding)

- **Additive only.** Registers POLICY keys in `Doc-3 §12.2`; edits no frozen document; introduces no
  entity, state, event, slug, audit action, contract, or template.
- **All keys are POLICY** (tunable; changes audited per Doc-3 §12.4) and **none influences any governance
  signal** (Doc-4A §18.3/§4B firewall). The two `billing.*` keys are **commercial loyalty tunables** —
  the reward is promotional points (never money; never procurement standing — moat/Firewall §4;
  `Doc-4I_…v1.0.1` §4).
- **Reference form** (Doc-4A §18.2): `core.system_configuration.<domain>.<key_name>`; stored in
  `core.system_configuration` (**M0-owned** — Doc-6B §3.4). Domain segments: `identity`, `billing`.
- **Start values are proposed defaults** (Board may adjust at the fold) — registration fixes **names +
  types**; values are tunable POLICY thereafter. Exceptions: the rate-limit key commits **no number**
  (the v1.11 model) and the two `billing.*` values are **Board-pending** (open Q-6/Q-12 — registration
  must not pre-empt an open ruling).

## §3A — Registered `identity.*` POLICY keys (extension — 7; the v1.9 block stands untouched)

| # | Key | Category | Value type | Purpose | Referencing contracts / bindings | Proposed start value |
|---|---|---|---|---|---|---|
| 1 | `identity.growth_invite_dedup_window` | Idempotency | duration | `create_invitation` idempotency dedup window | `identity.create_invitation.v1` (Doc-4C §C13) | **24h** (v1.9 house default) |
| 2 | `identity.growth_invite_token_ttl` | Timer | duration | invitation validity — sets `growth_invitations.expires_at` at issue (`Doc-2_Patch_v1.0.11` §1 binds this key **by name**; the packet §A.1 phrase "POLICY TTL"; the GI-1 guard's `expires_at > now()` reads the result) | `create_invitation` (set) · the GI-1 atomic guard + `resolve_invitation_token` liveness (effect) | **30d** |
| 3 | `identity.growth_invite_quota_window` | Quota | duration | invite-quota window per referrer org | `create_invitation` POLICY stage (`identity.growth_invite_quota_*`) | **30d** |
| 4 | `identity.growth_invite_quota_max` | Quota | count (integer) | max invitations per referrer org per quota window | `create_invitation` POLICY stage (`identity_growth_invite_quota_exceeded`) | **100** |
| 5 | `identity.growth_invite_resolve_rate_limit` | API Realization — Throughput Control | rate (composite: integer request-count per duration window) | unauthenticated token-resolve rate limit (Doc-4A §19 block) | `identity.resolve_invitation_token.v1` (Public; the `PublicReadRateLimit` v1.11 precedent) | **no number committed** (v1.11 model — the POLICY exists; the operational value is set via the authorized configuration process) |
| 6 | `identity.growth_invite_delivery_url_ttl` | Timer | duration | TTL of the **short-lived, one-time** `signed_invitation_url` returned to M6 | `identity.resolve_invitation_delivery_payload.v1` (Doc-4C §C13: "the `signed_invitation_url` TTL is **POLICY-bound**") | **15m** |
| 7 | `identity.growth_campaign_registry` | Registry / reference set | json (map: `campaign_key` → `{active: bool, …}`) | the **Q-9 MVP campaign registry** — the registered campaign set `create_invitation` validates against at its REFERENCE stage; a new campaign = a new entry here, **never a schema migration** (Rec-1) | `identity.create_invitation.v1` REFERENCE stage (`identity_growth_invite_campaign_unknown`); **M1 reads + validates; M8 does not own it** (Board MINOR-3) | **`{ "referral": { "active": true } }`** (MVP set — Doc-4C: "M0 config; MVP `referral`") |

### §3.1 — Proposed-name note (flag → Board confirmation at fold; the v1.9 §3.1 model)

Keys **1–5** carry names **verbatim** from the frozen packet §A.5 / the Doc-4C patch's bindings — nothing
coined. Keys **6–7** realize bindings that are **unconditional but unnamed** in their sources: Doc-4C
binds the signed-URL TTL to POLICY without naming a key, and the packet mandates the campaign registry as
M0-config without naming its key. Leaving them unregistered would leave a finalization-blocking dangling
reference (the v1.9 §3.1 rationale: register the union so **no contract reference stays unregistered**);
registering them requires proposing names. **The two names are proposed here and flagged for explicit
Board confirmation at the fold** — if the Board renames either, the Doc-4C/Doc-6C bindings follow the
Board's name (they bind by reference, not by literal). For key 7 the confirmation covers the **value
shape** as well as the name (Review-A OBS-2): it is the inventory's first map-valued key, and the §5
confinement (activation-only MVP; refinements = Q-9-upgrade) is part of what the Board confirms. Key 7
also sits outside the `growth_invite_` name family (Review-B OBS-2 — Doc-4C's "single new domain segment
`growth_invite`" note); the Board may align it (e.g. `identity.growth_invite_campaign_registry`) at the
same confirmation.

## §3B — Registered `billing.*` POLICY keys (extension — 2; the v1.6 block stands untouched)

| # | Key | Category | Value type | Purpose | Referencing surface | Start value |
|---|---|---|---|---|---|---|
| 1 | `billing.referral_qualification_milestone` | Commercial rule | enum/string (milestone identifier) | **which milestone advances a referral `pending → qualified`** (the frozen `advance_referral` drive; the Board's *"milestone = Doc-3 POLICY, never hardcoded"* directive) | frozen `billing.advance_referral.v1` (§HB-6.2); the `[ESC-BILL-POLICY]` channel | **Board-pending — open Q-6.** Registration fixes name + type only; candidate values (verification / subscription / first-RFQ) await the ruling. |
| 2 | `billing.referral_reward_value` | Commercial rule | numeric (reward points) | **the points credited on `qualified → rewarded`** (the frozen `credit_reward` movement) | frozen `billing.credit_reward.v1` (§HB-6.1); the `[ESC-BILL-POLICY]` channel | **Board-pending — open Q-12.** Points only (never currency — money boundary). |

Both keys register under the frozen **`[ESC-BILL-POLICY]`** channel (Doc-4I carried marker — "no key
invented" there; the registration act is exactly this patch). **Marker-status note (Review-A MINOR-1,
fold-confirm):** `Doc-3_…v1.6_Billing` stamps "`[ESC-BILL-POLICY]` → RESOLVED" — that clearance is
**scoped to its Doc-5I page-size/dedup item only** (it registered `billing.idempotency_dedup_window` +
`billing.list_page_size_max`); the Doc-4I Part2:583 enumeration ("reward-value/referral-reward keys")
remains the live referencing channel these two keys register through. The Board confirms the marker
reading at the fold — the `[DC-5]` §4 treatment, applied symmetrically. The M7 System event-create branch itself
carries **no** key (`Doc-4I_…v1.0.1` §1 stage 9); the M6 delivery path coins **none**
(`Doc-4H_…v1.0.1` — the frozen `[ESC-COMM-POLICY]` keys suffice).

## §4 — What this clears / unblocks

- **Doc-4C growth references** (`Doc-4C_…v1.0.3` §C13): dedup / quota / rate-limit / URL-TTL / campaign
  registry references now resolve to registered keys → the three contracts are **finalizable**
  (Doc-4A §18.2).
- **Doc-6C authoring unblocked** (`Doc-6C_…v1.0.4`): its POLICY reads (`expires_at` from the token TTL;
  dedup/quota persistence; the resolve-read paths) bind `core.system_configuration` keys, never literals
  (Doc-6A §10.2).
- **Marker note (fold-confirm, carried from the Doc-4H §6 fold-note):** the Growth set's Doc-4C patch
  labels its POLICY references **`[DC-5]`** — the label of the v1.9-cleared identity wave. This patch
  treats the growth references as a **new registration wave through the same Doc-4C channel**; the Board
  confirms the label reuse (or assigns a fresh marker) at the fold. Nothing turns on the label — the
  references themselves are registered here either way.

## §5 — Not registered here (flagged, not coined)

- **No M7-branch dedup key** — the System event-create branch is idempotent on `event_id`
  (`source_event_id` slot), not a POLICY window (`Doc-4I_…v1.0.1` §1).
- **No M6 delivery keys** — dispatch dedup / retry-backoff ride the frozen `[ESC-COMM-POLICY]` set
  (`Doc-4H_…v1.0.1` §HB-3.6 stage 9).
- **No per-campaign quota/reward overrides** — campaign-scoped rule refinements inside the registry
  value (key 7's map) are a **Q-9-upgrade** concern (M8 first-class registry, Board-gated); the MVP map
  registers activation only. If a campaign-scoped tunable is later needed as its own key, it is a
  follow-up additive patch — not coined here.
- **No open-invitation (link/qr) redemption-cap key** — `max_redemptions` is a per-row column
  (`Doc-2_Patch_v1.0.11` §1), set at issue; a platform default for it, if wanted, is a follow-up patch.
- **The remaining `[ESC-BILL-POLICY]` members stay unregistered** (Review-B OBS-1 — flagged, not coined):
  the frozen §HB-6.2 stage-9 "qualification **window**" flavor, §HB-6.1's "redemption rules"/dedup window,
  and the §HB-5 dunning/payment-retry windows. **This patch does not clear `[ESC-BILL-POLICY]`** — it
  registers the two packet-mandated keys through that channel; the rest remain marker-carried.

## §6 — Governance

All 9 keys are operational/commercial POLICY (Doc-3 §12 / Doc-4A §18.3): tunable, changes audited
(Doc-3 §12.4), **no governance-signal / scoring / firewall impact** (Doc-4A §4B) — a referral reward is
promotional points and never procurement standing (moat; Firewall §4). No module ownership, state, event,
slug, or contract change. Storage + seed realization = `Doc-6C_…v1.0.4` (reading the registered blocks),
store owned by M0 (Doc-6B §3.4). **Q-6 and Q-12 remain open** — this patch registers names + types and
neither pre-empts nor forecloses the Board's value rulings.

---

*Additive Doc-3 §12.2 POLICY-key registration — the Growth Hub `identity.*` extension (7 keys; 5 verbatim
+ 2 proposed-name, §3.1 Board-confirm) + `billing.*` extension (2 keys; values Board-pending Q-6/Q-12).
PROPOSED — atomic fold with the 10-patch Growth Hub set. Reconcile renumber to v1.12 (next verified-available on `main`) per Amendment A-1.
The frozen Doc-3 is not edited in place. Coins nothing beyond the two flagged proposed names; no
governance/state/event/contract change.*
