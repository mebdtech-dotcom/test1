# Doc-4L — Additive Patch v1.0.1 (Growth Hub Flow + Permission Rows) — Integration Index / Permission Authority Matrix

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive; carried alongside frozen `Doc-4L_FROZEN_v1.0` **without editing it in place**. Per L8.6 the Board fold of this set is the Board-authorized **structure**-patch-cycle vehicle for the content-adding carry. |
| **Date** | 2026-07-19 · **Kind** Additive — **1 L3 tenant-permission row** + a **new additive event-flow section (2 rows)**. Doc-4L is **non-normative** (L1/L8): every cell added here is a **pointer**; this patch defines no permission, contract, event, or transition and may not be cited as a contract source. |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.3/§A.4 + the stamped **manifest row (:57)** ("2 flow rows + L3 permission row") and **§B5** ("Flow rows: … L3 permission row: …") — both direct this content to Doc-4L; Doc-2 §7 as amended by `Doc-2_Patch_v1.0.11` §3 (the slug); Doc-2 §8 as amended by `Doc-2_Patch_v1.0.11` §4 (the events); Doc-4A §0.3 (reference-never-restate). |
| **Depends on** | `Doc-2_Patch_v1.0.11` (slug + events), `Doc-4C_…v1.0.3` (producing contracts), `Doc-4I_…` (M7 consumer branch), `Doc-4H_…` (M6 consumer), `Doc-4J_…v1.0.1` (catalog registration). **Atomic fold** — these rows dangle without them. |

---

## §1 — Structural note (flagged for Board confirmation at the fold — not a halt)

The corpus assigns Doc-4L the **Cross-Module Integration Index / event-flow map** role
(the `00_AUTHORITY_MAP.md` **Doc-4L row** — *"Authoritative cross-module event-flow map"*, :71 at
Final-Gate audit time, cite-by-row governs; `CORPUS_INDEX.md:118`;
Doc-4A Pass1:103 — *"Cross-Module Integration & Event Flow Index — a non-normative index …"*), but the shipped
frozen content (`Doc-4L_Structure_FROZEN_v1.0` → `Doc-4L_FROZEN_v1.0`, L1–L8) realizes the **Permission
Authority Matrix only** — no event-flow section was ever authored. The stamped Growth Hub packet (§B5)
directs the two growth flow rows **here**, so this patch seeds the corpus-assigned flow surface as a
**new additive section (L9)** rather than pretending a flow table exists in the frozen base. Both sources
are cited; nothing frozen is edited; the Board confirms the section placement at the atomic fold. *(This is
a documented seam-gap disclosure, not a locally-resolved conflict: the Board's own stamped mandate already
places the rows in Doc-4L.)* The fold minute should style its Doc-4L approval **as the L8.6
structure-patch-cycle act** (the frozen structure is itself `Doc-4L_Structure_FROZEN_v1.0`). The frozen
base's deferred observation **F4L-PA-01** (L5-1 pointer imprecision, "next structure patch cycle") does
**not** ride this fold — it joins the §4 index-maintenance pass.

---

## §2 — L3 addition (Tenant permission slugs table) — one row

Same 4-column format; pointer-only; the slug is **defined** in Doc-2 §7 (as amended by
`Doc-2_Patch_v1.0.11` §3 — unbundled default, O/D/M), never here:

| Permission | Owner Module | Owner BC | Reference Source |
|---|---|---|---|
| `can_manage_growth_invites` | 1 — Identity | Growth invitations (`growth_invitations` / `invitation_conversions`; contract group §C13) | Doc-2 §7 (as amended by `Doc-2_Patch_v1.0.11`); Doc-4C (FROZEN) + `Doc-4C_…v1.0.3` |

- **L4 (Resolution Matrix): no change.** The slug resolves under the existing family row "All tenant slugs
  (… Identity …) → `check_permission` against the actor's role-bundle slugs" — Identity is already
  enumerated; no new resolution mechanism exists.
- **L5 (Cross-module permission dependencies): no row.** The slug is Identity-owned, Identity-resolved,
  and gates Identity-owned entities — authority holder = entity owner; no seam. (The cross-module *event*
  consumption seams are flow facts — §3 — not permission dependencies.)
- **L6 (Escalation markers): no row added.** `ESC-GROWTH-INVITE` is pending the **Board's** registry
  action (packet §D); L6 carries markers surfaced by the frozen corpus and this index never self-registers
  one.

---

## §3 — L9 (NEW additive section) — Cross-Module Event Flow — first rows

