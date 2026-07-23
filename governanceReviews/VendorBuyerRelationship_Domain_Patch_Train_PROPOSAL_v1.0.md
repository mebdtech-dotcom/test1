# Vendor Buyer-Relationship Aggregate — Domain Patch Train (PROPOSAL)

> **Provenance (branch authoring record) — reconciled to `main` in the D2-08 forward-PR.** The patch this record authored folded on `main` as **Doc-2 v1.0.10 (PATCH-D2-08)**; in-body references to "v1.0.9" are the branch-authoring number (on `main`, v1.0.9 = the Communication Audit patch). Renumber per `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md` (Scheme B).

**Version:** v1.1 · **Date:** 2026-07-19 (v1.1: owner correction folded — T3 authors BC-OPS-6
**without** the conversation consumer; that contract arrives only in a T4-follow-on patch
(T4b); provenance is never a user input on any contract) · **Status:** **PROPOSED — nothing
herein is implementable until each patch in the train is human/Board-approved and folded**
**Purpose:** realize build-gate step 1–2 of
`governanceReviews/Buyer_Relationships_Design_Plan_v0.2.md` (FREEZE-READY) by minting the
domain + contract surface for the vendor-side Buyer Relationships aggregate ruled in D2/D4
(`Cluster_1_2_Governance_Closure_and_Team1_Handoff_v1.0.md` v1.1).
**Method:** grounded in a verbatim frozen-corpus extraction (2026-07-19); every anchor below is
cited to the frozen text. Reference-never-restate; all NEW names are **indicative until folded**.

---

## 0. Why this is a patch TRAIN, not a Doc-4F patch

- Doc-4A §20.2 (Pass5 :243): "**New entity or aggregate | Domain change | N/A — Doc-2 patch
  first | Post-patch contract update**." §20.1: a contract referencing an entity absent from the
  frozen corpus is nonconforming. §20.5: an AI agent MUST NOT make domain changes inside a Doc-4
  update — hence this PROPOSAL for human approval.
- `Doc-4F_Structure_v1.0_FROZEN.md:75,85,193` freeze M4 at **7 aggregates in 5 bounded
  contexts**; `Doc-4F_PassB_Part3_BC-OPS-3_FROZEN.md:17,260`: BC-OPS-3 "owns the Vendor Lead
  aggregate **only**". Adding an aggregate (7→8) and a context (5→6) amends frozen structure —
  **Architecture Board / human approval required** (CLAUDE.md §7 ranks 0–1, §8).
