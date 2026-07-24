> **✅ STATUS: APPROVED (Board resolution 2026-07-19) + FOLDED into the corpus.**
> Corpus copy `generatedDocs/Doc-4I_GrowthReferral_Patch_v1.0.1.md`, registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`,
> carried **alongside** its unedited frozen base document(s) — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-4I_GrowthReferral_Patch_v1.0.1_PROPOSAL.md` (the authoring + per-patch
> Review-A/Review-B/fix-verification record).
>
> **Atomic linked set:** one of the **10 Growth Hub patches folded together** under
> `GrowthHub_P0_Additive_Patch_Set` v1.4. Board resolution: Growth Hub Architecture = **FROZEN** ·
> P0 Additive Patch Set = **APPROVED** · 10 linked additive patches = **FOLDED** · Implementation =
> **AUTHORIZED**. Final-Gate Set Integrity Audit (3 lanes, 7 scopes): **BLOCKER 0 · MAJOR 0 ·
> MINOR 0 · Dangling Reference 0**.

# Doc-4I — Additive Patch v1.0.1 (Growth Hub: `track_referral` System Event-Create Branch) — M7 Billing

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive; carried alongside frozen `Doc-4I_FROZEN_v1.0` / `Doc-4I_PassB_Part2_v1.0_FROZEN` **without editing them in place**. *(Lineage: Doc-4I already carries one folded post-freeze additive patch — `Doc-4I_ActivatePlan_Additive_Patch_v1.0.md` — distinct name, no collision; noted for the fold minute. `Part2:` line cites resolve in `Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0.md`, the content-identical sibling of the `_FROZEN` copy.)* |
| **Date** | 2026-07-19 · **Kind** Additive — **one System event-create branch** on the existing actor-branched contract-ID `billing.track_referral.v1` (Q-15, ratified with guards) + the §HB-6.2 Events-binding flip (consumption only) + the register-row overlay. Coins **no** contract-ID, entity, state, transition, event, slug, audit action, or POLICY key. |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.3 (consumer 1: M7) + Q-15 ruling — *"no M7 **machine** change; one additive contract-entry"* — with its four binding guards; frozen **F4I-PA-M1** (`track_referral` = **one contract-ID with actor-branched authorization**, "Not split into separate contract-IDs" — Part2:18); frozen **Part-1 §H.7** consumption precedent (`Doc-4I_FROZEN_v1.0.md:72` — BC-BILL-3 consumes the RFQ-owned `QuotationSubmitted`; consumption transfers no ownership; no 21.2 contract authored by the consumer); frozen **§HB-6.1** System-branch idempotency precedent ("idempotent on `source_event_id`" — Part2:415); Doc-4A §4.4 (single-authorship: M1 authors production/delivery; the consumer owns its effect). |
| **Depends on** | `Doc-2_Patch_v1.0.11` §4 (the `InvitationConverted` event), `Doc-4C_…v1.0.3` (§PROV-EXT producer), `Doc-4J_…v1.0.1` (catalog registration), `Doc-4L_…v1.0.1` (flow row L9-2). **Atomic fold** — the branch's trigger does not exist without them. |

---

## §1 — The additive branch (extends frozen §HB-6.2; nothing existing modified)

