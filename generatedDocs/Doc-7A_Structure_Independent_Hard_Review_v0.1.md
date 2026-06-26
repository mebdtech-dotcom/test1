# Doc-7A — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7A_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · No Architecture Redesign · No Ownership Reallocation |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 2 MAJOR + 3 MINOR open; 2 NITPICK; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT (sample — 30+)

Programmatically confirmed against the frozen corpus:

- `Doc-5_Program_Governance_Note_v1.0 §1` (program purpose), `§3` (source-of-truth hierarchy + reference-never-restate), `§8` (staged-freeze + sibling-program rule).
- `Doc-2 §0.4` currency — **verified**: `Master_System_Architecture_v1.0_FINAL` line 79 ("platform currency is **BDT** … currency captured explicitly on every value field so multi-currency support can be introduced without schema redesign"). R11 currency-per-field is CORRECT.
- `Doc-4M` = authoritative lifecycle/state authority (rank-0 corpus) — CORRECT basis for R9.
- `Doc-5A §5.6` (envelope), `§6.2` (error taxonomy), `§8` (cursor pagination) — exist and are the right anchors for R4/§5.
- Invariants #2 (Buyer/Vendor/Hybrid participation — confirmed `Master Architecture` line 328), #5 (Users Act/Orgs Own), #9 (Content≠Presentation), #10 (entitlement ≠ plan-name), #11 (private exclusion), #12 (AI suggests/modules decide) — all correctly invoked.
- `CLAUDE.md §2` (stack: Next.js 15 App Router + React + Tailwind + shadcn/ui; RLS-as-backstop / app-layer authz), `§5` (client org ID never trusted) — CORRECT.
- `Doc-5I R10` (entitlement service authority), `Doc-5K R7` (regenerable TTL cache) — CORRECT.

0 BLOCKER. The R-set spine (R1–R12), surface partition, and §-map are structurally sound and reference-never-restate is largely honored. The findings below are coverage/ownership gaps and three anchor/scope defects.

---

## Findings

### MAJOR-1 — Communication (M6) embedded-component allocation is split with no single owner → duplication / inconsistency risk
The partition declares Communication a "cross-surface embedded component," then places the **notification center in Doc-7C (App Shell)** while **RFQ/quotation threads embed in Doc-7F/7G (workspaces)**. Two documents realize the same M6 (`Doc-5H`) contracts with no allocation rule binding them — the classic split-ownership defect the corpus forbids at the module layer (One Module, One Owner) and which re-emerges here at the surface layer. Risk: divergent thread/notification components, inconsistent delivery-state rendering, duplicated `Doc-5H` bindings.
**Required fix:** add an explicit **cross-surface embedded-component allocation table** to the partition: each embedded module surface (M5 badge, M6 notification center, M6 thread, M7 billing indicator, M9 panel) names its **single defining document** (the shared component is defined once in Doc-7B/7C) and its **composing surfaces** (which consume it). State that the contract owner is the module (`Doc-5x`) regardless of where the component renders, and that no surface re-implements a shared embedded component. Promote the open allocation question to `[ESC-7-DESIGN]` only for genuinely unresolved cases.

### MAJOR-2 — Doc-7C (App Shell) ↔ Doc-7E (Account/Identity shell) overlap on the Doc-5C / active-org surface → ambiguous ownership
Both documents realize `Doc-5C`: Doc-7C claims "the server-resolved active-org context … org-context boundary," and Doc-7E claims "organization context switching, memberships/roles/delegation." The org-**switcher** and the active-org **context** straddle both — ambiguous which document owns the switcher UI vs the membership-management screens. Two docs realizing overlapping `Doc-5C` surface = boundary defect.
**Required fix:** disambiguate in R1/the partition + §4: **Doc-7C (App Shell) owns the active-org context *boundary + mechanism*** (server resolution, the persistent org-switcher control, session) as cross-cutting infrastructure every surface inherits; **Doc-7E (Account/Identity shell) owns the *management screens*** (membership/role/delegation administration, account/subscription/invoice views) as a destination surface. State the seam explicitly so no `Doc-5C` contract is realized twice.

