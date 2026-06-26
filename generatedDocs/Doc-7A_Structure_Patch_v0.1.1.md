# Doc-7A — Structure **Patch v0.1.1** (applies Independent Hard Review v0.1) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-7A_Structure_Proposal_v0.1.md` |
| Applies | `Doc-7A_Structure_Independent_Hard_Review_v0.1.md` (2 MAJOR + 3 MINOR + 2 NITPICK; 1 REJECTED) |
| Date | 2026-06-26 |
| Effective state | Proposal v0.1 **+ this patch** = freeze-ready structure (**v0.2-equivalent**) |
| Status | **PATCH APPLIED — short re-review PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Structure Freeze Audit → `Doc-7A_Structure_v1.0_FROZEN` |
| Discipline | Additive; nothing coined; no frozen document edited. Each change cites its finding |

---

## Changes (each closes a review finding)

### C-1 — closes **MAJOR-1** (Communication embedded-component split owner)
Add the following **Cross-Surface Embedded-Component Allocation Table** to the program partition (replacing the prose paragraph "Cross-surface embedded module components …" with this explicit single-owner mapping):

| Embedded component | **Defining document** (defined once) | Composing surfaces (consume, never re-implement) | Contract owner |
|---|---|---|---|
| Trust badge / score chip (read) | Doc-7B (Design System) | Doc-7D, 7E, 7F, 7G, 7H | M5 `Doc-5G` |
| Global notification center | Doc-7C (App Shell) | all authenticated surfaces (7E–7H) | M6 `Doc-5H` |
| RFQ / quotation conversation thread | Doc-7B (presentation) + mounted by Doc-7C shell slot | Doc-7F, 7G (embedded in the RFQ/quotation views) | M6 `Doc-5H` |
| Billing / entitlement indicator | Doc-7B (Design System) | Doc-7E (primary), 7F/7G (quota/entitlement hints) | M7 `Doc-5I` |
| AI advisory panel | Doc-7B (Design System) | per consuming surface (7D read · 7F/7G advisory) | M9 `Doc-5K` |

**Rule (binding):** a shared embedded component is **defined once** in its defining document and **composed** by the surfaces; **no surface re-implements it**. The **contract owner is the module (`Doc-5x`) regardless of where the component renders** — the surface composes, the module owns the data and state. Any genuinely unresolved standalone-vs-embedded allocation carries `[ESC-7-DESIGN]` (e.g. should the notification center become its own destination view) — resolved per-surface at content, never coined here. *No module's UI is orphaned: M5/M6/M7/M9 each have a single defining document above.*

### C-2 — closes **MAJOR-2** (Doc-7C ↔ Doc-7E Doc-5C ownership overlap)
Disambiguate the `Doc-5C`/active-org seam in R1, the partition table, and §4:

- **Doc-7C (App Shell & Data Layer) owns the active-org context *boundary + mechanism***: server resolution of the active org (client org ID never trusted — R6), the persistent **org-switcher control**, and the session/auth boundary — cross-cutting infrastructure every authenticated surface inherits.
- **Doc-7E (Account & Identity shell) owns the *management destination screens***: membership / role / delegation administration and the account / subscription / platform-invoice views.
- **Seam statement (binding):** no `Doc-5C` contract is realized by both documents — 7C realizes the *context/switcher mechanism*; 7E realizes the *identity & account management screens*. Partition-table "Realizes" cells updated accordingly (7C: "+ org-switcher control & session boundary"; 7E: "membership/role/delegation **management screens** + account/billing views").

### C-3 — closes **MINOR-1** (favorites mis-scoped to anonymous Doc-7D)
**Verified `Doc-5D §7 / BC-MKT-7`:** favorites = User command/Query (membership-only). Re-scope:
- **Doc-7D (Public, anonymous):** "anonymous marketplace discovery, vendor microsites & public profiles, public category/product browse, **ads read**" — **favorites removed**.
- **Favorites** (`add/remove/list_catalog_favorite`) move to the **authenticated** consumer — realized in the **Buyer/Vendor workspace (Doc-7F/7G)** discovery views and/or the Account shell (Doc-7E), as a membership-scoped action. Final placement is a content-pass detail; it is **not** on the anonymous surface.