**Reference only. No event, payload, contract, or consumer effect is defined here** — rows point to the
authoritative sources (Doc-2 §8 as amended; the owning contract patches). Consumer effects are owned by the
consumers (Doc-4A §4.4 single-authorship); consumers are idempotent on `event_id` (packet §A.3/§B4).

| # | Event | Producer (module · entity · trigger) | Consumer(s) → effect (by pointer) | Reference Source |
|---|---|---|---|---|
| L9-1 | `InvitationIssued` | 1 — Identity · `growth_invitations` · `identity.create_invitation.v1` (**targeted `recipient_type` only**; never open `link`/`qr`) | 6 — Communication → external-address delivery; recipient + invitation URL fetched via `identity.resolve_invitation_delivery_payload.v1` (internal-service; **never from the event**; URL mechanics owned by Doc-4C §C13) | Doc-2 §8 (`Doc-2_Patch_v1.0.11` §4); `Doc-4C_…v1.0.3` §C13; `Doc-4H_…` patch; `Doc-4J_…v1.0.1` (catalog) |
| L9-2 | `InvitationConverted` | 1 — Identity · `invitation_conversions` · the `provisionIdentity` in-txn attribution step (`Doc-4C_…v1.0.3` §PROV-EXT) | 7 — Billing → `track_referral` **System event-create branch** (Q-15 guards) → referral `pending` (frozen M7 machine untouched); 8 — Admin → **P4 only, observe-only projection, deferred** (no contract in this set) | Doc-2 §8 (`Doc-2_Patch_v1.0.11` §4); `Doc-4I_…` patch; `Doc-4J_…v1.0.1` (catalog); packet §A.3 |

**§B5-shorthand reconciliation (Review-A/B MINOR):** the stamped §B5 mandate line renders the M7 leg as
"`InvitationConverted`→M7 (System branch)→**advance/credit**". L9-2 deliberately follows the **canonical
§A.3** effect instead — `track_referral` → referral **`pending`** — because advance (qualification) and
credit (reward) are **later milestone-gated M7 operations** (Q-14 "early attribution ≠ early reward";
Q-15 leaves the machine untouched), not consumer effects of this event. §B5's wording is shorthand for the
downstream funnel, superseded by §A.3 for the flow row; the divergence is disclosed here, not glossed.

L9 inherits the document's discipline verbatim: non-normative, pointer-only, FLAG-AND-HALT on any apparent
conflict with a frozen source (L7 item 8 / L8). It is an index seam surface in the sense of L5 — it records
*that* a flow exists and *where* it is owned; the flows themselves live in the cited contracts.

---

## §4 — Index-drift observations (OBS — non-gating; L8.5 anticipates them; NOT fixed here)

Recorded so the fold sees them; sweeping unrelated rows into a Growth Hub patch would be scope creep:

- **OBS-1** — L3's staff table froze at the 7-slug Doc-2 v1.0.3 set; `Doc-2_Patch_v1.0.8` later added 2
  routing-governance staff slugs (effective staff = 9; total catalog **46** under the effective v1.0.10
  baseline — the folded Vendor-Buyer-Relationship patch added one tenant slug — and **47** with the
  growth slug, matching `Doc-2_Patch_v1.0.11` §3). Per
  L8.5 ("this index is updated to match — the frozen corpus is never edited to match this index") the
  catch-up is separate index maintenance, not this patch.
- **OBS-2** — the frozen end-note says "35 tenant … slugs" while the frozen L3 tenant table itself carries
  36 rows; the effective Doc-2 §7 tenant count pre-growth is now **37** (`Doc-2_Patch_v1.0.8`: "the 36
  tenant slugs … stand unchanged"; the folded `Doc-2_Patch_v1.0.10_VendorBuyerRelationship` VBR patch then took tenant 36→37).
  Count reconciliation belongs to the same maintenance pass.

---

## §5 — Compatibility & checklist

Additive only; effective reading = `Doc-4L_FROZEN_v1.0` + this patch. No frozen text edited; no permission/
role/actor/business rule/state transition created (the slug and events are created by `Doc-2_Patch_v1.0.11`,
realized by their owning contract patches — this index points). No slug coined; no marker registered,
resolved, normalized, or renamed; L4/L5/L6/L7/L8 text untouched.

**Checklist:** □ no new module · □ no ownership change · □ no governance-signal change · □ no
cross-module DB access/FK · □ no frozen doc edited · □ pointer-only cells (Doc-4A §0.3) · □ non-normative
posture preserved · □ §1 placement question surfaced for the Board fold · □ atomic fold with the 9 sibling
patches.