`billing.track_referral.v1` remains **one contract-ID** (F4I-PA-M1). Frozen branches stand verbatim:
**org create** (User · `can_manage_billing` · referrer = the actor's Controlling Org) and the
`advance_referral` System/User milestone branches. **Added: the System event-create branch** —

- **Caller (Q-15 guard 1 — consumer-only):** callable **only** from M7's registered `InvitationConverted`
  consumer (M0 outbox dispatch; flow = Doc-4L L9-2). Not caller-facing: no user, org, or public invocation
  path exists to this branch; it is not exposed on any API surface (Doc-5C adds **no** row for it).
- **Inputs (Q-15 guard 3 — args from the event):** `referrer_organization_id` and
  `referred_organization_id` are taken **from the event payload** — **no caller override**; plus
  `source_event_id = event_id` (the idempotency key — the §HB-6.1 precedent), formalized as a §5
  Inputs-row overlay in the frozen H.2 grammar (the §HB-6.1 row form, Part2:399):

  | Field | Type | Required | Authority | Constraints |
  |---|---|---|---|---|
  | `source_event_id` | `uuid` | conditional — **required on the System event-create branch; absent on the org branch** | Doc-4A §16 | `= event_id` of the consumed `InvitationConverted`; the idempotency key |
- **Idempotency (Q-15 guard 2):** idempotent on `event_id` — a duplicate delivery → the same result, **one**
  `referrals` row, no duplicate audit (the frozen §HB-6.1/H.8 replay rule; the general duplicate-tolerance
  obligation = Doc-4A §16 / Master §15.2).
- **Audit (Q-15 guard 4):** the frozen §HB-6.2 §9 binding applies unchanged (`[ESC-BILL-AUDIT]` — nearest
  by pointer, no action invented; `entity_type=referrals`; in-transaction via Doc-4B) with attribution
  under the **System actor** (Doc-2 §9 `actor_type` label `System`; frozen DB label `core.ActorType
  'system'` — the set-wide casing pin, `Doc-4J_…v1.0.1` fold-note).
- **Effect:** insert `referrals` at **`pending`** — exactly the frozen stage-6 entry state. **The frozen
  machine `pending → qualified → rewarded` is untouched**: no edge added/removed/modified; qualification
  stays milestone-driven via `advance_referral` under Doc-3 POLICY; the reward stays a separate
  `credit_reward` movement on `rewarded` (§HB-6.1). *Early attribution ≠ early reward* (Q-14).

### Validation-matrix overlay (the frozen §HB-6.2 matrix rows, extended for the branch — additive per stage)

| Stage | Branch behavior (extends, never replaces, the frozen row) |
|---|---|
| 1 SYNTAX | extends: `source_event_id` uuid — **required on the System event-create branch, absent on the org branch** (the §5 overlay row above) |
| 2 CONTEXT | the frozen row ("track: User + active org; advance: System (milestone) or User" — Part2:473, standing verbatim) **additionally reads: track (event-create): System** |
| 3 AUTHZ | System authority, **no slug** (the frozen advance-System model; `can_manage_billing` binds the org branch only) |
| 4 SCOPE | System resolves the referrer org **from the event** (the §HB-6.1 "System resolves the target org" model); no Controlling-Org assertion (no acting user exists) |
| 6 STATE | unchanged — new referral enters `pending` |
| 7 REFERENCE | `referrer_organization_id` / `referred_organization_id` resolve (definitive fail → `REFERENCE`, `retryable:false` stands; exceptional here — the referred org was minted in that same M1 provisioning txn, and the referrer org is held live by the invitation row's NOT-NULL FK) |
| 8 BUSINESS | the frozen duplicate referrer→referred pair rule applies unchanged on the org branch. On the System branch: **within the H.8 dedup window** an `event_id` replay is idempotent success (the frozen §HB-6.1 windowed posture — "Replay within window → one row …"); **beyond the window** a same-pair delivery resolves as **idempotent success via the pair rule** (return the existing referral, no second row) rather than `BUSINESS` — safe as a natural key on this branch only, because every conversion mints a **fresh** referred org (§PROV-EXT), so a same-pair delivery can only be the same conversion re-delivered. **No `billing` schema change (no persisted event id) is implied.** |
| 9 POLICY | none added — the branch carries no new POLICY key (milestone/reward keys stay on `advance_referral`/`credit_reward`; `[ESC-BILL-POLICY]` unchanged) |

**Error register: unchanged** — no error class or code added. **Open Q-3 (attribution integrity /
self-referral guard) is NOT resolved here**: an event with `referrer = referred` cannot arise from the M1
producer (§PROV-EXT binds the conversion to a **newly provisioned** org), and any same-org rule is Q-3's
Board ruling — the branch neither adds nor forecloses it.

---

## §2 — Events-binding flips (additive; the §C12.7-FLIP analog for M7)

**(a) Contract binding.** Frozen §HB-6.2 item 8 reads **"Events — No Event (H.7)"** (Part2:484; its bare
"(H.7)" pointer resolves to **Part-2 §H.7**). Effective reading with this patch:

> **Events — Consumes `InvitationConverted`** (M1-owned; Doc-2 §8 as amended by `Doc-2_Patch_v1.0.11` §4;
> catalog = `Doc-4J_…v1.0.1`) **via the System event-create branch; emits none.**

**(b) Convention line (the contradicted frozen sentence, flipped explicitly).** Frozen **Part-2 §H.7**
(Part2:30) reads: *"**BC-BILL-6** consumes only internal milestone triggers (no §8 reward event
exists)."* Effective reading:

> **BC-BILL-6** consumes internal milestone triggers **and — via this patch — the M1-owned
> `InvitationConverted` Doc-2 §8 event** (still **no §8 reward event exists**; BC-BILL-6 emits none).

The same addition reads into every frozen consumption enumeration that restates the convention: the
Part-2 Appendix-A invariants line (Part2:574) and the module-invariants Events bullet
(`Doc-4I_FROZEN_v1.0.md:30`). No other module/BC posture changes.

Precedent and discipline are frozen **Part-1 §H.7**'s own (`Doc-4I_FROZEN_v1.0.md:72`): BC-BILL-3
consumes the RFQ-owned `QuotationSubmitted` — **consumption transfers no ownership**
(`InvitationConverted` stays M1-owned), and **no 21.2 integration contract is authored by the consumer**
(single-authorship, Doc-4A §4.4 — M1 authors production and delivery; M7 owns only its consumer effect).
BC-BILL-6's **emission** posture is unchanged: it still emits no Doc-2 §8 event.

---

## §3 — Register-row overlay (Part2 contract register / FROZEN appendix)

The frozen §HB-6 register row (Part2:571) — `| §HB-6.2 | track_referral · advance_referral | 21.4 Command /
21.5 System | BC-BILL-6 | Reward Account (referrals) | User / System | can_manage_billing / System |
No Event | [ESC-BILL-AUDIT] |` — is overlaid in **one cell only**:

- **Events cell:** `No Event` → **`Consumes InvitationConverted (System event-create branch); emits none`**

The Actor and Permission cells **stand verbatim** (`User / System` · `can_manage_billing` / System) — the
System actor's existing coverage now also includes the event-create branch, which F4I-PA-M1's
actor-branch model already admits structurally. All other cells and every other §HB row stand verbatim.

---

## §4 — Boundary re-affirmations (what this patch does NOT touch)

- **Machine:** `pending → qualified → rewarded` verbatim; no new state, edge, or shortcut; `advance_referral`
  untouched; `expected_state` concurrency untouched.
- **Ownership:** BC-BILL-6 owns `referrals`; M1 owns invitations/conversions and the event; no cross-module
  table access anywhere (the branch reads only the delivered event payload; org resolution rides the
  frozen DF-BILL-1 Identity seam).
- **Reward & money boundary:** reward stays milestone-gated points via `credit_reward` — promotional only,
  never procurement standing (moat; Firewall §4); the platform still never touches buyer↔vendor money.
- **Moat / firewall:** a referral confers no procurement standing, matching, routing, ranking, or award
  effect; no governance signal is read or written.
- **Part-1 §H.7 module statement** (`Doc-4I_FROZEN_v1.0.md:72`): BC-BILL-2's three emitted events and
  every other BC posture unchanged. *(The BC-BILL-6 consumption addition is owned by the §2 flips — not
  by this section.)*

---

## §5 — Compatibility & checklist

Additive only; effective reading = the frozen Doc-4I set + this patch. Backward compatible: every existing
caller, branch, validation row, error, and register row behaves identically; the new branch is reachable
only by the new consumer. Carried realization: producer/event = `Doc-2_Patch_v1.0.11` §4 + `Doc-4C_…v1.0.3`;
catalog = `Doc-4J_…v1.0.1`; flow = `Doc-4L_…v1.0.1` L9-2; schema = `Doc-6C_…v1.0.4` (M1-side only — no
`billing` schema change exists in this set); consumer wiring (Inngest subscription) = implementation scope,
not authored here. The Doc-4A §16.7 consumer failure-mode declaration (retry/DLQ/skip-with-audit) is
likewise **deferred to implementation scope** — the same grammar depth as the frozen BC-BILL-3 consumption
precedent; the M6 sibling pins its delivery-result lifecycle (packet §B4), and the Board may impose
symmetry at the fold.

**Checklist:** □ no new module · □ no ownership change · □ no governance-signal change · □ no cross-module
DB access/FK · □ no frozen doc edited · □ no contract-ID/state/event/slug/audit-action/POLICY-key coined ·
□ machine untouched (Q-15) · □ all four Q-15 guards bound · □ Q-3 left open (not foreclosed) · □ atomic
fold with the 9 sibling patches.
