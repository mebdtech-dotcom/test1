# Doc-2 Additive Patch v1.0.10 (PATCH-D2-08) — Vendor Buyer Relationship Aggregate

> **Reconcile-renumber note (2026-07-23).** Authored and folded on `fe/account-referral-nav` as
> `Doc-2_Patch_v1.0.9.md` (effective Doc-2 v1.0.9, PATCH-D2-08). On the branch→main reconcile it is
> **renumbered to v1.0.10** per `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md`
> (Scheme B, owner-ratified) — `main`'s v1.0.9 is the folded **Communication (Support-Ticket) Audit**
> patch (2026-07-11), which is the prior tip here. VBR and Comm Audit touch disjoint content
> (M4 buyer-axis CRM aggregate vs M6 §9 support-ticket audit actions); the tenant-slug math
> (45 → 46) is unaffected, so VBR stacks cleanly as v1.0.10. **PATCH-D2-08 ID unchanged.** Renumber
> reassigns the identifier only — content, dispositions, and folded status are untouched (renumber
> mechanics are held in the reconcile execution checklist working record).

| Field | Value |
|---|---|
| **Patches** | Doc-2 (Domain Model & Database Blueprint) — FROZEN v1.0.9 → **v1.0.10** |
| **Class** | **New-aggregate domain expansion — additive.** One new Module-4 aggregate (M4 set 7 → 8): root + two append-only children, one §3.5 lifecycle, one §7 tenant slug, one §9 audit domain row, §8 consumer declarations on three existing events. No new event, no new module, no ownership change, no change to any existing aggregate. |
| **Authorized by** | Human owner ruling, 2026-07-19 — **G1 structural amendment APPROVED** (M4 aggregates 7→8; new bounded context BC-OPS-6 to be minted in the Doc-4F train step) · **G2 tier-mapping Option A APPROVED** · **G3 patch authoring AUTHORIZED**; **FOLDED 2026-07-19** after owner review corrections + focused verification (decision trail: `governanceReviews/VendorBuyerRelationship_Domain_Patch_Train_PROPOSAL_v1.0.md` v1.1 §7; product rulings D2/D4: `governanceReviews/Cluster_1_2_Governance_Closure_and_Team1_Handoff_v1.0.md` v1.1) |
| **Raised by** | Board rulings D2/D4 (vendor-side Buyer Relationships surface, 2026-07-19) realized per `governanceReviews/Buyer_Relationships_Design_Plan_v0.2.md` build-gate step 1; collision sweep 2026-07-19: **verified absent** — no frozen text defines or reserves a vendor-side buyer-relationship record (`buyer_supplier_relationships` is buyer-owned, Doc-2 :777) |
| **Review** | Owner review 2026-07-19 raised **MAJOR-01** (SD flag vs archived-only lifecycle), **MAJOR-02** (provenance-write authority vs manual creation), **MINOR-01** (linear stage notation), **MINOR-02** (provenance dedup identity) — all four corrections applied; focused verification PASS on all four points (authoring record: `governanceReviews/Doc-2_VendorBuyerRelationship_Additive_Patch_PROPOSAL.md`) |
| **Frozen text** | The Doc-2 base file is NOT edited. This patch is the additive overlay; on Vendor-Buyer-Relationship questions this patch governs. |

## 1. §2 — Module 4 aggregate table (addition)

**Base table (unedited, :163–171)** ends:

```
| Vendor Lead (vendor-side CRM) | `vendor_leads` (AR) | `lead_activities` | PipelineStage |
```

**Per this patch, one row is appended:**

```
| Vendor Buyer Relationship (vendor-side buyer-axis CRM) | `vendor_buyer_relationships` (AR) | `vendor_buyer_relationship_provenance` (append-only), `vendor_buyer_relationship_activities` (append-only) | RelationshipStage, ProvenanceTier |
```

The Module-4 aggregate set is 7 → **8**. The Vendor Buyer Relationship (buyer-axis: one row per
known buyer organization) is a **sibling** of the Vendor Lead (transaction-axis: one row per
received RFQ) — no FK between them; each references shared facts by bare UUID only.

## 2. §3.5 — `operations` entity table (addition)

**Base table (unedited)** ends at :334–335 (`vendor_leads`, `lead_activities`).
**Per this patch, three rows are appended:**

```
| vendor_buyer_relationships | Vendor-side private relationship record per known buyer organization | tenant-owned (vendor's controlling org) | stage ∈ {new, developing, active, dormant, archived}; transitions: any governed stage → any governed stage (vendor-managed, every change audited) |
| vendor_buyer_relationship_provenance | Verified-interaction provenance history per relationship | tenant-owned | append-only |
| vendor_buyer_relationship_activities | Activity log per relationship | tenant-owned | append-only |
```