### C-4 — closes **MINOR-2** (Bengali/English locale coinage)
**Verified:** corpus mandates BDT currency (Master Architecture line 79) but **no UI locale**. R11 and §10 amended:
- Strike "Bengali/English"; replace with **"i18n / localization-readiness — the locale set is a product requirement, not fixed by Doc-7"** (mechanism retained: localized copy is presentation; authoritative data is module-owned).
- **Currency-per-field, default BDT, never assumed** (Doc-2 §0.4) is **retained** — corpus-grounded.

### C-5 — closes **MINOR-3** (`§8.5` anchor does not exist)
Replace every `Doc-5_Program_Governance_Note §8.5` with **`§8 (rule 5)`** throughout (header "Authority" + "Consistency obligation" rows, R2, R4, §0, §2, §12, carried-items `[ESC-7-API]`, provenance). The note's §8 is a flat numbered list (rules 1–6); the sibling-program rule is rule 5.

### C-6 — closes **NITPICK-1** (Doc-4M-conform vs Doc-5A-consistency)
Add to R2 (and echo in §0): **"Doc-4M is rank-0 frozen architecture (upstream — the UI *conforms* to it); Doc-5A is a sibling Implementation-Contract layer with no conformance authority over Doc-7 (consistency only — §8 rule 5). The two *what*-inputs differ in force: conform to Doc-4M/Doc-2; stay consistent with the Doc-5 contract surface."**

### C-7 — closes **NITPICK-2** (terminology drift)
§3 canonical terms amended to admit **"screen" as a synonym of "view"** (a rendered page within a surface), so existing "screen" usages in the header/R-set/Appendix A are consistent. Canonical set: **surface · route · view (= screen) · component**.

---

## REJECTED finding — no change
The review's REJECTED item (claim that treating Doc-4M as conformance contradicts the consistency rule) stands rejected; C-6 adds the clarifying clause that forecloses the misreading. No structural change.

---

## Short Re-Review (closure verification — "is it fixed or not?")

Independent pass over each finding against the patched effective state:

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 Communication split owner | MAJOR | C-1 allocation table: single defining doc per component + "no surface re-implements" + module contract-owner rule | **CLOSED** — single-owner mapping is explicit; no module UI orphaned |
| MAJOR-2 7C↔7E Doc-5C overlap | MAJOR | C-2 seam: 7C = context/switcher mechanism; 7E = management screens; "no contract realized twice" | **CLOSED** — boundary unambiguous |
| MINOR-1 favorites on anonymous 7D | MINOR | C-3 removed from 7D; moved to authenticated consumer (verified vs Doc-5D BC-MKT-7) | **CLOSED** — anonymous surface no longer claims a membership-only contract |
| MINOR-2 Bengali/English coinage | MINOR | C-4 de-named locales; kept i18n mechanism + BDT currency (corpus-grounded) | **CLOSED** — no locale coined |
| MINOR-3 `§8.5` anchor | MINOR | C-5 → `§8 (rule 5)` everywhere | **CLOSED** — anchor precise |
| NITPICK-1 conform vs consistency | NIT | C-6 clause added | **CLOSED** |
| NITPICK-2 screen/view drift | NIT | C-7 "screen = view" admitted | **CLOSED** |

**Re-review verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** No new finding introduced by the patch; no anchor regressed; nothing coined. The structure is **freeze-ready** (governance §8 rule 1 satisfied).

**Next in the Board-directed sequence:** Structure Freeze Audit → `Doc-7A_Structure_v1.0_FROZEN` → Doc-7A **content passes** (the conventions §0–§12 + Appendix A check IDs), each through the same loop (Pass → Hard Review → Fix → short re-review → next pass).

*End of Structure Patch v0.1.1 + Short Re-Review. Effective structure = Proposal v0.1 + this patch. Additive; nothing coined; no frozen document edited.*
