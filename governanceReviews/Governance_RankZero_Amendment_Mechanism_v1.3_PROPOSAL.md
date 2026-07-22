# Governance_RankZero_Amendment_Mechanism_v1.3_PROPOSAL.md
### → intended fold form **ADR-027 — Rank-Zero Amendment Mechanism**

> # 🛑 PARKED ON ARRIVAL — inherits the owner's v1.2 park ruling (2026-07-21). Do not fold, do not build on it.
>
> **This draft was authored without sight of the owner's park.** v1.2 was parked on disk
> (*"NOT converging. Do not fold, do not build on it."*) with `ReviewA_Record_RankZero_Amendment_Mechanism_v1.2.md`
> at the same time this v1.3 was being written. v1.3 is therefore a revision of a parked instrument
> and is parked with it.
>
> ⚠️ **Its central premise is contradicted by the owner's ruling.** §1.0 of this draft scopes
> ADR-027 to **`Master_System_Architecture_v1.0_FINAL.md` only**, on the strength of
> `00_AUTHORITY_MAP.md:53`. The owner's park ruling states rank 0 = **Master + Doc-2 + Doc-3 +
> Doc-4A…4M**, citing **`00_AUTHORITY_MAP.md:18`** — verified verbatim: *"0. Frozen Architecture
> Corpus (Master Architecture · Doc-2 · Doc-3 · Doc-4A…4M) ← immutable"*, matching `CLAUDE.md:133`.
> **The Authority Map contains both statements** (`:18` and `:53`); this draft's scope section was
> built on `:53` alone because `:18` had not been found. The scope question therefore remains the
> owner's, and §1.0 must not be cited as settled.
>
> **What may still be useful when/if this unparks** (evidence only — no clause here is approved):
> the `ADR-021_Audit-Records-RLS-Asymmetry.md:6–9` discovery (rank-1 next-free-label practice ·
> amendment-by-re-issue deferred to a human re-freeze · an interim *"effective record"*); the
> corrected anchors in §1.6; the `ADR_Compendium_v1.md:205–209` re-characterization; the RZ-9
> serialization/abort rules and the §6 step-6 fidelity gate, which respond to findings the owner's
> resume checklist also names.
>
> **Owner's stated resume conditions** (from the v1.2 park): a full **13-document rank-0 sweep** ·
> an RZ-1 trigger with an **additive carve-out and a named decider** · an **authority level and home
> for the adoption record** · a **decidable §7.3 bundle** — which must include the
> `repository_structure.md` stamp required by `Governance_Freeze_v1.0.md:49–53` and omitted here.

> **STATUS: DRAFT — AWAITS HUMAN ARCHITECTURE BOARD APPROVAL.** Architecture-affecting under
> `CLAUDE.md:149`; approvable only by a human Board, never by a skill (`CLAUDE.md:139–140`).
>
> **What this instrument is.** The Master Architecture and the ADR Compendium demonstrate an approved
> **consolidation-and-reissue practice** in which reconciliation rulings were carried into a complete
> canonical artifact and prior approved artifacts were superseded. The corpus does not, however,
> state a complete **prospective procedure** for initiating, reviewing, executing, registering and
> activating future amendments to an already-frozen rank-0 canonical document. **ADR-027 codifies
> that demonstrated practice** — without creating a generic latest-overlay-wins rule and without
> retroactively resolving legacy effective-patch sets.
>
> **Scope is now DEFINED (Board ruling 2026-07-21, §1.0).** ADR-027 governs
> **`Master_System_Architecture_v1.0_FINAL.md` only.** Doc-2, Doc-3 and Doc-4A…4M keep their
> existing additive-patch practice, untouched.
>
> **Effectiveness is gated.** Approval alone does not activate this instrument (§7.3, §9).
>
> **Revision v1.2 → v1.3** against **two parallel independent reviews** — Review-A round 3
> (1 BLOCKER · 8 MAJOR · 7 MINOR · 3 NIT · 4 OBS) and Review-B (1 BLOCKER · 14 MAJOR · 9 MINOR ·
> 3 OBS) — plus the Board's scope ruling. Both reviews raised the **same** BLOCKER (undefined
> rank-0 scope); the Board resolved it. Records retained on disk.

## Status

| Field | Value |
|---|---|
| Instrument type | Governance rule (mechanism) — **codification of a demonstrated corpus practice** |
| Intended fold form | **ADR-027** — `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md`, carried alongside the unedited `ADR_Compendium_v1.md` per the ADR-021/024/025 precedent (`00_AUTHORITY_MAP.md:54`) |
| Authority basis | A **human Board act**, following the rank-0 consolidation precedent (`Master…FINAL.md:9`, `:1431`, `:1437`) — see RZ-2 |
| **Scope (defined)** | **`Master_System_Architecture_v1.0_FINAL.md` only** (§1.0) |
| Explicitly out of scope | Doc-2 · Doc-3 · Doc-4A…4M (additive practice stands) · the legacy `effective =` overlay corpus (§4) · rank 1 (§8 RZ-O6) · any pending amendment's content · Board composition · a version-numbering scheme · undefined authority levels |
| Rank 0/1 survey | §1.1 — **all four rank-1 members** swept (Compendium + ADR-021 + ADR-024 + ADR-025) |
| Anchor verification | §1.6 — mechanical extraction + per-citation re-read; **5 defects from v1.2 corrected** |

---

## 1. Problem

### 1.0 Scope — which documents this governs (Board ruling 2026-07-21)

Two authorities describe "rank 0" differently, and both review rounds raised this as a **BLOCKER**:

| Source | Reading |
|---|---|
| `CLAUDE.md:133` | *"Frozen Architecture Corpus (**Doc-2, Doc-3, Doc-4A…4M, Master Architecture**) ← immutable"* — ~16 documents at rank 0 |
| `00_AUTHORITY_MAP.md:53` | `Master_System_Architecture_v1.0_FINAL.md \| **CANONICAL** \| … \| Single source of truth (**rank 0**)` — Doc-2/Doc-3/Doc-4x carry level `FROZEN`, not `CANONICAL` |

**Board ruling: the Authority Map reading governs for this instrument.**

```
ADR-027 governs:  Master_System_Architecture_v1.0_FINAL.md   (level CANONICAL)
ADR-027 does NOT govern:
    Doc-2 · Doc-3 · Doc-4A…4M      → additive patching stands, unchanged
    Doc-5x · Doc-6x · Doc-7x · Doc-8x → unchanged
    rank 1 (Compendium, ADR-021/024/025) → unchanged; carried at RZ-O6
```

