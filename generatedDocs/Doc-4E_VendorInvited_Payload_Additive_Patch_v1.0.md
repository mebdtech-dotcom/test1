# Doc-4E Additive Patch v1.0 (PATCH-4E-VIP-01) — `VendorInvited` Payload: `buyer_organization_id`

> **Reconcile note (2026-07-23).** Carried from `fe/account-referral-nav` to `main` in the D2-08
> forward-PR. The BC-OPS-6 consumer it enables is declared by **Doc-2 v1.0.10** on main (renumbered
> from branch v1.0.9 per `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md`;
> main's v1.0.9 is the Communication Audit patch). This patch's own `PATCH-4E-VIP-01` id is unchanged.

| Field | Value |
|---|---|
| **Patches** | Doc-4E (RFQ Procurement Engine contracts, FROZEN) — additive producer-side payload declaration for the `VendorInvited` event. No frozen base file edited; no event added/renamed/removed; no contract, state, slug, or POLICY change. |
| **Class** | **Additive event-payload field.** Classification per Doc-4A §16.4/§16.9 + Annex F.4 (event-evolution authority): evolution-class *optional* addition = non-breaking → **`event_version` UNCHANGED** (§16.4: bumped **only** on breaking changes; version increments remain reserved for breaking payload changes). |
| **Authorized by** | Owner/Board — RA-01 disposition **Option (a)** (2026-07-19) → independent RFQ-lane review (PATCH REQUIRED: RQ-01..05) → corrections applied → **APPROVED FOR FOLD + FOLDED 2026-07-19** (authoring record: `governanceReviews/Doc-4E_VendorInvited_Payload_Additive_Patch_PROPOSAL.md` v1.1) |
| **Raised by** | Team-4 Review-A finding RA-01 (BLOCKER) on the BC-OPS-6 contract patch: the frozen `VendorInvited` field-level authority (the consumer schema `Doc-4F_PassB_Part3_BC-OPS-3_FROZEN.md:49-53`; Doc-4E defines no producer field list — verified) carries no buyer-org field, so the Doc-2 v1.0.10-declared BC-OPS-6 consumer cannot form `UNIQUE(controlling_organization_id, buyer_organization_id)`. |
| **Frozen text** | Doc-4E base files are NOT edited. This patch is the additive overlay and the **authoritative producer-side payload declaration** for `VendorInvited`; on payload questions this patch governs. |

## 1. Events Produced declaration (Doc-4A §16.3 grammar — authoritative)

```text
Event:          VendorInvited
Version:        1 (UNCHANGED — Doc-4A §16.4/§16.9/Annex F.4: non-breaking additive field;
                populate-in-place; version increments reserved for breaking changes)
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

The five pre-existing fields are adopted producer-side by pointer to the frozen consumer
evidence (`Doc-4F_PassB_Part3_BC-OPS-3_FROZEN.md:49-53`), unchanged.

## 2. Binding semantics (Board-ruled 2026-07-19)

1. **`buyer_organization_id` = always present; the producer MUST populate it on every
   emission; available to all consumers after fold.** No legitimate absence case exists: the
   producer unconditionally holds `rfq.rfqs.organization_id (owner)` (Doc-2 :757). Doc-4A
   §16.5 emission vocabulary (`always | conditional`) governs; "optional" is an
   evolution-class term only.
2. **No historical backfill implication.** Events emitted before this fold are not
   retroactively amended; any consumer encountering a legacy payload follows its own governed
   malformed-event posture (DLQ per outbox POLICY) — no silent tolerance path is created.
3. **No alternative runtime resolution path.** Consumers source `buyer_organization_id` from
   the payload; this patch licenses no Identity/RFQ lookup fallback for BC-OPS-6 or any other
   consumer.
4. **Existing consumers unchanged.** BC-OPS-3 lead creation and the Communication fan-out
   take no new obligation (Tolerant Reader — Doc-4A §16.7/Annex F.4); their frozen schemas
   are unaffected.

## 3. Non-disclosure (Privacy-Review basis)

The buyer org is a vendor-knowable fact at `delivered` by frozen design (`rfqs` shared to
invited vendors after distribution — Doc-2 :300/:757); `buyer_organization_id` is not a §7.5
protected fact (§16.5 protected enumeration inapplicable). The firing rule is untouched —
undelivered invitations still leave no trace (Doc-2 :659); Communication fan-out remains
recipient-scoped. Doc-4A Annex F.5 names "the organization_id context" among the identifying
fields a thin payload carries — this addition is the thin-payload doctrine's own shape.

## 4. Effect

- The BC-OPS-6 `ops.upsert_relationship_on_invitation.v1` field binding becomes
  implementable; the BC-OPS-6 contract patch's fold-blocking dependency **clears on this
  fold**.
- Carried realization: the producer-side write lands with the RFQ-lane build wave; the
  Doc-6/Prisma payload shape follows at realization. No frozen Doc-4E text is edited; both
  existing consumers behave identically.

---

*Additive patch; frozen base files never edited. Approved for fold and folded by the human
owner/Board (2026-07-19) per CLAUDE.md §7/§8 after independent RFQ-lane review. Registered in
`generatedDocs/00_AUTHORITY_MAP.md`.*
