# iVendorz Trust Adoption Ladder — Planning & Design

**Status:** v0.3 — OWNER-APPROVED (planning approval 2026-07-10; not implementation authorization)
**Date:** 2026-07-10
**Lane:** Product planning & positioning (Track: enterprise trust adoption)
**Revision v0.2 (2026-07-10):** folded owner pre-approval adjudication Round 2 —
R2-MINOR-01 (concierge operational authority), R2-MINOR-02 (read-audit dependency),
R2-MINOR-03 (Charter clause 10 scoped to the audit model), R2-MINOR-04 (Level 5 renamed
"Enterprise Integration (Future Feasibility)"), R2-NIT-01…04. Owner approval granted
conditional on this fold; recorded in §9.
**Revision v0.3 (2026-07-10):** (a) owner directive — the Confidentiality Charter (§5.1)
is to be **extracted into a standalone buyer-facing publishable document**; this planning
document stays internal-governance; extraction plan in §5.1; no page/route coined here
(page-universe governance owns that). (b) Review-A Round 3 folded (§8): RA-F1/F2 MINORs +
RA-F4/F5 NITs applied, RA-F3 OBS recorded; gate 0 · 0 · 0.
**Authority:** NON-AUTHORITATIVE under the frozen corpus. Every architectural fact in this
document is bound **by pointer** to its frozen owner; nothing is restated as new authority.
On any conflict, the frozen document wins (CLAUDE.md §7). Amendments after any future
freeze: additive patch + version bump — no in-place edits.

> **What this is:** the planning record for the owner-adjudicated (2026-07-10) response to
> the enterprise trust problem — *"Factories don't distrust the software; they distrust
> sharing procurement information."* It records the trust maturity ladder, stage
> dispositions (including one REJECTED stage), the Enterprise Gateway feasibility answer,
> the Concierge Supplier Discovery explanation, six accepted trust measures, GTM
> positioning, and the `ESC-TRUST-*` escalation register.
>
> **What this is not:** not an architecture change, not a wave/roadmap re-sequencing, not
> implementation authorization for Stage 4 or Stage 5, not a new module, signal, page, or
> contract. It coins no entity, slug, event, state, or POLICY key.

**Frozen anchors (reference, never restate):**

| Anchor | Owner | Pointer |
|---|---|---|
| No public RFQ board — RFQs are distributed, never published (FIXED) | M3 / Doc-3 | `generatedDocs/Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` §5.1 |
| Disclosure Rule — private until distribution; invited vendors only | ADR-013 (Amendments v0.3) | `generatedDocs/ADR_Compendium_v1.md` (ADR-013) |
| AI Data Usage Rule — never train public AI models on private RFQ content | ADR-013 (Amendments v0.3) | `generatedDocs/ADR_Compendium_v1.md` (ADR-013) |
| Data ownership — organizations own business data; platform owns platform intelligence | ADR-013 | `generatedDocs/ADR_Compendium_v1.md` (ADR-013) |
| Vendor RFQ reads grant-scoped to `rfq_invitation_grantees`; NOT_FOUND/no-access indistinguishable | M3 / Doc-4E (+ Doc-4A §7.5) | `generatedDocs/Doc-4E_PassA_v1.0_FROZEN.md` (`get_rfq.v1` AI-Agent Notes) |
| Private exclusion stays private, forever; excluded vendor byte-equivalent to non-match | Invariant #11 / Doc-7G | CLAUDE.md §5 Inv. 11; `generatedDocs/Doc-7G_Structure_v1.0_FROZEN.md` (governing rule) |
| Vendor sees only its own quotation outcome — never winner, winning quote, or ranking | Doc-7G | `generatedDocs/Doc-7G_Content_Pass2_Patch_v1.0.1.md` §7.3 |
| Buyer Private CRM (statuses, notes, ratings, favorites) — buyer-private, non-disclosing | M4 BC-OPS-1 / Doc-4F | `generatedDocs/Doc-4F_PassB_Part1_BC-OPS-1_Buyer_Private_CRM_v1.0.md` |
| RFQ internal approve/reject before submission (org-internal control step) | Doc-2 §9 | `generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` §9 (RFQ audit-action row) |
| Entitlements, never plan-name checks | M7 | CLAUDE.md §3 boundary notes; Doc-4I |
| Money boundary — platform never handles buyer↔vendor transaction money | Architecture | CLAUDE.md §1; `generatedDocs/Master_System_Architecture_v1.0_FINAL.md` |
| No REST endpoint / SSE / WebSocket / webhook for any engine mechanism (R5) | M3 realization / Doc-5E | `generatedDocs/Doc-5E_Content_v1.0_Pass3.md` (R5 attestation) |
| M2 public discovery reads (`list_vendor_directory`, `search_catalog`) | M2 / Doc-4D · Doc-5D | `generatedDocs/Doc-4D_Content_v1.0_PassA.md` · `generatedDocs/Doc-5D_Structure_v1.0_FROZEN.md` |

