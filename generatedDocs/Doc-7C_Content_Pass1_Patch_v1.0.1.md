# Doc-7C — Content Pass-1 **Patch v1.0.1** (applies Pass-1 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7C_Content_v1.0_Pass1.md` (§0–§4) |
| Applies | `Doc-7C_Content_Pass1_Independent_Hard_Review_v1.0.md` (3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-1 **+ this patch** = clean §0–§4 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-2 (§5–§9 + Appendix) |
| Discipline | Additive; nothing coined; no frozen document edited |

---

## Changes

### C-1 — closes **MINOR-1** (Staff participation)
§4.3 amended: Platform Participation is **Buyer / Vendor / Hybrid / Staff** (Invariant #2). The **tenant** navigable surface-set derives from **Buyer/Vendor/Hybrid** (× the user's org role); **Staff participation routes to the Admin group (§4.4)** and is **not** part of the org-scoped tenant surface-set (Admin carries no active-org).

### C-2 — closes **MINOR-2** (switch re-resolves context + surface set)
§4 (new §4.1a) added: on **`switch_active_organization`**, the switch is a **full context change** — the shell **re-resolves the active context** (`get_active_context`) and **re-derives the navigable surface set** (§4.3), then re-renders. It is **not** a mere header swap; the new context is **server-re-validated** (§4.1) before any tenant surface renders under it.

### C-3 — closes **MINOR-3** (Doc-7E spans two areas)
§2.1/§2 clarified: **Doc-7E (Account & Identity shell) spans two areas** — the **unauthenticated auth-entry** routes (login/signup/password-recovery) **and** the **authenticated** account / membership-management screens. The §2.1 table now notes Doc-7E in both the auth-entry row (screens, unauthenticated) and the authenticated group (account management); Doc-7C owns the placement of both, Doc-7E authors the screens.

### C-4 — closes **NITPICK-1** (§3.3 phrasing)
§3.3 cleaned: "...enforced inside **each wired Doc-5 contract the surface calls — the contract runs its own authorization** (`Doc-4A §5` validation order)." Stray "(Pass-context: …)" removed.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MINOR-1 Staff participation | MINOR | C-1: Invariant #2 four values; Staff→Admin | **CLOSED** |
| MINOR-2 switch re-resolution | MINOR | C-2: §4.1a full context re-resolution + re-render | **CLOSED** |
| MINOR-3 Doc-7E two-area span | MINOR | C-3: auth-entry (unauth) + account mgmt (auth) | **CLOSED** |
| NITPICK-1 §3.3 phrasing | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** No new finding; no anchor regressed; nothing coined.

**Next pass:** Content Pass-2 (§5–§9 + Appendix) — typed wired server-side Doc-5 API-client (§5), global notification center (§6), loading/error/streaming/not-found conventions (§7), out-of-frontend boundary (§8), conformance & carried items (§9), shell/route-group skeleton (Appendix) — through the same loop.

*End of Content Pass-1 Patch v1.0.1 + Short Closure Check. Effective §0–§4 = Pass-1 + this patch. Additive; nothing coined; no frozen document edited.*
