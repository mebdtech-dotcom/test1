# Review-A Record — G3 Template Semantics Amendment Packet v1.0

| Field | Value |
|---|---|
| **Instrument reviewed** | `governanceReviews/G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md` |
| **Reviewed snapshot** | SHA-256 `e5627ee6321578125fd9fb4b4e7eff574c75d4088c4b9f4ebc072e9d823a7c8b` · git blob `988de018cc1344a66a772a65ab903a291a16fea6` · 20906 bytes |
| **Review manifest** | `governanceReviews/G3_Amendment_ReviewA_Manifest_v1.0.md` · SHA-256 `0a70ff6e9d98ca8e5f840a0b9c608d7db6d30b8e2b8bdbc60e60d991c9e31370` (20 rows, hash gate **PASS**, verified independently by all three reviewers) |
| **Method** | Three **blind, independent, adversarial** reviewers, each instructed to refute rather than confirm, each reporting the hashes it reviewed. Lens 1 authority/corpus integrity · lens 2 scope/entitlements/production · lens 3 cross-amendment/fold/pointers. The packet author did **not** review the packet (Raise ≠ Accept; no self-B). |
| **Verdict** | 🔴 **REVISION REQUIRED** — **BLOCKER 5 · MAJOR 11 · MINOR 7 · NITPICK 2 · OBS 5.** `CLAUDE.md` §13 gate (0·0·0) **NOT MET** |
| **Board decision 2026-07-21** | **ACCEPT REVIEW-A** · packet **PARKED** · revision authorization **NOT YET GRANTED** · unblocking condition **Instrument 1 approved and folded** · **name ruling REQUIRED before substantive redrafting** · internal defects **B3/B4/B5 recorded and mandatory** · **coordination control required** |
| **Artifact integrity** | The reviewed file was **byte-unchanged** throughout Review-A (re-verified post-review). It has since received a **status banner only** (Board-ruled PARKED marking); no reviewed text was altered. |

---

## §1 — BLOCKERS (accepted)

| # | Finding | Raised by |
|---|---|---|
| **B1** | **The packet is a rank-0 amendment that is unaware no rank-0 amendment mechanism exists.** The Board ruled a structural split on 2026-07-21: `Governance_RankZero_Amendment_Mechanism` is **Instrument 1**, ruled and folded **first**; the vendor-type amendment is **Instrument 2, PARKED**. This packet contains **0** references to any of it and invents its own fold route — the exact circularity already ruled against. §9A's *"either may fold first"* is false: **neither may fold at all.** | lens 3 |
| **B2** | **"Amendment in place" is the Red Flag "Modify a FROZEN document", and its precedent is false.** `ADR_Compendium_v1.md:54` is row 5 of a **pre-freeze consolidation log** (`## §B`, heading `:47`), not an amendment apparatus. The real apparatus is **§C Amendment Traceability Matrix at `:1052`**, never mentioned. Post-freeze practice is the opposite — ADR-021/024/025 are all *"carried alongside"* (`00_AUTHORITY_MAP.md:54`), and `:9` states *"Original files remain the legal record of each decision."* | lenses 1, 2, 3 |
| **B3** | **§B.2 does not mirror §A.2 while asserting *"Mirrors A.2 exactly."*** B.2 omits: *"and never restricts, infers, or records what kind of business a vendor is"*; *"(display_order / is_visible)"* + *"not by template identity"*; *"— an entitlement is not a vendor-type lock."* The packet's sole atomicity rationale is that ranks 0 and 1 must not diverge; as drafted it **manufactures** that divergence. | lenses 2, 3 |
| **B4** | **§A.2 emits self-contradictory rank-0 text and covertly resolves a question the packet says it leaves open.** It carries *"Each defines hero, section, and contact ordering"* forward verbatim **and** adds *"…governed separately by `profile_sections` … not by template identity"*, while §A.3 and §10.6 both state the tension is unresolved. | lenses 1, 2, 3 |
| **B5** | **Instrument A is mislabelled.** Header `:9` says *"additive Master §8.4 patch"*; §A.1 is *"Exact text being replaced"* and §A.2 *"Proposed replacement text"*. Additive and replacing are different instruments; a replacing overlay carried alongside an unedited base leaves two contradictory lists with no precedence rule. | lenses 2, 3 |

## §2 — MAJORS (accepted)