---

## 0. Governance Frame (binding on every section below)

- **G-1 — Coins nothing.** No new entity, contract slug, event, state, page ID, POLICY
  key, or governance signal is introduced here. `ESC-TRUST-*` handles are escalation
  register entries (the established ESC mechanism), not contracts.
- **G-2 — Reference, never restate.** Frozen facts appear only as pointers to the anchors
  table above.
- **G-3 — No wave reorder.** The build sequence remains owned by
  `generatedDocs/Build_Roadmap_v1.0.md`. This document changes positioning and packaging
  emphasis only.
- **G-4 — Implementation authorization is separate.** Nothing here authorizes building
  Stage 4 or Stage 5, or any wiring. The only code change riding with this package is the
  presentation-only privacy-affordance set (§5.3), which composes existing kit primitives
  and adds no route, toggle, or data flow.
- **G-5 — Rejected means recorded, not deleted.** Rejected options are kept with their
  disposition per the Validate-Findings discipline (CLAUDE.md §13).
- **G-6 — Flag-and-Halt upward.** Any item that touches a frozen rule (notably §3 G3) is
  escalated via its ESC handle to the human Board; never resolved locally.

---

## 1. The Trust Problem & the Maturity Ladder

An RFQ can reveal confidential business intelligence: product launches, expansion plans,
equipment upgrades, capacity increases, budget estimates, preferred suppliers, sourcing
strategy. Enterprise buyers therefore resist *sharing procurement information* long before
they evaluate software quality. The strategic answer is a ladder that delivers value
**before** asking for any confidential artifact:

**Trust → Supplier Discovery → Shortlisting → Private RFQs → Deeper Procurement
Collaboration** — not **RFQ Posting → Trust**.

| Level | Buyer trust posture | Platform access to buyer data | Corpus status |
|---|---|---|---|
| 1 | Search & qualify suppliers | None (no RFQ) | **Exists** — M2 discovery + M5 trust/verification (frozen) |
| 2 | Build private supplier shortlists | None (no RFQ) | **Exists** — M2 `catalog_favorites` + M4 BC-OPS-1 private CRM (frozen) |
| 3 | Private invitation-only RFQ | Limited (RFQ content, distribution-scoped) | **Exists** — the ONLY RFQ model the corpus permits (Doc-3 §5.1 FIXED) |
| 4 | Full RFQ management + post-award | Complete workflow | **Exists** — M3 + M4 (frozen), build-wave gated |
| 5 | Enterprise Integration (Future Feasibility) | Enterprise gateway | **Not in corpus** — feasibility only, §3; exploratory, not a committed roadmap item |

A large enterprise may stay at Level 1–2 indefinitely; the ladder treats that as a served
customer, not a failed conversion. Commercial packaging of levels maps to **M7
entitlements** (boolean/numeric/enum entitlements — never plan-name checks, per the frozen
M7 boundary rule).

---

## 2. Stage Dispositions (owner-adjudicated 2026-07-10)

### 2.1 Stage 1 — Vendor Intelligence Platform · **EXISTS — packaging work only**

