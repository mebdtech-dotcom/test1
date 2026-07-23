# Doc-4E Additive Patch — `VendorInvited` Payload: `buyer_organization_id` (PROPOSAL)

> **PROPOSAL v1.1 — RA-01 Option (a), Board-approved 2026-07-19.** A fold-blocking dependency
> of `Doc-4F_BCOPS6_BuyerRelationships_Additive_Patch_PROPOSAL.md`. Until folded, nothing here
> is authoritative and the BC-OPS-6 invitation consumer is not implementable.
> **Review record (independent RFQ-lane review, 2026-07-19): PATCH REQUIRED — RQ-01 MAJOR
> (version deferral vs the decisive Doc-4A §16.4), RQ-02 MAJOR (SHOULD/optional vs
> `always`/MUST), RQ-03 MAJOR (full §16.3 Events Produced grammar required), RQ-04 MINOR
> (classification citation), RQ-05 NIT (consumer block → pointer). All corrections applied in
> this v1.1 — within the granted Option (a) authorization, no new ruling required (reviewer's
> conclusion). Suggested patch ID at fold: PATCH-4E-VIP-01.**

| Field | Value |
|---|---|
| **Patches** | Doc-4E (RFQ Procurement Engine contracts) — additive payload declaration on the `VendorInvited` event surface. No frozen base file edited; no event renamed/added/removed; no state, contract, slug, or POLICY change. |
| **Class** | **Additive event-payload field (producer-side declaration).** Classification per **Doc-4A §16.4/§16.9 + Annex F.4** (the event-evolution authority — RQ-04 correction; the §20.2 table has no event-payload row and is cited only for the contract-vs-domain frame, which this patch satisfies: no Doc-2/Doc-3 entity, state, event, or slug altered). Adding a field of evolution-class *optional* is non-breaking: **no `event_version` bump** (§16.4 "bumped **only** on breaking changes"). |
| **Raised by** | Team-4 Review-A finding **RA-01 (BLOCKER)** on the BC-OPS-6 patch: the frozen `VendorInvited` field-level authority (`Doc-4F_PassB_Part3_BC-OPS-3_FROZEN.md:49-53` — the sole field list; Doc-4E defines no field list; grep-verified) carries `event_ref, invitation_id, rfq_id, vendor_profile_id, controlling_organization_id` and **no buyer-org field**, so the BC-OPS-6 upsert cannot form `UNIQUE(controlling_organization_id, buyer_organization_id)` (Doc-2 v1.0.10). |
| **Authorized by** | Owner/Board ruling 2026-07-19 — **RA-01 disposition = Option (a)** (additive Doc-4E-lane payload declaration; "never silently assume payload expansion"). |
| **Status** | **PROPOSED — human/Board approval required to fold; RFQ-lane (M3/Doc-4E) review recommended before fold** |

## 1. The addition — complete §16.3 Events Produced declaration (RQ-03)

Doc-4E frozen defines no producer-side field list (verified); per Board Option (a) this patch
**furnishes the payload home** in the mandated Doc-4A §16.3 grammar. The five existing fields
are adopted producer-side by explicit pointer to the frozen consumer evidence
(`Doc-4F_PassB_Part3_BC-OPS-3_FROZEN.md:49-53`), unchanged:

```text
Event:          VendorInvited
Version:        1 (UNCHANGED — Doc-4A §16.4: event_version is bumped ONLY on breaking
                changes; an optional-evolution-class field addition is non-breaking;
                populate-in-place, no bump — §16.9, Annex F.4. RQ-01: this is pinned,
                not a fold-time option.)
Trigger:        RFQ invitation transition → delivered (the emitting contracts, Doc-4E
                Part-3 §E6.1–§E6.3; fires ONLY at delivered — Doc-2 §8 :659, unchanged)
Payload:        event_ref                    : uuid — always   (outbox event identity)
                invitation_id                : uuid — always
                rfq_id                       : uuid — always
                vendor_profile_id            : uuid — always
                controlling_organization_id  : uuid — always
                buyer_organization_id        : uuid — always   (NEW per this patch)
Outbox:         yes
Source-Ref:     Doc-2 §8 :659 [as amended by PATCH-4E-VIP-01 per §3.5]
Privacy-Review: §7.5 compliant
```

**Emission obligation (RQ-02):** `buyer_organization_id` is declared **`always`** — the
producer **MUST** populate it on every emission (Doc-4A §16.5 vocabulary: `always |
conditional`; "optional" is an evolution-class term, not an emission term). No legitimate
absence case exists: the producer unconditionally holds the value
(`rfq.rfqs.organization_id (owner)` — Doc-2 :757). Consequently no consumer absent-field
path is needed or defined.

**Compatibility (evolution class, distinct vocabulary):** for pre-existing consumers the
addition is evolution-class *optional* — non-breaking; the Tolerant Reader rule (Doc-4A §16.7;
Annex F.4) means BC-OPS-3 lead creation and the Communication fan-out are provably unaffected
and take no new obligation.

**Consumer declaration — pointer only (RQ-05):** already folded by `Doc-2_Patch_v1.0.10_VendorBuyerRelationship.md` §4;
not restated here. This patch is the producer-side payload leg exclusively.

## 2. Non-disclosure check

The buyer org identity is already knowable to a delivered-invitation vendor **by frozen
design**: `rfqs` is "tenant-owned → shared (to invited vendors after distribution)" (Doc-2
:300/:757, via `rfq_invitation_grantees` materialized at delivery). `buyer_organization_id` is
not a §7.5 protected fact (the §16.5 protected enumeration covers blacklist/routing
exclusion/Buyer-Vendor Status/private CRM/protected links — none applies). The field discloses
no routing decision, no competitor existence, no matching signal, and the event still fires
only at `delivered` (undelivered invitations leave no trace — Doc-2 :659 untouched).
Communication fan-out exposes the payload only to the invited-vendor recipient under
recipient-scoped RLS. Doc-4A **Annex F.5** names "the organization_id context" among the
identifying fields a thin payload carries — the addition is the thin-payload doctrine's own
shape, not an exception to it. The `Privacy-Review: §7.5 compliant` assertion in §1 is the
machine-reviewable form of this analysis.

## 3. What does NOT change

The event name, firing rule, `selected`/`deferred` silence, existing payload fields, both
existing consumers, and every Doc-4E contract/state machine. No new event; no Doc-2 §8 catalog
change (the event exists; its consumer declarations were already extended by Doc-2 v1.0.10).

## 4. Effect

On fold: the BC-OPS-6 `ops.upsert_relationship_on_invitation.v1` field binding becomes
implementable; the BC-OPS-6 patch's fold-blocking dependency clears. Carried realization: the
producer-side write lands with the RFQ-lane build wave; the Doc-6/Prisma payload shape follows
at realization.

---

*Additive patch proposal; frozen base files never edited. Folding requires explicit owner/Board
approval per CLAUDE.md §7/§8.*