**Consequences of the ruling, recorded so they are not re-argued:**

- The eight-plus rank-0-adjacent patch proposals live in the working tree (Doc-2, Doc-3, Doc-4C/4H/4I/4J/4L, Doc-5C, Doc-6C, Doc-7E) are **unaffected**. They proceed as additive patches.
- `Doc-4D_Structure_Freeze_Gate_v1.0.md:190` — *"**Amendment rule:** any change to the frozen structure requires a Doc-4_Governance_Note patch; the carried dependencies resolve via additive patches to their owning documents … and do not reopen Doc-4D"* — is a **lower-rank amendment rule that stands untouched**. Review-A raised it as unreconciled against RZ-3; under this scope ruling there is no conflict: Doc-4D is not governed here. *(Surfaced per round-2 M-9 and round-3 m-7, which correctly noted its omission.)*
- The `CLAUDE.md:133` / `00_AUTHORITY_MAP.md:53` divergence is a **real corpus inconsistency**, not resolved by this instrument. Carried at **RZ-O7**.

### 1.1 What ranks 0 and 1 actually contain — the survey

v1.1 concluded *"SILENT."* Review-A round 2 **B-1** disproved it and the Board accepted. This survey is
expanded per Board **M-9** and corrected per round-3 **M-1/M-2**: **all four rank-1 members** are now
swept (v1.2 omitted ADR-021 entirely).

**Rank 0 — `Master_System_Architecture_v1.0_FINAL.md` (CANONICAL):**

| Anchor | Text | Bearing |
|---|---|---|
| `:9` | `Supersedes \| Master System Architecture Draft v0.1; ADR Compendium v1 (for reading purposes); Architecture Closure Package v0.3.2 (for reading purposes)` | **Rank 0 is itself a consolidated re-issue that superseded predecessors.** The `Supersedes` header is rank-0 practice. |
| `:1431` | *"**Consolidation rulings carried into this document** …"* — seven enumerated reconciliations | **Reconciliation rulings carried into a complete canonical artifact** — the shape RZ-3 codifies, demonstrated at rank 0. |
| `:1437` | *"All prior drafts, compendia, and closure packages are **superseded for reading purposes** by this document."* | Rank-0 supersession language. |
| `:1428`, `:1433` | `ADR-019 \| Identifier Strategy … \| Approved (Closure Package v0.3.2 §5)`; *"identifier strategy is ratified as ADR-019 per the approved Closure Package"* | **Rank 0 assigned ADR-019** — bears on RZ-8 and on the divergence recorded at RZ-O5. |
| `:284` (Invariant 8) | *"Controlled documents are versioned, never edited in place."* | **Analogy only.** `:1186–1196` scopes version-controlled documents to product specifications, procurement and company documents. |
| `:1194` | *"**Never overwrite** — v1 → v2 → v3; never edit in place."* | Same business-document scope. |
| `:12` | *"All architecture decisions recorded here are final and frozen … the agent must stop and flag the conflict rather than work around it."* | Prescribes escalation, not an amendment procedure. |

**Rank 1 — all four members per `00_AUTHORITY_MAP.md:54`:**