Search verified vendors, compare capabilities (the 4-flag capability matrix, Invariant
#1), certifications, industries, trust scores, shortlists — all owned by frozen M2/M5/M4
surfaces (anchors table). No architecture work. The deliverable is positioning (§6) and
the Confidentiality Charter (§5.1).

### 2.2 Stage 2 — Private RFQ · **EXISTS — the only RFQ model; affordance work only**

The frozen model is stronger than the proposal that prompted this document: RFQs are
distributed, never published (Doc-3 §5.1 FIXED); vendor reads are invitation-grant-scoped
with NOT_FOUND collapse; an invited vendor sees only its own invitation and its own
quotation outcome; excluded vendors are byte-equivalent to non-matches (Invariant #11).

**Gap found:** the guarantees are invisible in the UI. There is no "public RFQ" concept,
so there is **no public/private toggle** (owner ruling 2026-07-10 — a toggle would coin a
foreclosed concept). Resolution = the always-private affordance set (§5.3).

### 2.3 Stage 3 — Anonymous Discovery · **REJECTED — owner ruling 2026-07-10**

Proposal: buyer-anonymous demand postings (spec visible, identity withheld until buyer
chooses). **REJECTED — recorded per Validate-Findings discipline; do not implement.**
Rationale recorded with the disposition: anonymous demand postings re-introduce the
price-fishing / quote-dumping / fake-demand-probing pathology that Doc-3 §5.1 explicitly
rejected the public RFQ board for, and they weaken invitation credibility — the response
rate Doc-3 treats as the marketplace's most fragile health metric. Terminal; any revival
requires a new owner decision, not a reinterpretation of this record.

### 2.4 Stage 4 — Enterprise Gateway · **Feasibility analysis in §3; gated `ESC-TRUST-GATEWAY`**

### 2.5 Stage 5 — Concierge Supplier Discovery · **Explained in §4; owner "may be planned"**

---

## 3. Enterprise Gateway (SAP/ERP) — Feasibility Analysis

**Owner question: "Is it possible?" Answer: yes — in phases, with one frozen-rule
boundary that only the Board can move.**

**This section evaluates technical feasibility only and does not authorize
implementation, architectural changes, or roadmap prioritization.**

The enterprise need: procurement officers may not log into external platforms; the
company controls what leaves its firewall. Three technically distinct shapes:

- **G1 — Manual bridge (feasible now; zero architecture change).** Structured
  export/import documents (CSV/XLSX/PDF). The enterprise exports requirements from its
  ERP; an internal procurement admin reviews and submits only approved fields; results
  (shortlists, quotation comparisons the buyer already owns) are exported back as
  documents. Nothing crosses the enterprise firewall automatically; iVendorz builds at
  most import/export formatting. This is process design plus document templates, not
  integration software.
- **G2 — Pull-based integration API (feasible; Board-gated).** An enterprise-side client
  *polls* buyer-scoped read contracts using service credentials. Because the enterprise
  pulls, this avoids the frozen prohibition on push channels (Doc-5E R5: no REST engine
  facade, no SSE/WebSocket, no webhook for engine mechanisms). It still requires Board
  decisions that do not exist today: an integration API surface definition, a
  service-credential/auth model under M1, and rate/entitlement treatment under M7.
- **G3 — Push integration (webhooks / deep SAP connector) — conflicts with frozen
  Doc-5E R5.** Flag-and-Halt class: feasible engineering-wise, foreclosed
  governance-wise until the Board rules via an additive patch. **Not proposed.**

Sequencing reality: all shapes presuppose live M3 wiring (Wave 4+) and enterprise demand
evidence; realistic placement is Wave 6+. All gated behind **`ESC-TRUST-GATEWAY`** (§7).

---

## 4. Concierge Supplier Discovery — Full Explanation

**What it is.** A human-executed service for enterprises that will never post an RFQ
externally: the buyer states a need in plain language ("we need 10 qualified vendors for
industrial pumps"); iVendorz operations staff research candidates using the vendor
directory, capability matrix, and M5 verification data; the buyer receives a verified
shortlist document and runs its RFQ **off-platform** (own email/ERP). **iVendorz never
sees the RFQ.**

**Ownership.** This is an operational service executed by platform operations using
existing Marketplace and Trust capabilities. No new bounded context, workflow engine, or
procurement module is introduced. Platform operations may assist with supplier discovery
but never make supplier selection, procurement, commercial, or award decisions on behalf
of the buyer.

**Why it is safe under the frozen rules.**
- Revenue is iVendorz's **own service fee** — the same permitted own-revenue class as
  subscriptions, lead packages, ads, and fees (CLAUDE.md §1; M7). Zero buyer↔vendor
  money touches the platform: the money boundary holds.
- Staff act under existing staff roles on existing surfaces (M2 directory, M5
  verification, M8 console). The buyer's need statement is handled as ordinary
  org-private business data under ADR-013 ownership rules.

**Why it is strategic.**
- **Zero-build pilot:** the service can start with no code — intake by form/email, research
  on existing surfaces, delivery as a document.
- **Flywheel:** every engagement improves directory data quality and surfaces
  vendor-onboarding leads.
- **Ladder entry:** it converts Level-1 enterprises into revenue relationships before any
  software trust exists, and every delivered shortlist demonstrates exactly the
  verification quality that later justifies Level 2–3 adoption.

**Boundaries.** Any future software support for the service (e.g., a request-tracking
surface) is a separate, gated decision — not part of this plan. Staff never fabricate or
hand-edit governance signals (scores remain System-actor-calculated, CLAUDE.md §4).

---

## 5. Accepted Trust Measures (owner: "all accepted", 2026-07-10)

### 5.1 Confidentiality Charter — productize the frozen privacy rules

A plain-language, buyer-facing document (and landing trust section) in which **every
clause is a pointer to an already-frozen rule** — the charter coins nothing; it
translates. Clause skeleton (each cites its anchor from the table above):

1. Your RFQ is never published — there is no public RFQ board. *(Doc-3 §5.1)*
2. Only vendors matched by your routing preferences or explicitly selected by you can
   access it. *(ADR-013 Disclosure Rule; Doc-4E grant-scoped reads)*
3. Un-invited vendors cannot even detect that your RFQ exists. *(Doc-4E / Doc-4A §7.5
   NOT_FOUND collapse)*
4. Competing vendors never see each other's quotations, your comparison, or your ranking.
   *(Doc-7G §7.3)*
5. Your private vendor lists — approved, conditional, blacklisted — are invisible to
   everyone, forever. *(Invariant #11; BC-OPS-1)*
6. Your procurement data never trains public AI models. *(ADR-013 AI Data Usage Rule)*
7. Your organization owns its business data. *(ADR-013 ownership table)*
8. Your organization controls what leaves — submission is permission-gated, with an
   internal approval step where your organization requires one. *(Doc-2 §9 RFQ internal
   approve/reject — org-conditional per the frozen state machine; M1 roles & delegation)*
9. We never handle your transaction money — no escrow, wallet, or settlement.
   *(money boundary)*
10. Platform actions are recorded according to the platform audit model. *(M0 audit;
    Invariant #8 — scoped to the audited actions the frozen corpus guarantees; read-access
    coverage is under `ESC-TRUST-READAUDIT`, §5.6)*

**Extraction & publication (owner directive 2026-07-10, v0.3).** The Charter is a buyer
trust asset, not an internal artifact — it is to be extracted into its **own standalone,
buyer-facing publishable document**, referenceable from marketing pages, onboarding flows,
RFQ creation surfaces, and enterprise sales materials. This planning document remains
internal governance; §5.1 stays the Charter's specification of record until extraction.
Candidate public homes named by the owner as examples (not rulings):
`/legal/confidentiality-charter` · `/about/privacy-by-design`. The actual route and page
ID are assigned through the standard page-universe governance (page IDs are Board-only;
the coverage invariant applies) — **no page or route is coined by this document.** The
extracted charter text goes through the standard review lanes before any public use.

### 5.2 Approval-chain positioning

Market the existing org-internal control step: RFQ internal approve/reject (Doc-2 §9)
plus the two-dimension role model and delegation (M1) already deliver the enterprise
gateway's core promise — *the company controls what leaves* — with zero new software.

### 5.3 Draft-workspace value — the always-private affordance set (code, this package)

Presentation-only UI copy composed from existing kit primitives; no route, toggle,
field-model change, or wiring. **"Privacy by Design" is the canonical trust phrase across
all buyer procurement surfaces — not only RFQ** (any future buyer-side privacy affordance
reuses this exact phrase, never a variant).

- **New-RFQ page callout** (kit Callout/Alert + kit lock icon):
  "**Privacy by Design** — Your RFQ is never publicly published."
  Plus one helper line in Vendor preferences: "Routing preferences affect vendor matching
  only. They never make an RFQ public." (Routing must never read as access control.)
- **Submit-preview privacy block** (on the preview document):
  "**Privacy:** Private RFQ · **Visibility:** Only vendors matched by your routing
  preferences or explicitly selected by you · **Internal:** Budget and routing
  preferences remain confidential."
- **Buyer RFQ list subtext:** "Your RFQs are never public — no vendor can see them
  except those invited to quote." (Vendor-scoped claim per Review-A RA-F1 — an absolute
  "only your org + invited vendors" claim would deny the frozen moderation stage and
  staff visibility; privacy copy never overpromises past the corpus.)

### 5.4 Field-level disclosure audit — gated `ESC-TRUST-FIELD-DISCLOSURE`

A planning-level review of exactly which RFQ fields an invitation discloses to invited
vendors, with a minimum-necessary ruling. Note: the current preview document already
excludes budget, routing preferences, and urgency from the vendor-facing rendering.

### 5.5 NDA / terms gate — gated `ESC-TRUST-NDAGATE`

Vendor accepts confidentiality terms before opening invitation details (M3/M6 surface
question). Process-level; needs owning-module contract review before any design.

### 5.6 Buyer-visible access transparency — gated `ESC-TRUST-READAUDIT`

"Who accessed my RFQ, and when" for buyers, backed by M0 audit. Requires verification
that read access is auditable at all (the audit model may cover mutations only) — no
design until that is answered. If immutable read-access auditing is not already supported
by the platform audit model, implementation remains blocked until Board approval defines
the required capability.

---

## 6. GTM Positioning (owner: "all accepted", 2026-07-10)

- **Levels 1–2 are the launch product** for enterprise buyers: "find and qualify better
  industrial suppliers — privately." The RFQ engine is the earned second act, not the
  entry ask. Levels 1–2 are commercial positioning of existing frozen capability — not a
  different product architecture.
- This aligns with — and does not reorder — the gated build sequence (identity/core →
  public discovery FE → RFQ wiring). The change is emphasis: discovery, verification, and
  private shortlisting are marketed as complete standalone value.
- Commercial packaging of ladder levels is expressed through M7 **entitlements** only.
- The Confidentiality Charter (§5.1) is the flagship trust asset on public surfaces.

---

## 7. Escalations & Open Items (ESC-TRUST register)

**Register note:** handles follow the established `ESC-<DOMAIN>-<SLUG>` convention and
live in this document per the ESC-SRCH precedent (doc-internal register; the root
`esc_registry.md` is not modified by this package). Every handle is Board-channel; none
blocks the §5.3 affordance set. ESC entries record planning questions only and do not
authorize implementation.

| ID | Item | Why it's gated |
|---|---|---|
| `ESC-TRUST-GATEWAY` 🟠 OPEN (raised 2026-07-10) | Enterprise integration surface: G2 pull-API definition (auth/service credentials under M1, entitlements under M7); G3 push channels | G2 has no corpus-defined integration API surface; G3 conflicts with frozen Doc-5E R5 (no webhook/SSE/engine facade) — **Flag-and-Halt class**, Board + additive patch only |
| `ESC-TRUST-READAUDIT` 🟠 OPEN (raised 2026-07-10) | Buyer-visible "who accessed my RFQ" panel | Requires verification that M0 audit records read access (likely mutation-only); disclosure semantics of access logs need a ruling before design |
| `ESC-TRUST-FIELD-DISCLOSURE` 🟠 OPEN (raised 2026-07-10) | Minimum-necessary ruling on RFQ fields disclosed to invited vendors | Field-disclosure set is owned by frozen Doc-4E contracts; any narrowing/annotation is a contract-level question for the owning module + Board |
| `ESC-TRUST-NDAGATE` 🟠 OPEN (raised 2026-07-10) | Terms/NDA acceptance before invitation open | Touches M3 invitation lifecycle and M6 delivery surfaces; needs owning-module contract review; no frozen hook exists |

**OBS-TRUST-01** — In the current build, workspace RFQ surfaces render mock data without
authentication. This is expected during presentation-only builds and resolved by planned
Wave-4 authorization wiring — an observation, not a product defect. The privacy model is
enforced at the contract layer per the frozen anchors; the FE affordances in §5.3
communicate it, and wiring enforces it.

---

## 8. Review Adjudication Record

Adjudicated per CLAUDE.md §13 (Validate Findings gate; Raise ≠ Accept). Gate state after
Round 3: **BLOCKER 0 · MAJOR 0 · MINOR 0.**

**Round 1 — owner, pre-draft (2026-07-10), folded into v0.1:**

| Finding | Disposition | Resolution |
|---|---|---|
| R1-MINOR-01 — visibility wording must preserve buyer authority | **VALID — applied** | "matched by your routing preferences or explicitly selected by you" (§5.3 + FE copy) |
| R1-MINOR-02 — §3 must state feasibility-only scope | **VALID — applied** | Verbatim scope sentence in §3 |
| R1-MINOR-03 — §4 concierge ownership clarification | **VALID — applied** | Verbatim ownership paragraph in §4 |
| R1-NIT-01 — "Privacy by Design" canonical phrase | **VALID — applied** | Canonical everywhere |
| R1-NIT-02 — list subtext wording | **VALID — applied** | §5.3 + FE copy |
| R1-NIT-03 — OBS-TRUST-01 framing (expected, not a defect) | **VALID — applied** | §7 |

**Round 2 — owner, pre-approval (2026-07-10), folded into v0.2:**

| Finding | Disposition | Resolution |
|---|---|---|
| R2-MINOR-01 — concierge operational authority (what staff cannot do) | **VALID — applied** | §4 Ownership: never supplier selection / procurement / commercial / award decisions |
| R2-MINOR-02 — read-audit dependency must block harder | **VALID — applied** | §5.6: blocked until Board defines the capability if read auditing is unsupported |
| R2-MINOR-03 — Charter clause 10 overstated vs corpus | **VALID — applied** | §5.1 cl. 10 scoped to the platform audit model; read coverage deferred to `ESC-TRUST-READAUDIT` |
| R2-MINOR-04 — Level 5 label read as committed roadmap | **VALID — applied** | §1: "Enterprise Integration (Future Feasibility)" + exploratory note |
| R2-NIT-01 — canonical phrase spans all buyer procurement surfaces | **VALID — applied** | §5.3 declaration |
| R2-NIT-02 — routing helper must not imply access control | **VALID — applied** | §5.3 + FE copy: "Routing preferences affect vendor matching only. They never make an RFQ public." |
| R2-NIT-03 — Levels 1–2 = positioning, not different architecture | **VALID — applied** | §6 |
| R2-NIT-04 — ESC entries are planning questions only | **VALID — applied** | §7 register note |

**Round 3 — Review-A, fresh-context architecture & governance lane (2026-07-10), verdict
REVISION → adjudicated by the author per §13, folded into v0.3 (gate after fold:
BLOCKER 0 · MAJOR 0 · MINOR 0):**

| Finding | Disposition | Resolution |
|---|---|---|
| RA-F1 (MINOR) — list subtext "visible only within your organization and invited vendors" overpromises: every RFQ transits the frozen moderation stage (staff visibility) | **VALID — applied** (owner may override: this reworded owner-specified R1-NIT-02 copy) | Vendor-scoped wording: "Your RFQs are never public — no vendor can see them except those invited to quote." (§5.3 + `rfq-list-view.tsx`) |
| RA-F2 (MINOR) — anchors row 13 pointer (`Doc-4D_Structure_v1.0_FROZEN.md`) does not contain `list_vendor_directory`/`search_catalog` | **VALID — applied** | Pointer corrected to `Doc-4D_Content_v1.0_PassA.md` · `Doc-5D_Structure_v1.0_FROZEN.md` |
| RA-F3 (OBS) — preview "remain confidential" guarantee rides on the open field-disclosure ruling; same fact stated twice in one artifact (drift watch) | **RECORDED** — no action | Tied to `ESC-TRUST-FIELD-DISCLOSURE` (§5.4/§7); both statements re-checked at that ruling |
| RA-F4 (NIT) — Charter clause 8 overstated: internal approval is org-conditional in the frozen state machine | **VALID — applied** | Clause 8 reworded to permission-gated + org-conditional approval step |
| RA-F5 (NIT) — stranded section banner comment in `rfq-preview-document.tsx` | **VALID — applied** | Banner moved back above its section |

## 9. Board Decision — Planning Approval (2026-07-10)

> **STATUS: OWNER-APPROVED (planning approval)**

**Rationale (owner):** approval granted 2026-07-10 conditional on folding adjudication
Round 2 (§8); the fold is complete at v0.2.

**Effect of this approval:**
- The ladder, stage dispositions (including the Stage 3 REJECTED terminal record), the
  §5 trust measures, and the §6 positioning are the working planning baseline.
- Implementation authorization remains separate (G-4): Stage 4/5 stay feasibility/
  service-planning only; the §5.3 affordance set proceeds through the standard
  Review-A/B lanes.
- Any future planning **freeze** (additive-patch-only regime) is a separate owner
  decision recorded here when granted.

---

*End of document — v0.3 OWNER-APPROVED, 2026-07-10. Coins nothing; edits no frozen text.*