| # | Finding |
|---|---|
| **M1** | **Theme-name collision.** `Corporate`, `Modern`, `Industrial` are frozen **theme** names at `Master…FINAL.md:568` / `ADR_Compendium_v1.md:1007` — item 1 of the same list being amended. "A Corporate Classic" / "B Modern Industrial" trade a vendor-type collision for a **theme/template** collision across two orthogonal frozen fields (`microsites.theme` vs `microsites.layout_template`), and make `ProfileThemeChanged` / `ProfileLayoutChanged` ambiguous in prose. **→ Board: NAME RULING REQUIRED before substantive redrafting.** |
| **M2** | `ADR_Compendium_v1.md:1046` (Future Expansion) lists **"industry templates"**, surviving the fold as a direct contradiction of the new *"never a vendor business type"* prohibition — same ADR, both rank 1. §B.1's preserved-clause enumeration silently omits Future Expansion, Data Ownership Split and Visibility & Audit. |
| **M3** | **`can_use_section_builder` never reconciled** — **0** occurrences in the packet, while `ADR_Compendium_v1.md:1023` gates it ✗/✗/✓/✓. The packet qualifies *template* availability by entitlement but asserts `profile_sections` governance unqualified. This is the rejected register's BLOCKER class **transposed**: inoculated against the instance, not the class. |
| **M4** | **§4 reasons from a plan name over an explicitly illustrative table.** `ADR_Compendium_v1.md:1019` heads it `Entitlement (illustrative)`; `:1028` states *"The plan→entitlement mapping above is marketing configuration; the architecture binds only to the slugs."* §4's *"A Basic vendor seeing one template is correct frozen behaviour"* over-reads, and reintroduces the plan-name reasoning redline §B-5 removed. |
| **M5** | **Undeclared new normative prohibitions beyond a rename** (*"never restricts, infers, or records…"*), present in Instrument A only, not disclosed in §A.3 or §3. The Board had already ruled this defect class on the sibling instrument; the ruling did not propagate. |
| **M6** | **Line-anchor shift.** Both rank-0 amendments edit the same file in place. The sibling edits §4 (~`:212`–`:224`), **above** §8.4 — a sibling-first fold silently moves this packet's `:569` and `:576` anchors. Neither packet mentions anchor re-verification; §9 has no such step. |
| **M7** | **§5.3's binding pre-fold DB check is unexecutable against §7's freeze protocol.** §5.3 requires the result be *"recorded in this packet"*; §7 freezes the packet by hash **before** Review-B and defines no re-freeze. Either the gate lapses or the freeze breaks. |
| **M8** | **§7 has no re-freeze after Review-B fixes**, and never states what the post-fold commit hash is verified **against**. The artifact is untracked, so no pre-fold commit baseline exists. |
| **M9** | **§9 pointer set wrong in both directions.** Missing ≥7 mandatory targets — all five `prototypes/vendor-profile-templates/layout-0N-*.html`, `assets/kit.css`, `prototypes/README.md:37` (§9's *"READMEs + index pages"* scoping excludes the layout files that carry the names). Two listed pointers (`fe-program-wbs.md`, `changelog.md`) are irrelevant — their "mint pending" text is FE-PLAT Track 8. `page_inventory.md` has zero relevant content. |
| **M10** | **§9A is anchored on a deleted artifact** (`…_PROPOSAL_v1.0.md`, never committed) and concludes *"either may fold first"*, not recording that the sibling is **PARKED — BLOCKED ON INSTRUMENT 1**. Substance re-verified against v1.1 and holds (0 hits), but the cited sweep is unreproducible — failing the packet's own §8 standard. |
| **M11** | **§0's Invariant-#1 rationale is overbroad.** It frames business-type *labels* as the Invariant-#1 collision, while the sibling canonizes `Manufacturer / Workshop`, `Engineering Firm`, `Service Provider` as rank-0 presets with no Invariant-#1 violation found. Invariant #1 forbids capability *deriving from* a label, not the existence of labels. The defect is templates **named after** business types. Terminology drift between the two packets is real. |

## §3 — MINORS / NITPICKS (accepted)

`ADR_Compendium_v1.md:998` is blank — Content ≠ Presentation is at `:999` (off-by-one in a preserved-clause anchor) · §5.4 declares a *"Binding"* MUST-NOT that sits in **neither instrument** and whose only prior source is the **rejected** register · `Doc-2 §10.3` (`:744`) dropped from evidence, §6 and §9, and *"same order"* in §3.7 is unanchored · `grep -c` on a single file is not diagnostic (violates the packet's own §8 reproducibility rule) · §9's Authority Map row has no level/version/frozen values or fold-target filename · the 0·0·0 gate is asserted while two open questions and an unperformed binding check remain · filename version-ordering convention · §4 misquotes the entitlement row (drops backticks and `(illustrative)`).

## §4 — OBSERVATIONS (no action)

**Production is GENUINELY NEUTRAL** — independently verified across every consumer: `{ template, name }` only, `Template A`…`Template E`, no description/emphasis/pageModel/thumbnail/ordering/default, `templateEntry` refuses the default fallback (absence in ⇒ absence out) · **altitude discipline clean** — no prototype, planning companion or self-citation treated as authority · **supersession completeness clean** — only two name-binding sites exist in the frozen corpus and both are identified · `TEMPLATE_CATALOG` carries no entitlement dimension (matters once wired) · `SECTION_ARRANGEMENT_PRESETS` is five items adjacent to a five-template enum.

## §5 — Verified TRUE (recorded so the packet's sound parts are not relitigated)

Both quotes — `Master…FINAL.md:569` and `ADR_Compendium_v1.md:1008` — are **verbatim, character-for-character** (byte-checked), and both clauses are genuinely **unamended**. §0's core premise correction is sound: the corpus does **not** treat A–E as opaque slots; this **is** a rank-0/rank-1 remap. §5.1/§5.2 repository evidence is accurate in every cell. §5.3's narrowing to a repository-scoped claim, with an explicit refusal to assert absence of out-of-band data, is correct and rigorous. §4's PROHIBITED (vendor-type locking) vs PERMITTED (entitlement availability) distinction is sound. §10.5 correctly declines to close `ESC-MKT-VENDORTYPE`. §8's review-method critique is correct and was independently reproduced.

## §6 — Board disposition and mandatory carry-forward

```
Review-A                ACCEPTED
Packet                  PARKED
Revision authorization  NOT YET GRANTED
Unblocking condition    Instrument 1 approved AND folded
Name ruling             REQUIRED before substantive redrafting (M1)
B3 / B4 / B5            RECORDED AND MANDATORY — must be fixed in the authorized revision
Coordination control    REQUIRED → `RankZero_Instruments_Coordination_Register_v1.0.md`
```

No revision may be drafted until the unblocking condition is met **and** revision authorization is
granted. B3, B4 and B5 are internal defects independent of the mechanism question and are mandatory
in whatever revision is eventually authorized; they are **not** to be fixed now.

---

*Review-A performed by three independent adversarial reviewers under `CLAUDE.md` §13. Findings are
raised claims, not mandates (Raise ≠ Accept); the Board ruled on them 2026-07-21. This record is
non-authoritative and coins nothing.*