- **Collision sweep: verified absent.** No frozen text defines/reserves a vendor-side
  buyer-relationship record (Doc-2 §2/§8/§9/§10.5 swept in content; all 34 Doc-4F files grepped;
  BC-OPS-1's `buyer_supplier_relationships` is buyer-owned — Doc-2 :777, BC-OPS-1 :39/:78). The
  concept is mintable without contradiction.

## 1. The train (strict order; each step = separate additive, human-approved patch)

```text
T1  Doc-2 patch      §2 aggregate · §3.5 lifecycle · §10.5 tables · §7 slug · §9 audit rows
                     (+§8 consumer declarations on existing events)
T2  Doc-3 patch      §12.2 POLICY keys (values live only here)
T3  Doc-4F patch     new BC-OPS-6 context + contract set (post-T1, per Doc-4A §20.1) —
                     WITHOUT the conversation consumer (owner correction 2026-07-19: never
                     author a contract against a not-yet-authoritative event)
T4  Doc-4H/M6 lane   `commercial_conversation_started` event (M6-owned; Doc-2 §8 + Doc-4H —
                     independent train; T1–T3 must NOT block on it, see §4 tier mapping)
T4b Doc-4F follow-on additive patch (post-T4): M4 consumer declaration +
                     `ops.upsert_relationship_on_conversation.v1`
T5  D7-pattern       audit serialization patch (Doc-4/Doc-6 realization, per
                     REFERENCE_Audited_Write_Pattern_v1.0 :60-68)
```

## 2. T1 — Doc-2 additive patch (domain)

**New aggregate (Doc-2 §2, Module 4): Vendor Buyer Relationship** — root
`operations.vendor_buyer_relationships`, children
`operations.vendor_buyer_relationship_activities` (append-only) and
`operations.vendor_buyer_relationship_provenance` (append-only). Names sweep-verified
non-colliding (`buyer_supplier_relationships`, `vendor_leads` taken; these are distinct).

**§10.5 table sketch (indicative):**

```text
operations.vendor_buyer_relationships
  controlling_organization_id  (tenant — VENDOR side; the vendor_leads anchor, Doc-2 :788)
  buyer_organization_id        (bare UUID reference — DF-3 posture: not a window into
                                Identity/RFQ data; UNIQUE(controlling_organization_id,
                                buyer_organization_id))
  stage        enum<new|developing|active|dormant|archived>       (D4-ruled vocabulary)
  effective_provenance enum<manual_or_imported|conversation|rfq_participation|
                            engagement|awarded_customer>          (derived: max over history;
                                                                   never decays — D4)
  soft-delete: none needed — `archived` is the removal-from-working-set state (Inv #8:
  nothing hard-deleted)

operations.vendor_buyer_relationship_provenance   (append-only history — D4: "complete
  provenance history preserved")
  → vendor_buyer_relationships · source enum<(five tiers)> · source_reference_id (bare UUID:
  invitation/rfq/engagement/thread) · observed_at · System-actor rows

operations.vendor_buyer_relationship_activities   (mirrors lead_activities, Doc-2 :789)
  → vendor_buyer_relationships · actor_user_id · activity_jsonb · append-only
```

**§3.5 lifecycle:** stage machine any→any (D4: non-linear, no auto-transitions), every change
audited. `effective_provenance` is NOT a state machine — a monotone derived value.

**§7 slug (new):** `can_manage_buyer_relationships` (O,D,M,F — vendor side; BC-OPS-3 precedent
`can_manage_leads`, BC-OPS-3 FROZEN :26).

**§9 audit rows (new, business semantics — serialization in T5):** relationship created (user —
manual channel) · relationship created (system — per seeding event) · stage changed ·
activity logged · provenance recorded (system). Create/update distinct per D7 Rule 6.

**§8 — NO new M4 event.** BC-OPS-3 precedent: emits zero events. Seeding rides **consumer
declarations on EXISTING events** (additive per Doc-4A §20.2 "new consumer declarations"):
`VendorInvited` (co-consumption precedent DF-7) and `RFQClosedWon` / `EngagementCompleted`
(BC-OPS-2-emitted, Doc-2 :666). The M6 conversation event is T4's to mint, M4 merely declares
consumption when it exists.

## 3. T2 — Doc-3 POLICY keys — ✅ **RESOLVED-BY-CONFIRMATION (Option A, owner 2026-07-19)**

**No Doc-3 patch; zero new keys.** Registry sweep against
`Doc-3_Policy_Key_Registration_Patch_v1.4_Operations` showed full coverage by the existing
module-scoped keys: **`operations.list_page_size_max`** (module-wide M4 list-read bound) covers
`ops.list_buyer_relationships.v1`; **`operations.idempotency_dedup_window`** covers the new
`Idempotency: required` commands (the one-module-scoped-key model the Board ratified 2026-07-15,
ESC-RFQ-POLICY/ESC-OPS-POLICY). The indicative `operations.buyer_relationships_page_size_max`
named in earlier revisions of this section is **SUPERSEDED** — it would have duplicated the
module-scoped key. Import-control keys register **with the future import-contract patch** (v1.4's
minimal-registration rule: only wire-referenced keys; design plan gate 6). **T3 binds both
existing keys by pointer and carries a one-line note extending v1.4's illustrative list-read
enumeration to include `list_buyer_relationships`.** Disposition precedent: ESC-RFQ-AUDIT
(Board note, no patch).

## 4. Provenance-tier ↔ event mapping — ⚑ ONE OPEN SUB-DECISION

| Tier | Verified source | Status |
|---|---|---|
| `MANUAL_OR_IMPORTED` | `ops.create_buyer_relationship.v1` (manual) / import (deferred) | clear |
| `CONVERSATION` | `commercial_conversation_started` (T4, M6-owned; consumer authored only in T4b) — the tier EXISTS in the T1 enum but is unreachable until T4b: not establishable automatically (no consumer yet) and **never manually** (provenance is not a user input on any contract, §5) | clear |
| `RFQ_PARTICIPATION` | `VendorInvited` (existing; fires only at `delivered`, Doc-2 :659) | clear |
| `ENGAGEMENT` | ⚑ see below | **owner ruling needed** |
| `AWARDED_CUSTOMER` | ⚑ see below | **owner ruling needed** |

**⚑ The frozen corpus has ONE award moment:** the engagement is *created on* `RFQClosedWon`
(Doc-4F Structure :143) — award and engagement-existence coincide, so the ladder's top two rungs
need distinct facts:

- **Option A (recommended):** `ENGAGEMENT` ← `RFQClosedWon` (awarded, work in progress);
  `AWARDED_CUSTOMER` ← `EngagementCompleted` (existing BC-OPS-2 event — work actually
  delivered). Five distinct rungs from **existing events only**; tension: the top tier's label
  says "awarded" but its trigger is completion.
- **Option B:** collapse — both rungs ← `RFQClosedWon` (effectively a 4-rung ladder). Labels
  stay truthful; loses the delivered-vs-in-progress distinction.

## 5. T3 — Doc-4F additive patch (contracts, post-T1)

**New bounded context: BC-OPS-6 — Vendor Buyer Relationships** (recommended over widening
BC-OPS-3, whose "owns exactly one aggregate" freeze then stays true as written). Contract set
(indicative, Doc-4A templates cited):

| Contract | Template | Notes |
|---|---|---|
| `ops.list_buyer_relationships.v1` | 21.3 Query | cursor grammar §9.6; filter allowlist `{stage?, effective_provenance?}`; page_size POLICY-bounded; **no totals** on the list |
| `ops.get_buyer_relationship.v1` | 21.3 Query | root + activities + provenance history; non-owned ⇒ `NOT_FOUND` (BC-OPS-3 :32 posture) |
| `ops.get_buyer_relationship_summary.v1` | 21.3 Query | the design plan's four KPI own-facts (buyers · awarded customers · rfqs received · engagements) — adapter-supplied so the FE never client-computes (R7); own-record counts, no exclusion leak (§9.6 note) |
| `ops.create_buyer_relationship.v1` | 21.4 Command | manual channel; stage defaults `new` (D4 — never asks for a stage); idempotent on the UNIQUE pair |
| `ops.update_buyer_relationship_stage.v1` | 21.4 Command | `expected_stage` optimistic-concurrency (mirrors `ops.update_lead_stage.v1` :104-110); mismatch ⇒ `CONFLICT`; forbidden values enforced; D7 audited write |
| `ops.add_buyer_relationship_activity.v1` | 21.4 Command | mirrors `ops.add_lead_activity.v1` |
| `ops.upsert_relationship_on_invitation.v1` | 21.5 System | consumes `VendorInvited`; idempotent on `invitation_id` (create-or-raise-provenance) |
| `ops.upsert_relationship_on_award.v1` | 21.5 System | consumes `RFQClosedWon` |
| `ops.upsert_relationship_on_completion.v1` | 21.5 System | consumes `EngagementCompleted` — only under §4 Option A |
| `ops.upsert_relationship_on_conversation.v1` | 21.5 System | **NOT in T3** — authored only in the T4b follow-on patch, after the M6 event is authoritative (owner correction 2026-07-19) |
| import command | — | **deferred** (design plan §10 step 6; controls = T2 keys) |

Boundary rules carried from the frozen text: tenant-owned by `controlling_organization_id`,
RLS-scoped, never cross-tenant; bare-UUID references only (DF-2/3/4); **never visible to the
buyer; never feeds routing/matching/scores** (governance-signal firewall §4; D2 privacy floor);
buyer display-name resolution is a presentation concern via owning-module reads, never copied
into M4 rows.

**Provenance-input rule (owner correction 2026-07-19, contract-level):** NO contract in this
set accepts a provenance value as input. `ops.create_buyer_relationship.v1` writes
`manual_or_imported` server-side; provenance history rows are written exclusively by the 21.5
System contracts. Consequently no user — manual or otherwise — can set `CONVERSATION` (or any
tier); before T4b the `CONVERSATION` tier is structurally unreachable, not merely validated
against.

## 6. What this train does NOT do

No new M4-emitted event · no M6/M9 involvement beyond T4's independent lane · no change to
BC-OPS-1..5 scope text (BC-OPS-6 is additive) · no import flow · no FE work (that's design-plan
gates 4–5, after this train folds) · no POLICY values (Doc-3's own lane) · no touching the
frozen leads aggregate — Vendor Lead (transaction-axis) and Vendor Buyer Relationship
(buyer-axis) remain sibling aggregates with no FK between them (references by ID only).

## 7. Approval gates

```text
G1  Owner/Architecture Board: approve the structural amendment in principle
    (M4 aggregates 7→8, contexts 5→6, BC-OPS-6) ......................... PENDING
G2  Owner: rule §4 tier-mapping Option A / B ............................. PENDING
G3  T1 Doc-2 patch authored → human-approved → folded .................... ✅ FOLDED 2026-07-19
    (Doc-2_Patch_v1.0.9 / PATCH-D2-08; 2 MAJOR + 2 MINOR review corrections + focused
     verification; Authority-Map-registered; ESC-OPS-BUYER-CRM minted-CLOSED; commit 573a349)
G4  T2 ✅ RESOLVED-BY-CONFIRMATION (Option A — §3); T4 independent (M6 lane);
    T4b after T4; T5 with T3/build ....................................... IN TRAIN
G5  T3 Review-A: PATCH REQUIRED (1/4/6/1) → dispositions ratified → v1.1 →
    FOCUSED VERIFICATION (same agent): RA-01→12 ALL CLOSED; NF-01..05
    raised → applied → **v1.2. Verifier: fold YES once G5a folds.** ...... ✅ VERIFIED
G5a Doc-4E `VendorInvited` payload patch — independent RFQ-lane review:
    PATCH REQUIRED (0 BLK / RQ-01..03 MAJ / RQ-04 MIN / RQ-05 NIT; addition
    itself sound: authority/compatibility/disclosure all PASS) → RQ
    corrections APPLIED → **v1.1 (full §16.3 declaration; version PINNED
    unchanged per Doc-4A §16.4; `buyer_organization_id : always`/MUST —
    also resolves Review-A's OBS-A) — AWAITING OWNER FOLD (before/with T3;
    suggested ID PATCH-4E-VIP-01)** ...................................... FOLD-READY
G5b `ESC-IDN-ORG-DISPLAY-LABEL` (Identity-lane display projection;
    registry-registered; gates the name-search FEATURE only, never the T3
    fold; generalizes ESC-7G-ENG-02) ..................................... OPEN
G6  ✅ EXECUTED 2026-07-19 (Board-authorized sequence): PATCH-4E-VIP-01 FOLDED
    (`generatedDocs/Doc-4E_VendorInvited_Payload_Additive_Patch_v1.0.md`) →
    7-point pointer re-verification PASS (0·0·0) → **T3 FOLDED as
    `generatedDocs/Doc-4F_BCOPS6_Additive_Patch_v1.0.md` (PATCH-4F-BCOPS6-01)**;
    both Authority-Map-registered.

POST-FOLD TRAIN STATE (Board-recorded 2026-07-19):
  T1   Doc-2 v1.0.9                     FOLDED
  T2   Doc-3 POLICY                     RESOLVED (by confirmation, Option A)
  T2b  VendorInvited payload            FOLDED (PATCH-4E-VIP-01)
  T3   BC-OPS-6 contracts               FOLDED (PATCH-4F-BCOPS6-01)
  T4   M6 conversation event            OPEN
  T4b  M4 conversation consumer         BLOCKED ON T4
  T5   Audit serialization              OPEN
  ID1  Organization display-label seam  OPEN (ESC-IDN-ORG-DISPLAY-LABEL —
       gates name resolution/search only; blocks no other implementation)
```

Until G3 folds, the FE surface remains exactly as shipped (`fb86e66`): rename + "—" tiles +
governance comment; design plan v0.2 stays the frozen design target.
