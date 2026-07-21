# Rank-0 / Rank-1 Instruments — **Coordination Register v1.0**

**NON-AUTHORITATIVE coordination pointer.** Coins nothing, rules nothing, and confers no status on
any instrument. It records **who owns what, what blocks what, and what must not be edited
concurrently.** On any conflict the instrument itself and the Board ruling win, and this register is
corrected to match.

**Created 2026-07-21** on the Board's `COORDINATION CONTROL: REQUIRED` ruling, after three rank-0/1
amendments were found in flight from at least two parallel sessions — one of which (this session's
G3 packet) was drafted **blind to a Board ruling made hours earlier in another session**.

---

## §1 — Instruments in flight

| # | Instrument | Artifact | Status | Blocked by | Owning session |
|---|---|---|---|---|---|
| **1** | **Rank-0 Amendment Mechanism** (ADR-027 track) | `Governance_RankZero_Amendment_Mechanism_v1.2_PROPOSAL.md` (+ `_v1.0`, `_v1.1`, + `ReviewA_Record_…_v1.0/_v1.1.md`) | **v1.2 DRAFTED 2026-07-21 22:35 by the owning session — "DRAFT, AWAITS HUMAN ARCHITECTURE BOARD APPROVAL."** Applies the Board ruling: reframed as codification of demonstrated practice, first-instance framing withdrawn, M-1…M-9 accepted, M-2 admissibility test removed, `CLAUDE.md` synchronization = mandatory effectiveness gate, `ADR_Compendium_v1.md:20` scoped to consolidation only. | — (root instrument) | **Parallel session** — actively editing; **do not draft or revise** |
| **2** | **Master §4 Invariant 1 — `vendor_type_preset`** | `MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1.md` (+ `ReviewA_Record_…_v1.0.md`) | 🛑 **PARKED** — *"not reviewable in final form and must not be folded until Instrument 1 is approved and folded"* | **Instrument 1** | **Parallel session** |
| **3** | **Master §8.4 + ADR-020 — template semantics (G3)** | `G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md` (+ `ReviewA_Record_…_v1.0.md`, + `G3_Amendment_ReviewA_Manifest_v1.0.md`) | 🛑 **PARKED INDEFINITELY — WORKSTREAM STOPPED** (owner ruling 2026-07-21). Review-A ACCEPTED (5 BLK / 11 MAJ / 7 MIN); revision authorization NOT GRANTED; name ruling **DEFERRED**. **Reopens only on an explicit Board act — Instrument 1 landing does NOT resume it.** No further review or drafting effort. | **Explicit Board reopening** (and thereafter Instrument 1 + a name ruling) | **None — stopped** |

**Superseded / audit-only, never to be folded or cited as authority:**
`G3_Vendor_Profile_Template_Register_MINT_v1.0_PROPOSAL.md` — **REJECTED FOR FOLD** (rank-0/rank-1
conflict), retained as audit evidence with its reviewed hashes recorded in-band.

## §2 — Dependency order (binding while these instruments are in flight)

```
Instrument 1  (rank-0 amendment mechanism)   ← must be approved AND folded first
        ├── Instrument 2  (vendor_type_preset)      PARKED
        └── Instrument 3  (template semantics, G3)  PARKED + name ruling required
```

**Nothing folds before Instrument 1.** Instruments 2 and 3 are independent of each other in
*subject matter* (Master §4 vs §8.4 — verified: 0 cross-references) but **not** in *sequence*.

## §3 — Cross-instrument hazards (verified, both currently unaddressed)

1. **Line-anchor shift.** Instruments 2 and 3 both edit `Master_System_Architecture_v1.0_FINAL.md`
   and both change its line count. Instrument 2 edits §4 (≈`:212`–`:224`), **above** Instrument 3's
   §8.4 (`:569`, `:576`). **A fold of Instrument 2 first silently invalidates every line anchor
   Instrument 3 cites**, and vice-versa for anything below §8.4. Neither instrument declares this.
   **Whichever folds second must re-derive its anchors before execution** — and the Board's carried
   note that *"the Doc-4D version premise must be re-derived when Instrument 2 resumes"* is the same
   class of obligation.
2. **Terminology drift.** Instrument 3 §0 frames vendor-business-type *labels* as the Invariant-#1
   collision; Instrument 2 canonizes `Manufacturer / Workshop`, `Engineering Firm`,
   `Service Provider` as rank-0 presets with no Invariant-#1 violation found. Both cannot stand as
   written. The reconciling distinction: Invariant #1 forbids capability **deriving from** a label,
   not the existence of labels — the defect is templates **named after** business types.

## §4 — Concurrency rules

1. **One session per instrument.** Do not draft, revise, or re-version an instrument owned by
   another session. Route rulings to the owning session instead.
2. **Before drafting any rank-0/rank-1 amendment**, grep `governanceReviews/` for a governing
   mechanism instrument and for other in-flight amendments to the same document. This register is
   the index; it is not a substitute for the grep.
3. **Freeze a hash manifest before any review** whose evidence base includes `generatedDocs/` —
   the corpus is being mutated concurrently. Precedent:
   `G3_Amendment_ReviewA_Manifest_v1.0.md` (20 rows) caught a sibling artifact advancing
   **v1.0 → v1.1 between two commands**, and its v1.0 bytes are now unrecoverable.
4. **Untracked artifacts pin nothing.** A `git hash-object` of an untracked file is unverifiable
   once deleted — as already happened to Instrument 2's v1.0, whose v1.0→v1.1 diff its own record
   states is *"not auditable"*. Commit review-gated artifacts, or accept that the audit trail is
   only as durable as the working tree.
5. **Stage by explicit path, never `git add -A`.** The working tree routinely carries several
   sessions' uncommitted work at once.

## §5 — Method control (Board-ruled 2026-07-21, binding on all instruments)

No governance artifact may state **SILENT · ABSENT · NO PRECEDENT · FIRST-INSTANCE** unless it
carries all six: full rank-0 conceptual sweep · full rank-1 conceptual sweep · synonym and mechanism
searches · evidence both **supporting and contradicting** the claim · an explicit sweep boundary ·
independent verification of the negative. Otherwise use bounded language — *"Within the sources
enumerated below, no complete prospective procedure was identified."*

Rationale, recorded because it recurred three times: identifier-scoped greps cannot reach prose.
Ranks 0 and 1 write in prose, so a sweep for `layout_template` returns 5 corpus hits and "proves"
the letters are opaque, while `Master…FINAL.md:569` and `ADR_Compendium_v1.md:1008` bind names and
behaviour to all five in words containing no such token.

Related ruling: `ADR_Compendium_v1.md:20` (*"the later amendment wins"*) is a **consolidation-scoped
precedent only**. The generic "latest overlay wins over any frozen base" reading is **REJECTED**;
legacy `effective = base + patches` sets remain OPEN under G-1.

---

*Maintained as a coordination aid. Update it when an instrument changes status or owner; it is not
a gate and never overrides an instrument or a Board ruling.*