Binding rules (freeze-level):

1. **`effective_provenance` is a derived monotone value, NOT a state machine** — the maximum
   over the relationship's provenance history; System-maintained; it never decays; a later
   weaker event never downgrades it; manual edits never erase stronger system-observed
   provenance (owner ruling D4).
2. **Stage never changes provenance; provenance never changes stage.** Two independent
   dimensions (D4: "Provenance ≠ Stage").
3. The stage enum is closed at the five values above. **`customer`, `won`, `qualified`,
   `rfq_participant` are forbidden stage values** — they would duplicate provenance or
   opportunity state (owner ruling 2026-07-19).
4. **No automatic or mandatory stage progression exists.** The set notation above is
   deliberate: the stages are governed values, not a required sequence.
5. `archived` is the removal-from-working-set state and is reversible; nothing is
   hard-deleted (Invariant #8).

## 3. §7 — Permission matrix (addition)

**Base row (unedited, :639):**

```
| Vendor lead pipeline | `can_manage_leads` (O,D,M,F — vendor side) |
```

**Per this patch, one row is appended to the tenant table:**

```
| Vendor buyer relationships (private buyer-axis CRM) | `can_manage_buyer_relationships` (O,D,M,F — vendor side) |
```

Tenant slug catalog 36 → **37** (total catalog 45 → **46**; staff space unchanged at 9).

## 4. §8 — Consumer declarations (addition; NO new event)

The emitting-module table (:655–671) is unchanged — **this patch mints no event** (BC-OPS-3
precedent: the vendor-side CRM emits zero events). **Per this patch, the Primary-consumers
paragraph (:673) is extended with three declarations** (tier mapping = owner ruling G2,
Option A):

```
`VendorInvited` → (additionally) vendor_buyer_relationships upsert (operations): create-or-raise
provenance to `rfq_participation`; idempotent on invitation_id; fires only at invitation
`delivered` (base rule :659 unchanged).
`RFQClosedWon` → (additionally) vendor_buyer_relationships provenance raise to `engagement`
(operations).
`EngagementCompleted` → (additionally) vendor_buyer_relationships provenance raise to
`awarded_customer` (operations).
```

The `conversation` tier's consumer is **deliberately absent** from this patch: its source event
(`commercial_conversation_started`, M6-owned) is not yet authoritative. The tier exists in the
enum but is **structurally unreachable** until the M6 event patch and its follow-on consumer
patch land (train steps T4/T4b; owner correction 2026-07-19 — never author a consumer against a
not-yet-authoritative event).

## 5. §9 — Audit Mapping (addition)

**Per this patch, one Domain row is appended to the §9 table (after Buyer CRM, :689):**

```
| Vendor Buyer Relationships (vendor-side CRM) | relationship created (user — manual entry), relationship created (system — seeding event), provenance recorded (server-authored — System actor for event consumers; user attribution for manual/import creation), stage changed, activity logged (visible only to vendor org + platform compliance; never buyer-facing) |
```

Create and update are distinct actions (D7 Rule 6). Audit-token serialization (entity_type,
action strings, old/new mapping) is pinned in the train's T5 Doc-4/Doc-6 realization patch —
never invented in code (`REFERENCE_Audited_Write_Pattern_v1.0.md` :60–68).

## 6. §10.5 — `operations` schema (addition)

**Base table (unedited)** ends at :788–789. **Per this patch, three rows are appended** (column
grammar `Table | FK | Ref | Tenant | SD | Notes`):

```
| operations.vendor_buyer_relationships | — | controlling_organization_id (tenant), buyer_organization_id | controlling_organization_id (vendor side) | NO | `stage(new/developing/active/dormant/archived)`, `effective_provenance(manual_or_imported/conversation/rfq_participation/engagement/awarded_customer)` — derived max-over-history, System-maintained; UNIQUE(controlling_organization_id, buyer_organization_id); buyer_organization_id is a bare UUID reference (never a window into Identity data); **never buyer-visible; never feeds routing/matching/scores** |
| operations.vendor_buyer_relationship_provenance | → vendor_buyer_relationships | source_reference_id (bare UUID: invitation / rfq / engagement / thread) | controlling_organization_id | NO (append-only) | `source(manual_or_imported/conversation/rfq_participation/engagement/awarded_customer), observed_at`; server-authored only, never user-supplied (rule 1 below); complete history preserved (D4) |
| operations.vendor_buyer_relationship_activities | → vendor_buyer_relationships | actor_user_id | controlling_organization_id | NO (append-only) | activity log |
```

Additional freeze-level rules:

1. **Provenance-write authority (MAJOR-02 correction, owner-worded):** no public or
   user-authorized contract accepts provenance as input. Provenance observations are created
   only by **server-controlled application logic**:
   - manual-create and governed import handlers append `manual_or_imported` server-side;
   - authoritative 21.5 System consumer contracts append `conversation`,
     `rfq_participation`, `engagement`, or `awarded_customer`.
   The initiating user may be retained as request/audit attribution for manual creation, but
   cannot choose, promote, reduce, replace, or delete provenance.
2. **No independent soft-delete lifecycle (MAJOR-01 correction):** the aggregate has no
   soft-delete state. Removal from the active CRM working set is represented **exclusively** by
   `stage = archived`, which is reversible. (Root row `SD | NO` above; both children
   `SD | NO`, append-only. Hard delete never occurs — Invariant #8.)
3. **Provenance observation identity (MINOR-02 correction):** a provenance observation is
   unique per **(relationship, provenance source, authoritative source reference)**. Repeated
   processing of the same authoritative fact must not append a duplicate provenance
   observation. The persistence-constraint shape is deferred to Doc-6 (source families may
   require different reference forms); the domain invariant binds now.
4. Manual/imported records default to stage `new`, never `active` (owner ruling D4).
5. RLS-scoped to the vendor controlling org; never cross-tenant; a non-owned reference
   collapses to `NOT_FOUND` (BC-OPS-3 :32 posture).
6. **Governance-signal firewall:** this aggregate is private per-vendor data; it never mutates
   or feeds Trust/Performance/Financial-Tier/matching (Golden Rule 3; §4 firewall); it is never
   visible to the buyer, and the buyer's own CRM state remains undetectable to the vendor
   (Invariant #11, applied symmetrically).

## 7. Rationale (Board, recorded)

D2/D4 (2026-07-19) ruled a vendor-side private Buyer Relationships surface: five approved
seeding channels and a Provenance Ladder whose evidence dimension is system-derived and whose
management dimension (stage) is vendor-owned. The frozen corpus's vendor CRM was
transaction-axis only (Vendor Lead per received RFQ); the buyer-axis record is the ruled,
non-colliding complement. Tier mapping G2 Option A uses **existing events only** — award
(`RFQClosedWon`) evidences `engagement`; delivery (`EngagementCompleted`) evidences
`awarded_customer` — minting nothing.

## 8. What does NOT change

- The seven existing Module-4 aggregates — including Vendor Lead — and BC-OPS-1..5 scope text
  stand unchanged; no table, state, slug, event, or audit row is renamed, removed, or re-scoped.
- §8 emitting table: no new event; `VendorInvited` firing rule (:659) unchanged.
- The buyer-side CRM (BC-OPS-1) and its non-disclosure invariants unchanged.
- Doc-4F structure counts (5 contexts / 7 aggregates) are NOT amended by this patch — that is
  the train's T3 Doc-4F patch (which mints BC-OPS-6), per Doc-4A §20.2 sequencing.

## 9. Effect

- Module-4 aggregate set 7 → **8**; tenant slug catalog 36 → **37** (total 46) — effective
  Doc-2 v1.0.10.
- **Carried realizations (NOT executed by this fold):** (a) T2 Doc-3 §12.2 POLICY keys
  (`operations.buyer_relationships_page_size_max`, import-control family); (b) T3 Doc-4F
  additive patch — BC-OPS-6 context + contract set; (c) T4/T4b M6 event + consumer declaration
  + `ops.upsert_relationship_on_conversation.v1`; (d) T5 audit-token serialization patch;
  (e) identity slug-catalog seed migration + Doc-6C count-assertion overlay (46; precedent
  `Doc-6C_Patch_v1.0.1`); (f) Prisma migration + build-wave implementation per the program
  roadmap; (g) FE wiring per `Buyer_Relationships_Design_Plan_v0.2.md` gates 4–5.
- `ESC-OPS-BUYER-CRM` registry row minted and CLOSED on this fold (dual pointers: the train
  proposal + this file).

---

*Additive patch; the frozen base files are never edited in place. Authored under G3
authorization and folded on owner approval (rulings 2026-07-19) per CLAUDE.md §7/§8.
Registered in `generatedDocs/00_AUTHORITY_MAP.md`.*