| Anchor | Text | Bearing |
|---|---|---|
| `ADR_Compendium_v1.md:20` | *"Nothing in this compendium introduces a new decision. **Where two approved texts conflicted, the later amendment wins and the reconciliation is recorded.**"* | **Consolidation-scoped tiebreak** — limited by Board ruling (§1.2). |
| `ADR_Compendium_v1.md:50–60` | Eleven **Modify / Modify (reconcile) / Modify (editorial) / Keep / Flag / Reject** verdicts on *approved* texts. *(Range corrected from v1.2's `:50–59`; the **Reject** row (item 11) is at `:60`.)* | Rank-1 record of a Board performing **non-additive modification during a consolidated re-issue**. |
| `ADR_Compendium_v1.md:58` (§B item 9) | *"ADR-019 absent from corpus \| **Flag** \| Number reserved. Do not backfill. **Confirm whether skipped or unpublished before v0.4.**"* *(Line corrected from v1.2's `:57`, which is item 8, the "mendment L" typo row. **Verdict is Flag — a pending item, not a decision**; see RZ-O5.)* | Label non-backfill, **as a flagged question**. Not normative support on its own. |
| `ADR-021_Audit-Records-RLS-Asymmetry.md:6–9` | *"**ADR-021 is the next free number** (**ADR-019 stays reserved / do-not-backfill** per Compendium §B-9; **ADR-020 is the last used**). Registered in `00_AUTHORITY_MAP.md`. **Deferred to a human re-freeze:** consolidating ADR-021 into a re-issued **ADR Compendium v2** (this carried-alongside legal record + the authority-map registration are **the effective record until then**)."* | **Three-way load-bearing** — and omitted entirely from v1.2 (round-3 **M-2**): (a) rank-1 **next-free-label + non-reuse practice**, the independent support RZ-8 needed; (b) rank-1 **amendment-by-re-issue** (Compendium v2), deferred to a human re-freeze; (c) an explicit **interim effective record** — the precedent RZ-4's adoption record now rests on. |
| `ADR-024…:18` | Next free; ADR-019 reserved/do-not-backfill; ADR-021 last folded | Second rank-1 instance of the next-free-label practice. |
| `ADR-024…:44–46` | *"Because **the corpus is silent**, this is an **additive authoring** decision — not an override of any frozen clause."* | **The identical rhetorical move, resolved additively** — the strongest counter-argument to a non-additive route, surfaced as such. |
| `ADR-025…:57–59` | *"…SHALL conform … **unless explicitly superseded by a later Board decision**"* | Rank-1 contemplation of **explicit supersession by Board act**. |
| `ADR-010` (`ADR_Compendium_v1.md:495–521`) | *"All controlled **business** documents support versioning. **No document is overwritten.**"*; enumeration at **`:505–507`** — Product Specifications / Procurement Documents / Company Documents *(range and enumeration lines corrected from v1.2)* | The most on-point rank-1 versioning ADR; scope is controlled **business** documents. |
| `ADR_Compendium_v1.md:15`, `:17`, `:205–209`, `:265` | Status Approved/**Superseded**; *"so amendment provenance survives"*; at `:205–209` the **revised** ADR-005 header carries *"Approved (Revised — supersedes ADR-005 v1…)"* **and** *"Superseded marker: ADR-005 v1 … Do not implement against v1."* | **Corrected characterization (round-3 review-B M-5):** the marker sits in the **new/revised** document — it is the `Supersedes:` header pattern (RZ-4.1), **not** an edit to a superseded artifact. See RZ-4. |
| `ADR_Compendium_v1.md:9` | Compendium supersedes individual ADRs **for reading** | Reading precedence between ADR forms. |
| `ADR_Compendium_v1.md:511` | *"never overwrite"* | RFQ-scoped. |

### 1.2 The `ADR_Compendium_v1.md:20` ruling — scope-limited (Board, 2026-07-21)

`:20` generalizes **only to the approved Architecture/ADR consolidation context**:

> When approved texts conflict during an authorized consolidation, the later approved amendment
> controls and the reconciliation is recorded.

It does **not** establish *"any later patch automatically overrides any earlier frozen base."* The
broader reading would leave undefined: what *"later"* means · whether the amendment must be
Board-approved · whether rank must match · whether an unregistered patch qualifies · how overlapping
amendments are ordered · whether the rule extends beyond the consolidation set.

```
ADR Compendium :20
  = authoritative consolidation precedent
  ≠ generic latest-overlay-wins mechanism
```

**This instrument coins no latest-overlay-wins rule and relies on none.**

### 1.3 The change shapes that require this route

| Shape | Why an additive overlay is inadequate |
|---|---|
| **Correction of normative canonical text** | An overlay asserting the correct proposition leaves the base asserting the incorrect one; both remain live. |
| **Rename / re-key** | The superseded identifier remains in the base; base and overlay then disagree about identity. |
| **Removal** | Nothing additive can un-say frozen text. |
| **Addition that overrides or qualifies existing canonical text** | *"Notwithstanding §X, the rule is Y"* leaves §X asserting X. Phrased as an addition, it is a permanent corrective overlay in substance. *(Added per round-3 review-A **M-3**, adversarial case E — v1.2's trigger let this escape.)* |

Each produces two simultaneously authoritative texts contradicting each other on one proposition.
**Within the approved consolidation context, rank 1 supplies a tiebreak (§1.2); outside it, the
survey in §1.1 identified no rule ordering a frozen base against a later overlay** — which is why
G-1 remains open (§4) rather than being answered here in either direction.

### 1.4 Where the additive-only instruction lives — and what that does and does not mean

| Statement | Location | Authority level |
|---|---|---|
| *"changed only by additive patch + (rank 0–1) human approval"* | `00_AUTHORITY_MAP.md:42` (FROZEN legend row; the rank-0 target is **CANONICAL** at `:41`, which carries **no** amendment rule) | **NON-AUTHORITATIVE** (`:187`) |
| *"Never edit a FROZEN document. Propose additive patches only."* | `CLAUDE.md:192` | **NON-AUTHORITATIVE** (`00_AUTHORITY_MAP.md:216`) |
| *"Changing [ranks 0–1] requires an **additive** architecture patch with human approval"* | `CLAUDE.md:139–140`; mirrored `00_AUTHORITY_MAP.md:30–31` | **NON-AUTHORITATIVE** |

Two corrections to v1.1/v1.2's handling:

1. **"Non-authoritative" ≠ "uncontrolled."** `CLAUDE.md:3–5` self-stamps **FROZEN v1.3** — *"changes
   require an additive patch + version bump."* `Governance_Freeze_v1.0.md:8` covers *"the repository
   governance/orientation layer only — **not** the frozen architecture corpus (`generatedDocs/`),
   which is independently frozen"* — quoted in full per round-3 **m-5**; the second half limits the
   claim to the `CLAUDE.md` leg, which is the leg §7.3 acts on.
2. **The authority basis does not rest on these mirrors.** v1.2's RZ-2 grounded itself in
   `CLAUDE.md:139–140` — a non-authoritative clause whose operative word is *"additive"* — while §2
   simultaneously stated that nothing below rank 1 authorizes anything in §5 (round-3 **M-8**). RZ-2
   is re-grounded on the **rank-0 consolidation precedent**.

### 1.5 Bounded finding (mandatory form — Board method ruling §5.7)

> **Within the sources enumerated in §1.1, no complete prospective procedure was identified for
> initiating, reviewing, executing, registering and activating an amendment to an already-frozen
> rank-0 canonical document.**

Deliberately *not* an assertion of silence, absence, no-precedent, or first-instance status.

**Sweep boundary (corrected per round-3 M-2/m-1).** Rank 0: `Master_System_Architecture_v1.0_FINAL.md`
(full-file concept sweep: supersede · amend · re-issue · version · overwrite · edit-in-place ·
consolidat\* · reconcil\* · reserved · backfill). Rank 1 — **all four members** per
`00_AUTHORITY_MAP.md:54`: `ADR_Compendium_v1.md` (**including carried ADR-010, which is inside that
file**), and the three separate files `ADR-021_Audit-Records-RLS-Asymmetry.md`,
`ADR-024_Canonical_Vendor_Subdomain_URLs.md`, `ADR-025_Marketplace_Public_URL_Law.md`. Below rank 1:
surveyed for **vocabulary and practice only, never authority**. **Not swept, and therefore claimed
about in no direction:** Doc-4B, Doc-4F–4M, the Doc-5/6/7/8 series, `docs/`, and `governanceReviews/`
beyond this chain.

### 1.6 Anchor verification record (round-3 M-1 — the recurring defect class)

v1.2 asserted *"every anchor was re-read from source"* and three were wrong. For v1.3 the citations
were **mechanically extracted** (48 distinct `file:line` references) and re-read individually.
**Five v1.2 defects corrected:**

| v1.2 citation | Defect | v1.3 |
|---|---|---|
| `ADR_Compendium_v1.md:57` (×4) | `:57` is §B item 8 (*"'mendment L' typo"*, Modify-editorial); the ADR-019 row is item 9 | **`:58`**, and re-characterized as a **Flag**, not a decision |
| `ADR_Compendium_v1.md:50–59` (×3) | eleven rows run to `:60`; the **Reject** row is at `:60` | **`:50–60`** |
| `ADR_Compendium_v1.md:506–508` | enumeration is at `:505–507`; `:508` is blank | **`:505–507`** |
| `ADR_Compendium_v1.md:495–523` | ADR-010 content ends `:521` | **`:495–521`** |
| `CLAUDE.md:167–168` cited for *"the map is a status pointer"* | it reads *"**Status SSoT**"* — it does not say what was attributed to it | **removed**; the proposition rests on `00_AUTHORITY_MAP.md:7–9` alone |

Also corrected: `CORPUS_INDEX.md` path is **`generatedDocs/CORPUS_INDEX.md`** (round-3 m-6); the
`Doc-4D_Structure_Freeze_Gate_v1.0.md:12` term is *"**Existing Text** anchor"*, not *"Existing Text
Reference"* (round-3 n-1) — the "Reference" form belongs to `Doc-4C_PassA_Patch_v1.0.1.md:38`, which
this instrument demotes to drafting vocabulary.

---

## 2. Evidence — what already exists (referenced, never restated, `CLAUDE.md:193`)

Nothing below rank 1 authorizes anything in §5; lower-level rows are **existing vocabulary and
practice to reuse**, never authority.

| Existing item | Location | Authority level |
|---|---|---|
| Rank-0 consolidated re-issue: `Supersedes` header · rulings carried in · predecessors superseded | `Master…FINAL.md:9`, `:1431`, `:1437` | **rank 0 — CANONICAL** |
| Rank 0 assigned ADR-019 | `Master…FINAL.md:1428`, `:1433` | **rank 0 — CANONICAL** |
| Controlled **business** documents versioned, never edited in place | `Master…FINAL.md:284`, `:1186–1196` | **rank 0 — CANONICAL** (analogy) |
| Consolidation tiebreak, scope-limited (§1.2) | `ADR_Compendium_v1.md:20` | **rank 1 — FROZEN** |
| Board log: Modify / Modify (reconcile) / Keep / Flag / Reject on approved texts | `ADR_Compendium_v1.md:50–60` | **rank 1 — FROZEN** |
| **Next free label · ADR-019 reserved/do-not-backfill · last-used tracking** | `ADR-021…:6`; `ADR-024…:18` | **rank 1 — FROZEN** |
| **Amendment by re-issue, deferred to a human re-freeze (Compendium v2)** | `ADR-021…:7–9` | **rank 1 — FROZEN** |
| **Interim "effective record" while a re-issue is deferred** | `ADR-021…:8–9` | **rank 1 — FROZEN** |
| Non-backfill of a reserved label, **as a flagged question** | `ADR_Compendium_v1.md:58` | **rank 1 — FROZEN** (verdict: Flag) |
| Supersession vocabulary; `Supersedes`-header marker in the **revised** document | `ADR_Compendium_v1.md:15`, `:17`, `:205–209`, `:265` | **rank 1 — FROZEN** |
| Controlled **business** document versioning ADR | `ADR-010` (`ADR_Compendium_v1.md:495–521`) | **rank 1 — FROZEN** |
| Explicit supersession by a later Board decision | `ADR-025…:57–59` | **rank 1 — FROZEN** |
| Corpus-silence resolved **additively** (counter-precedent) | `ADR-024…:44–46` | **rank 1 — FROZEN** |
| Owner acting as the human Board | `ADR-024…:3`, `:18` | **rank 1 — FROZEN** |
| The document wins over the map; the map is patched | `00_AUTHORITY_MAP.md:7–9` | NON-AUTHORITATIVE |
| Authority levels legend | `00_AUTHORITY_MAP.md:39–45` | NON-AUTHORITATIVE |
| Reference-never-restate · Verify before delivering · Flag-and-Halt | `CLAUDE.md:193`, `:197`, `:198` | NON-AUTHORITATIVE |
| Raise ≠ Accept (`:228`) + four-question gate (`:233–237`) · freeze gate 0·0·0 (`:225`) | `CLAUDE.md` | NON-AUTHORITATIVE |
| Freeze Certification block vocabulary | `Doc-4D_Structure_Freeze_Gate_v1.0.md:183–191` | PROVENANCE |
| *Existing Text* anchor must match the base **verbatim** | `Doc-4D_Structure_Freeze_Gate_v1.0.md:12` — ⚠️ describes **pre-freeze** Structure-Patch application | PROVENANCE |
| *"as amended by … re-issued as …"* phrasing | `Doc-4D…:187`; `Doc-4E…:92` | PROVENANCE — ⚠️ **pre-freeze consolidations** |
| Existing-Text-Reference / Amendment-Text patch grammar | `Doc-4C_PassA_Patch_v1.0.1.md:38` | ⚠️ **Authority-Map-unregistered**; **drafting vocabulary only, NOT normative authority** |
| ADR carried alongside the unedited Compendium | `00_AUTHORITY_MAP.md:54`; `ADR-024…:3–12` | NON-AUTHORITATIVE / FROZEN |

**Withdrawn or demoted** (carried unchanged): `Doc-5A_Content_v1.0_Pass10.md:59` removed ·
`BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md:18` removed · `Doc-5J_…:57` demoted ·
`BOARD-PACKET-A7R-…_v0.1.md:21` demoted.

### 2.1 `Architecture_Freeze_Reconfirmation_v1.0.md` — both directions, and a live exception

**For:** `:18` calls re-issue *"the standard consolidated state"*; `:104` authorizes re-issue under
change management. **Against:** it was **never executed** (`:18`; `Master…FINAL.md:1004–1015` still
holds the pre-patch §15.3 rows), and the CD-MA-1 delta was **purely additive**.

⚠️ **Live exception, surfaced per round-3 review-A:** `Architecture_CD-MA-1_Patch_v1.0.md` is a
patch **on rank-0 CANONICAL text** (`:8–9`, *"Applies to Master_System_Architecture_v1.0_FINAL.md —
§15.3 … Produces Architecture §15.3 as amended by this patch"*) and is **unregistered** — verified:
`grep -n "CD-MA-1" 00_AUTHORITY_MAP.md` returns **zero hits**. It is therefore an existing rank-0
overlay that §4's `effective =` carve-out does not reach by its wording. **It is expressly carried at
RZ-O8, not adjudicated here** — this instrument is prospective, and adjudicating it would breach
§7.2.

---

## 3. What is existing practice, and what this instrument standardizes

### 3.1 Existing precedent — demonstrated, not coined here

| Practice | Demonstrated at |
|---|---|
| Consolidated re-issue of a canonical artifact | `Master…FINAL.md:9`, `:1437` |
| Reconciliation of conflicting **approved** texts carried into the new artifact | `Master…FINAL.md:1431`; `ADR_Compendium_v1.md:20`, `:50–60` |
| Board **modification** decisions on approved texts | `ADR_Compendium_v1.md:50–60` |
| Supersession with provenance preserved; marker in the **revised** document | `Master…FINAL.md:9`; `ADR_Compendium_v1.md:15`, `:205–209`; `ADR-025…:57–59` |
| **Next free label · non-reuse · last-used tracking** | `ADR-021…:6`; `ADR-024…:18` |
| **Amendment by re-issue deferred to a human re-freeze, with an interim effective record** | `ADR-021…:7–9` |

### 3.2 New procedural standardization — the complete enumeration

Rebuilt per Board **M-8** and round-3 **M-4** (v1.2's list omitted its own most consequential rule).

| Added | Where |
|---|---|
| **Trigger** — the semantic admissibility rule and its exclusions | RZ-1 |
| **The route as a standing rule** — every future rank-0 amendment **must** use complete re-issue *(v1.2 dropped this row; the Master's one-time consolidation is precedent, not a standing obligation)* | RZ-3 |
| **The five normative-posture bullets** — no concurrent canon · no permanent corrective overlays · no "latest file wins" · complete re-issue not a partial diff · authority read from documents + adoption record | RZ-3 |
| **Review chain** — independent A, Board adjudication, independent B | §6 |
| **Execution gates** — verbatim anchor verification **and the re-issue fidelity gate** | §6 |
| **The adoption record** as a defined artifact | RZ-4 |
| **Immutable historical artifact rule** | RZ-4 |
| **Registry rules** — adoption record + synchronized pointer | RZ-6 |
| **Concurrency + abort rules** | RZ-9 |
| **Activation conditions** — the effectiveness bundle, its verifier, and the not-yet-effective marker | §7.3, §9 |
| **"Every rank-0 amendment is a discrete Board act"** | §7.1 |
| **"Conversational approval authorizes drafting only"** — narrows `ADR-024:18` | RZ-2 |
| **Legacy-scope exclusion** | §4, §7.2 |
| **Version-label non-reuse + next-unused-label selection** | RZ-8 |

**Not coined, expressly:** a legacy base/patch precedence rule (§4) · a latest-overlay-wins rule
(§1.2) · a version-numbering or patch-vs-major scheme (RZ-8) · the `APPROVED` / `RATIFIED` authority
levels (§8) · the composition of the Architecture Board (§8) · any change to how existing overlays
are read (§4).

*(Round-3 M-4 also caught a dangling self-citation in v1.2's RZ-2 — it claimed enumeration in §3.2
for a row that did not exist. Both the row and the reference are now real.)*

---

## 4. What this instrument does NOT resolve — the legacy overlay corpus

**ADR-027 does not reconcile the existing overlay corpus.** It applies **only to future amendments of
the rank-0 CANONICAL document (§1.0)**.

**No characterization of any legacy fold as "correctly additive," "reconciled," or otherwise
adjudicated is made or implied.** The rows below evidence that the question is open, nothing more:

| Evidence | Location |
|---|---|
| `Doc-6C_Patch_v1.0.1` corrects its frozen base's permission-slug count 45 → 43, base untouched | `00_AUTHORITY_MAP.md:123` |
| The same count later reads 46 → 47 | `00_AUTHORITY_MAP.md:121` |
| `Doc-5D_Patch_v1.0.1` carries *"a conformance correction"* | `00_AUTHORITY_MAP.md:86` |
| `Doc-4M v1.0.1/v1.0.2` index corrections, base untouched | `00_AUTHORITY_MAP.md:72` |
| **`Architecture_CD-MA-1_Patch_v1.0.md`** — a rank-0 overlay, **unregistered** | verified: zero `CD-MA-1` hits in `00_AUTHORITY_MAP.md` |

> ### G-1 — Legacy base/patch precedence
>
> **Status: OPEN, PARTIALLY INFORMED.**
>
> ```
> Known:    The Architecture/ADR consolidation resolved conflicting approved texts
>           by applying the later amendment and recording the reconciliation.
> Unknown:  Whether and how that rule governs later "effective =" base-plus-patch
>           sets such as Doc-6C.
> ADR-027:  Does not resolve those legacy sets retroactively.
> ```
>
> **Resolution vehicle:** a separate, future legacy reconciliation instrument.

**Board rationale of record for not generalizing overlays:** reconstructing authority from a base plus
a chain of overlays is harder for engineers, reviewers and AI agents than reading one complete current
version. Adopting corrective overlays as the *future* model because legacy debt exists would convert
legacy ambiguity into a governance model.

---

## 5. Mechanism — Rank-0 Amendment by Base Re-Freeze

### RZ-1 · Admissibility — a semantic trigger

v1.1's four-condition test is **deleted** (Board §5.5): it turned on proving a universal negative.

**ADR-027 applies when an approved Board act changes the active meaning of the rank-0 CANONICAL
document (§1.0) through:**

```
replacement · removal · renaming · re-keying · correction · reconciliation · consolidation
· addition that overrides or qualifies existing canonical text
```

**ADR-027 does not apply to:**

```
editorial corrections that do not change canonical meaning
non-authoritative guidance
derived indexes corrected toward an unchanged higher authority
documents outside §1.0 (Doc-2 · Doc-3 · Doc-4A…4M and below)
legacy overlay reconciliation unless separately authorized
```

**The decisive question governs.** Where the term list and the decisive question disagree, **the
decisive question controls**:

```
Does the act change the active meaning of rank-0 canon?     ← decides
Could somebody technically express it as an additive patch?  ← irrelevant
```

*(Round-3 review-A **M-3** / review-B **M-3** and **m-3**: v1.2 gated on the term list, so a
`"Notwithstanding §X…"` override escaped, and a meaning-preserving consolidation was
double-classified. The eighth term closes the first; decisive-question primacy closes the second — a
lossless consolidation changes no active meaning and is therefore out of scope.)*

**Contested classification.** Where a proposer classifies an act as **out** of scope and any reviewer
or Board member disputes it, the dispute is resolved by the **Board**, not the proposer; the act does
not proceed as additive until that ruling is recorded. *(Round-3 review-B **M-2**: v1.2's exclusion
list was self-certifying with no route to a decider.)*

Additive patching remains the **default and the overwhelming norm** for everything outside §1.0 and
for everything this trigger does not reach.

### RZ-2 · Authorization

Human **Architecture Board** only. No skill — including the Virtual CTO — may authorize, execute, or
fold a rank-0 amendment. **Drafting** by a skill is permitted; authorizing, executing and folding are
not *(round-3 review-B **m-7**: v1.2 left drafting to implication on an AI-drafted instrument)*.

**Authority basis — re-grounded** (round-3 **M-8**). The warrant is the **rank-0 consolidation
precedent itself**: `Master…FINAL.md:9`, `:1431`, `:1437` show the canonical document being produced
by Board consolidation, carrying reconciliation rulings, superseding its predecessors. v1.2 grounded
RZ-2 in `CLAUDE.md:139–140` — a NON-AUTHORITATIVE mirror whose operative word (*"additive"*) forbids
what this instrument authorizes, and which §2 excludes as authority. That grounding is **struck**;
the `CLAUDE.md` clause is now cited only as the mirror to be synchronized (§7.3).

Owner-as-human-Board precedent, referenced not coined: `ADR-024…:3`, `:18`. **Conversational approval
authorizes drafting only**; the binding act is Board approval of the artifact (enumerated in §3.2).

### RZ-3 · Route — base re-freeze by complete re-issue

```
<base vN>  as amended by  <amendment instrument>  re-issued as  <base vN+1>
```

```
Board approval
  → amendment applied (Existing Text / Amendment Text drafting grammar)
  → base re-issued COMPLETE at the next unused label
  → FIDELITY VERIFIED: unamended text carried forward byte-identical (§6 step 6)
  → re-frozen via a Freeze Certification block
  → adoption record executed (RZ-4)
  → registries synchronized
  → prior version historical, never concurrent authority
```

Normative posture:

- **No concurrent rank-0 canon.**
- **No permanent corrective overlays for rank 0.**
- **No "latest file wins."**
- **Canonical amendments produce a complete re-issued version**, never a partial diff carried alongside.
- **Authority is determined by the documents themselves, read with the adoption record.** The
  Authority Map is a **synchronized pointer**, not the source — `00_AUTHORITY_MAP.md:7–9`: *"If a
  status here disagrees with the actual document, the document wins and this map is patched."*

This route **follows the rank-0 precedent** (`Master…FINAL.md:9`/`:1431`/`:1437`) rather than
extending business-document versioning by analogy.

### RZ-4 · Supersession — the adoption record, unmutated history

Supersession does **not** depend on an Authority Map legend value.

**RZ-4.1** The new canonical artifact carries `Supersedes: <prior artifact>` in its header
(`Master…FINAL.md:9` pattern). *(Corrected characterization: `ADR_Compendium_v1.md:205–209` shows
rank 1 doing exactly this — the "Superseded marker" sits in the **revised** document, not as an edit
to the superseded one. v1.2 wrongly described that as the forbidden practice.)*

**RZ-4.2 — The adoption record, defined** *(round-3 review-A **M-5** / review-B **M-4**: v1.2 named
it but left it unbuildable)*:

| Property | Definition |
|---|---|
| **Artifact** | A single Board-approved markdown record, **one per amendment** |
| **Location + name** | `generatedDocs/ADR-027_Adoption_Record_<base>_<newLabel>.md` |
| **Authority level** | **PROVENANCE** — a lifecycle record (`00_AUTHORITY_MAP.md:45`); it records the transition, it does not restate canon. **No new authority level is coined.** |
| **Author / owner** | The Board act's executor; approved by the Board as part of the same act (§6 step 8) |
| **Required content** | (1) prior artifact = **historical**; (2) new artifact = **active**; (3) **effective date**; (4) **verification result** — the §6 step-5 anchor check *and* the step-6 fidelity check, each stated as PASS with what was compared |
| **Registration** | Registered in `00_AUTHORITY_MAP.md` in the same act (RZ-6.1), and referenced from the new artifact's header so a consumer holding the new document can find it |

Precedent, not coinage: `ADR-021…:8–9` already treats *"this carried-alongside legal record + the
authority-map registration"* as **the effective record** while a re-issue is deferred.

**RZ-4.3** The Authority Map is synchronized as a pointer to the active version.

**RZ-4.4** The superseded file is preserved **as an unchanged historical artifact** — never edited,
including to add a back-pointer. *(Round-3 review-B **O-2**: "byte-for-byte" has an automated
adversary in this checkout — the PostToolUse prettier hook. The obligation is **no content or
formatting change of any kind**; tooling must exclude `generatedDocs/` from write-time formatting.
Carried at RZ-O9.)*

**Reader signal — the residual hole, stated plainly.** A consumer who opens only the superseded file
sees nothing marking it historical, because RZ-4.4 forbids touching it. The mitigation is
discovery-side, not file-side: the Authority Map points at the active version, the adoption record is
registered, and the new artifact names its predecessor. **This is a real limitation of the chosen
route, not a solved problem** — v1.2 claimed the adoption record "supplies the reader-facing signal,"
which is not true for that reader (round-3 review-B **M-5**). The alternative — an in-band marker —
was rejected because it requires editing a frozen artifact.

### RZ-5 · Precedence — scoped

For the document amended under RZ-3, the precedence question **does not arise**: at any moment exactly
one version is authoritative. **Prospective only**; no claim about the existing `effective =` corpus
(§4), and no general latest-overlay-wins rule (§1.2).

### RZ-6 · Registration

**Normative:**

1. The **adoption record** (RZ-4.2) is executed and registered as part of the same Board act.
2. `00_AUTHORITY_MAP.md` is **synchronized** to the re-issued version and records the prior version
   as historical.

**Informative — Non-Normative** (operational hygiene):

3. `generatedDocs/CORPUS_INDEX.md` file map updated.
4. Escalation handles the amendment closes are updated in `esc_registry.md` (*"DRAFT v0.3 —
   non-authoritative companion"*, `:4`); partial scope retains an explicit carve-out.
5. Non-authoritative mirrors restating the amended text are synchronized — except `CLAUDE.md`, which
   is a gate, not hygiene (§7.3).

### RZ-7 · How a consumer determines the active version

The **document** is primary. `00_AUTHORITY_MAP.md` is the synchronized pointer, read with
`generatedDocs/CORPUS_INDEX.md` and the registered **adoption record** (RZ-4.2), which is where the
transition is recorded. For multi-file documents outside §1.0, the `effective = …` expression and the
`*_SERIES_FROZEN_*` manifest continue to apply unchanged.

### RZ-8 · Version labels

1. **Use the next unused label**, determined by sweeping `00_AUTHORITY_MAP.md` **and**
   `generatedDocs/` on disk. **Independent support for sweeping both:** the map is not a complete
   index of issued labels — `Doc-4D_PassA_Patch_v1.0.1.md` and `Doc-4D_PassB_Patch_v1.0.1.md` both
   exist and neither is registered; `Architecture_CD-MA-1_Patch_v1.0.md` likewise (§2.1).
2. **Never reuse a previously issued label.** **Rank-1 support:** `ADR-021…:6` — *"ADR-021 is the
   next free number (ADR-019 stays reserved / do-not-backfill …; ADR-020 is the last used)"* — and
   `ADR-024…:18`, the same practice applied twice.

⚠️ **Withdrawn from v1.2:** the claim that `ADR_Compendium_v1.md:57` supplies normative support. The
row is at `:58`, its verdict is **Flag** (*"confirm whether skipped or unpublished"*), and rank 0
subsequently **assigned** ADR-019 (`Master…FINAL.md:1428`, `:1433`). That rank-0/rank-1 divergence is
a real corpus defect; it is **carried at RZ-O5, not adjudicated here** (round-3 review-B **M-6**).

**No versioning scheme is defined**; patch-vs-major is carried at RZ-O1.

### RZ-9 · Concurrency, in-flight work, and failed execution

*(New — round-3 review-B **M-10**, **M-11**, **M-12**. Scoped to §1.0, so the surface is small.)*

1. **Serialization.** At most **one** rank-0 amendment may be in execution (§6 steps 6–9) at a time.
   An amendment drafted against a base that has since been re-issued must be **rebased** onto the new
   base and re-verified at step 5 before it may proceed. This is what makes RZ-3's *"no concurrent
   rank-0 canon"* an outcome rather than an assertion.
2. **Downstream impact.** Because lower-rank documents cite the Master by `file:line`, a re-issue
   **must** be accompanied by an impact check of citations into the amended document, and the result
   recorded in the adoption record's verification field. *(Round-3 review-A **M-9**: line anchors
   move silently, and an anchor check can pass against relocated but coincidentally matching text.)*
3. **Failed execution.** If the re-issue is written but the act is not completed through step 8, the
   amendment is **aborted**: the re-issued file is removed, the prior version remains the sole
   canonical artifact, and **the attempted label is burned** (RZ-8.2 — never reused). Abort is a
   Board act and is recorded. Without this, a half-executed amendment would leave two complete rank-0
   files with no permission to touch either.

---

## 6. Procedure

| # | Step | Gate |
|---|---|---|
| 1 | Amendment instrument drafted: quotes the *Existing Text* verbatim, gives the *Amendment Text*, names the RZ-1 trigger term, and states why the act **changes active rank-0 meaning** | RZ-1 admissibility |
| 2 | **Review-A** — independent; author never self-reviews | findings raised, not ruled |
| 3 | Board adjudicates each finding (four-question gate, `CLAUDE.md:233–237`; Raise ≠ Accept `:228`) | Raise ≠ Accept |
| 4 | **Review-B** — independent | — |
| 5 | **Anchor verification** — every *Existing Text* anchor matches the base verbatim (`Doc-4D_Structure_Freeze_Gate_v1.0.md:12` model) | must PASS |
| 6 | **Fidelity verification** — the re-issued document is compared against its predecessor and **every unamended line is byte-identical**; only the amended spans differ | **must PASS** |
| 7 | **Human Board approval** (RZ-2) | rank-0 act |
| 8 | Base re-issued complete + re-frozen with a Freeze Certification block | **0 · 0 · 0** (`CLAUDE.md:225`) |
| 9 | Adoption record executed + registered; registries synchronized; downstream citation impact recorded (RZ-4, RZ-6, RZ-9.2) | one act |

**Step 6 is new and is the safety case for this route** (round-3 review-A **M-6**): re-issuing the
Master means reproducing ~1,443 lines, and a single silent drift would become canonical permanently.
v1.2 verified only the amendment's own anchors and never that the rest of the document survived
unchanged.

*(ADR-027's **own** one-time activation bundle is §7.3 — it is **not** a per-amendment step; v1.2
listed it as step 9, which would have blocked amendment #2 on a `CLAUDE.md` version bump that is not
required. Round-3 review-B **m-4**.)*

---

## 7. Non-goals and boundaries

### 7.1 This instrument does not

- Apply to any document outside §1.0, or to any existing overlay (§4).
- Coin a legacy precedence rule, a latest-overlay-wins rule, a version scheme, an authority level, or
  a Board definition (§3.2).
- Grant any skill authority over ranks 0–1.
- Create a standing permission to relabel, re-word or re-key frozen content. **Every rank-0 amendment
  is a discrete Board act.**

### 7.2 It does not reconcile the legacy corpus

**ADR-027 confers no reading, tiebreak or precedence on any existing base+patch set.** A future
reconciliation instrument owns that (§4). **No statement in this instrument may be cited as
adjudicating any legacy fold**, including the unregistered CD-MA-1 rank-0 overlay (§2.1, RZ-O8).

### 7.3 `CLAUDE.md` synchronization — a MANDATORY EFFECTIVENESS GATE

*"Non-authoritative" does not mean uncontrolled.* `CLAUDE.md` is a **frozen operational control
surface** (`:3–5`, FROZEN v1.3, *"changes require an additive patch + version bump"*). Folding
ADR-027 while `CLAUDE.md:192` still reads *"Never edit a FROZEN document"* would **manufacture a
standing Flag-and-Halt** for every contributor and agent.

**ADR-027 may be approved first, but does not become effective until the bundle is complete:**

```
ADR-027 folded
CLAUDE.md additive patch
CLAUDE.md version bump
governance/orientation freeze procedure
Authority Map synchronization
required index synchronization
```

**Board-directed synchronized wording:**

> Never edit a FROZEN document in place.
>
> A rank-0 canonical document may be superseded only through the Board-approved ADR-027
> amendment-and-reissue procedure. The superseded artifact remains unchanged.

**Verifiability of the gate** *(round-3 review-B **M-13**)*: the bundle is complete when a **Board
activation record** — `generatedDocs/ADR-027_Activation_Record.md`, PROVENANCE — states each of the
six items as done, with the artifact or commit that discharged it. The *"governance/orientation
freeze procedure"* item is discharged by an additive patch to `Governance_Freeze_v1.0.md` covering
rank-0 amendment; that file today holds a freeze **record**, not a procedure. **Until the activation
record exists, ADR-027 is not effective.**

**Not-yet-effective marker** *(round-3 review-B **M-14**)*: while folded and inert, the ADR-027 file
**carries an in-band banner** stating it is approved but **not yet effective**, naming the activation
record as the condition. This coins no authority level — it is a status banner in a document this
instrument is free to write, unlike a superseded frozen artifact.

*(Observed: the mirror duty is already imperfectly met — `CLAUDE.md:162` records Doc-2 at **v1.0.3**
while `00_AUTHORITY_MAP.md:55` records **v1.0.10**.)*

### 7.4 Drafting control on absence claims — scoped to this instrument's own class

Instruments authored under ADR-027 — rank-0 amendment instruments and their review records — **may
not state `SILENT` / `ABSENT` / `NO PRECEDENT` / `FIRST-INSTANCE`** unless they carry all six of: a
full rank-0 conceptual sweep · a full rank-1 conceptual sweep · synonym and mechanism searches ·
evidence supporting **and contradicting** the claim · an explicit sweep boundary · independent
verification of the negative. Otherwise the bounded form (§1.5) is mandatory.

⚠️ **Scope corrected** (round-3 review-A **M-7** / review-B **M-7**): v1.2 bound *"no governance
artifact in this program"* — every artifact at every rank — which contradicted RZ-6's own principle
that a rank-1 ADR does not impose normative duties on non-authoritative or draft artifacts, and
exceeded the instrument's stated scope. **The Board's method-level ruling stands program-wide on its
own authority** (recorded at `ReviewA_Record_RankZero_Amendment_Mechanism_v1.1.md` §5.7); ADR-027 is
not its vehicle and does not re-enact it beyond its own class.

---

## 8. Open items — carried, not closed

| ID | Item |
|---|---|
| **G-1** | Legacy base/patch precedence — **OPEN, PARTIALLY INFORMED** (§4). Separate reconciliation instrument. |
| **RZ-O1** | Patch-vs-major increment criterion undefined. |
| **RZ-O2** | `APPROVED` (`00_AUTHORITY_MAP.md:59, 64, 65, 74`) and `RATIFIED` (`:76, 77`) are in live use and absent from the `:39–45` legend. Separate Authority Map correction. **Not a dependency of RZ-4** — the adoption record is PROVENANCE, an existing level. |
| **RZ-O3** | "Architecture Board" has no defined composition; nearest is a per-gate role roster. RZ-2 authorizes by reference to existing precedent. |
| **RZ-O4** | `Architecture_Freeze_Reconfirmation_v1.0.md:104` authorized a re-issue that `:18` shows was never executed. **Historical authorization only — revalidation required.** |
| **RZ-O5** | **ADR-019 divergence:** `ADR_Compendium_v1.md:58` reserves the number *"do not backfill"* (verdict **Flag**, pending); `Master…FINAL.md:1428`/`:1433` **assign** it as Identifier Strategy, Approved. A rank-0/rank-1 inconsistency, live today. Not adjudicated here. |
| **RZ-O6** | **Rank 1 has no amendment route**, and one is already scheduled: `ADR-021…:7–9` defers *"consolidating ADR-021 into a re-issued ADR Compendium v2"* to a human re-freeze. ADR-027 is itself rank 1 and therefore **has no defined route to its own amendment**. Separate instrument. *(Round-3 review-B **M-1**, review-A **m-6**.)* |
| **RZ-O7** | **`CLAUDE.md:133` vs `00_AUTHORITY_MAP.md:53`** disagree on rank-0 membership. The Board ruled the Authority Map reading governs **this instrument** (§1.0); the corpus inconsistency itself needs a separate correction. |
| **RZ-O8** | **`Architecture_CD-MA-1_Patch_v1.0.md`** is a rank-0 overlay with no Authority Map registration (§2.1). Its status is a legacy question (G-1), not resolved here. |
| **RZ-O9** | Write-time formatting tooling (the PostToolUse prettier hook) must exclude `generatedDocs/` so RZ-4.4's preservation obligation cannot be breached by automation. |

---

## 9. Approval block

| Gate | Status |
|---|---|
| Review-A — v1.0 | ✅ 🟠 REVISION REQUIRED (1·9·10·1·3) |
| Review-A (fresh) — v1.1 | ✅ 🟠 REVISION REQUIRED (1·9·7·2·3) |
| **Board adjudication of the v1.1 record** | ✅ 2026-07-21 — record §5 |
| **Review-A (fresh) — v1.2** | ✅ 🟠 REVISION REQUIRED (1·8·7·3·4) |
| **Review-B (independent, parallel) — v1.2** | ✅ 🟠 REVISION REQUIRED (1·14·9·0·3) |
| **Board scope ruling (both BLOCKERs)** | ✅ 2026-07-21 — §1.0, Master-only |
| Revision v1.2 → v1.3 | ✅ this document |
| **Review-A / Review-B — v1.3** | ☐ not run |
| Human Architecture Board — mechanism approval | ☐ not granted |
| Fold as `generatedDocs/ADR-027_RankZero_Amendment_Mechanism.md` + Authority Map registration | ☐ blocked |
| **EFFECTIVENESS BUNDLE (§7.3) + activation record** | ☐ **MANDATORY GATE — not effective until complete** |

Freeze/merge gate (`CLAUDE.md:225`): **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** before fold.

*End of Governance_RankZero_Amendment_Mechanism_v1.3 (PROPOSED) — codification of a demonstrated
consolidation-and-reissue practice into a complete prospective procedure for amending
`Master_System_Architecture_v1.0_FINAL.md`: a semantic admissibility trigger with a named decider for
contested classification, human-Board authorization grounded in the rank-0 consolidation precedent,
complete re-issue with an anchor gate AND a fidelity gate, a defined PROVENANCE adoption record,
unmutated historical artifacts, serialization and abort rules, and version-label non-reuse. Coins no
legacy precedence rule, no latest-overlay-wins rule, no version scheme, no authority level, no Board
definition. Does not reconcile the legacy overlay corpus — G-1 remains OPEN, PARTIALLY INFORMED.
Effectiveness is gated on the §7.3 bundle and its activation record. DRAFT — awaits HUMAN approval;
not folded by AI.*