### MINOR-1 — Favorites mis-scoped onto the anonymous Public surface (Doc-7D)
Doc-7D lists "ads/favorites **read**" on the **anonymous** Public surface. **Verified against `Doc-5D_Structure_v1.0_FROZEN` §7 / BC-MKT-7:** `add_catalog_favorite` / `remove_catalog_favorite` / `list_catalog_favorites` are **"User command / Query (membership-only, no slug)"** — favorites are authenticated User-scoped, **not** anonymous. Listing them on the Public (anonymous) surface contradicts the frozen Doc-5D actor.
**Required fix:** remove favorites from Doc-7D's anonymous scope. Doc-7D reads public catalog/products/microsites/ads only; **favorites move to an authenticated surface** (Buyer/Vendor workspace or Account shell — the membership-scoped consumer). Ads *read* may remain public.

### MINOR-2 — R11/§10 names "Bengali/English" locales the corpus does not mandate → coinage risk
R11 and §10 specify "**Bengali/English** i18n-readiness." **Verified:** the Master Architecture mandates the **BDT currency** explicitly (line 79) but states **no UI locale/bilingual requirement**; grep of the frozen corpus surfaces no Bengali/English UI mandate. Naming specific locales coins a product-scope decision Doc-7 has no authority to make (realize-never-redecide).
**Required fix:** soften to **"i18n/localization-readiness — the locale set is a product requirement, not fixed here"** (keep the *mechanism*: localized copy is presentation, authoritative data is module-owned). Do not name locales. Currency-per-field (BDT default) stays — it is corpus-grounded.

### MINOR-3 — Anchor precision: `Doc-5 Governance Note §8.5` does not exist
The proposal repeatedly cites `governance §8.5`. The note's §8 is a **flat numbered list (rules 1–6)**; there is no sub-section "§8.5." The sibling-program rule is **§8 rule 5**.
**Required fix:** replace every `§8.5` with `§8 (rule 5)` (or `§8.¶5`). Mechanical, but anchor precision is a freeze-gate discipline.

### NITPICK-1 — Make the Doc-4M-conform vs Doc-5A-consistency distinction explicit (preempts the rejected reading below)
R2/§0 treat Doc-4M as a binding *what*-authority (UI **conforms**) and Doc-5A as **consistency-only**. Both are correct but the proposal never states *why* they differ in force. Add one clause: **Doc-4M is rank-0 frozen architecture (upstream — conformance-bearing); Doc-5A is a sibling Implementation-Contract layer (no conformance authority over Doc-7 — consistency only, per §8 rule 5).** This forecloses misreading.

### NITPICK-2 — Terminology drift ("screen" vs canonical "view")
§3 canonicalizes **surface / route / view / component**, but "screen" leaks into the header, R-set, and Appendix A. Align to the canonical terms (or admit "screen" as a synonym of "view" in §3).

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Treating Doc-4M as conformance-bearing contradicts the proposal's own 'consistency not conformance' rule — Doc-7 has no conformance master, so Doc-4M must be consistency-only too."* | **REJECTED (false).** Doc-4M is **rank-0 frozen architecture** (the Doc-4 series — authoritative lifecycle/state authority), strictly upstream of Doc-7 in the source-of-truth chain (governance §3); the UI genuinely **conforms** to it. The "consistency-not-conformance" carve-out applies **only** to `Doc-5A`, a *sibling* Implementation-Contract layer with no authority over peer programs (governance §8 rule 5). Conflating an upstream authority with a sibling is the error. No change beyond the NITPICK-1 clarification. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 Communication embedded-component split owner | MAJOR | Structure Patch — add allocation table |
| MAJOR-2 7C↔7E Doc-5C ownership overlap | MAJOR | Structure Patch — disambiguate seam |
| MINOR-1 favorites mis-scoped to anonymous 7D | MINOR | Structure Patch — re-scope per Doc-5D BC-MKT-7 |
| MINOR-2 Bengali/English locale coinage | MINOR | Structure Patch — de-name locales |
| MINOR-3 `§8.5` anchor does not exist | MINOR | Structure Patch — → `§8 (rule 5)` |
| NITPICK-1 Doc-4M-conform vs Doc-5A-consistency | NIT | Structure Patch — one clause |
| NITPICK-2 "screen" vs "view" drift | NIT | Structure Patch — align terms |

**Gate:** a structure may freeze only with no open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 2 MAJOR + 3 MINOR open → **Structure Patch required**, then short re-review to confirm closure, then Structure Freeze Audit.

*End of Independent Hard Review. Nothing coined; no frozen document edited. All challenged anchors verified against the frozen corpus (Doc-5D BC-MKT-7 favorites actor; Master Architecture line 79 currency/no-locale).*
