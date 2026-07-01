# Team 3 — Vendor Microsite Single-Page → Multi-Page Migration · Prep Artifacts

**Team:** 3 (Integration & QA Support)
**Status:** PREP / pre-ADR · **DRAFT v0.1** · no code changed
**Board decision:** *"Start the preparation deliverables now. Do not start implementation."*
**Gate:** every code activity (route change, stub removal, nav refactor, component cleanup,
regression against a partially-migrated app) remains **HELD** until:

1. ADR (Vendor Public Microsite IA Revision) approved **by the owner** (human §8 gate);
2. Doc-7D updated (Doc-2 **NOT** touched — Board overruled the plan's Phase 0 on this point);
3. Team 1 completes the shared layout + route navigation;
4. Team 2 completes all seven content pages;
5. a feature-complete multi-page microsite exists for integration.

These five documents are **review artifacts only**. They coin no architecture, change no
code, and assert no target as final — every "future" route/owner is **provisional pending the
ADR + Doc-7D update**.

## Index

| # | File | Purpose |
|---|------|---------|
| 1 | `01_Regression_Baseline_v0.1.md` | Canonical snapshot of today's microsite (Phase-1 parity reference). |
| 2 | `02_Anchor_Redirect_Inventory_v0.1.md` | Current anchors/stubs → future routes; the end-state removal checklist. |
| 3 | `03_Reuse_Register_v0.1.md` | Component × page matrix + reuse-risk — Team 3's primary QA artifact. |
| 4 | `04_Routing_Smoke_Matrix_v0.1.md` | Verification checklist for the migrated site (unexecuted). |
| 5 | `05_Backend_Readiness_Matrix_v0.1.md` | Per-page data owner / projection / readiness for later wiring. |

## Findings raised during prep (Raise ≠ Accept)

All four **ACCEPTED by the Board**. Resolution of P-01/P-02 belongs to **Team 1** in the
ADR/Doc-7D update; P-03/P-04 refinements are folded into these artifacts (below).

- **T3-P-01 (MEDIUM) — ACCEPT.** Plan §2 puts `CapabilitySection` on **Home**, yet routes
  `/capabilities` → **`/about`**. Genuine IA inconsistency. Board: **Team 1 decides in the ADR** —
  either Home teaser + About owns full content, or Capabilities becomes its own page. See Reuse Register.
- **T3-P-02 (MINOR) — ACCEPT.** Current nav ([vendor-microsite-navigation.tsx](../../app/(public)/_components/microsite/vendor-microsite-navigation.tsx))
  exposes **9** anchors but the page renders **15** sections — 6 (mission, why, statistics, history,
  management, downloads, faq) have **no** nav entry. Board: multi-page nav is **redesigned
  intentionally, not copied** — orphan sections become parent-page content, subsections, or are
  removed. Team 1 owns in the ADR. See Baseline + Inventory.
- **T3-P-03 (MINOR) — ACCEPT (Board recommendation folded in).** `WhyChooseUs` and `CompanyFaq`
  had no owner. **Board rec:** `WhyChooseUs` → **Home only**; `CompanyFaq` → **About** (linked from
  Contact if needed); **no separate nav item.** Applied to Inventory §C + Reuse Register (marked
  provisional — Team 1 confirms in the ADR).
- **T3-P-04 (OBS) — ACCEPT.** Readiness must explicitly distinguish **UI-ready** (seed/editorial) ·
  **Backend-ready** (wired) · **Blocked-by-ESC** · **Deferred**, so Team 2 never assumes backend
  integration exists where it does not. Four-state taxonomy applied to Deliverable 5.

## Commit sequence (Board-ruled)

Files stay **uncommitted** — no approved ADR, no updated Doc-7D, no implementation yet; committing
now would create history needing amendment after ADR approval. Commit only **after** Board ACK of
the ADR, as one governance commit:
`docs(team3): add microsite multipage QA preparation artifacts`.
Order: Team 1 ADR → owner approval → Doc-7D update → Board ACK → **commit these** → Team 1 impl →
Team 2 impl → Team 3 integration.
