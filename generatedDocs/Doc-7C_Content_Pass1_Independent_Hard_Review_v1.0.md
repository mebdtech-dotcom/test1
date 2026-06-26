# Doc-7C — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7C_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · conformance to frozen `Doc-7A`/`Doc-7C` structure + invariants |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- §3.2 `src/server/` subfolders (**auth/ · context/ · authz/ · guards/**) — verified verbatim vs `REPOSITORY_STRUCTURE.md` 214–218. CORRECT.
- §4.1 active-org contracts (`get_active_context`/`list_my_organizations`/`switch_active_organization` `Doc-5C §C8`; `Iv-Active-Organization` server-validated `Doc-4A §5.3`/`Doc-5A §7`) — CORRECT.
- §2.1 four-area topology (Public / auth-entry / authenticated / Admin); Admin no active-org (`Doc-7A §4.4`) — conforms to SR2/C-2. CORRECT.
- §4.2 ownership seam (7C mechanism vs 7E management screens) — `Doc-7A §4`. CORRECT.
- §3.1/§3.3 Supabase Auth authn-only; authz app-layer — CLAUDE.md §2; `Doc-7A §4.3`. CORRECT.

0 BLOCKER, 0 MAJOR — the shell foundation is faithful (the structure already absorbed the server-side-client MAJOR; §5 lands in Pass-2). Three invariant/precision refinements + one nit.

### MINOR-1 — §4.3 omits the **Staff** platform-participation value
§4.3 derives the navigable surface set from "platform participation (Buyer / Vendor / Hybrid)" — but **Invariant #2** enumerates Platform Participation as **Buyer / Vendor / Hybrid / Staff**. Staff is the platform-staff dimension, which routes to the **Admin** path (§4.4, not org-scoped).
**Required fix:** §4.3 note the **tenant** surface-set derives from Buyer/Vendor/Hybrid; **Staff participation routes to the Admin group (§4.4)** and is not part of the org-scoped tenant surface-set. Cite Invariant #2's four values.

### MINOR-2 — §4 does not state that switching the active org re-resolves the surface set + context
§4.1 covers the switch mechanism but not its effect: switching the active org is a **full context change** — the navigable surface set may change (e.g. Hybrid→single-participation), and the server-validated context the shell hands to surfaces changes.
**Required fix:** §4 add — on `switch_active_organization`, the shell **re-resolves the active context and re-derives the navigable surface set** (§4.3) and re-renders; it is not a mere header swap. Server re-validation (§4.1) gates the new context.

### MINOR-3 — §2.1 obscures that Doc-7E spans two areas
§2.1 lists Doc-7E under the **authenticated group** while the **auth-entry** row notes "Doc-7E authors the screens." Doc-7E (Account & Identity shell) genuinely **spans both** — the **unauthenticated auth-entry** routes (login/signup/recovery) **and** the **authenticated** account/membership-management screens.
**Required fix:** §2.1/§2 make explicit that Doc-7E spans two areas (auth-entry = unauthenticated; account management = authenticated), so the table is not read as Doc-7E living only in the authenticated group.

### NITPICK-1 — §3.3 stray phrasing "(Pass-context: …)"
§3.3 reads "enforced inside each wired Doc-5 contract the surface calls (Pass-context: the contract runs its own authz)" — "Pass-context" is editorial noise.
**Required fix:** drop "Pass-context:"; keep "each wired Doc-5 contract runs its own authorization (`Doc-4A §5` validation order)."

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 §4.3 omits Staff participation | MINOR | Content Patch — cite Invariant #2; Staff→Admin |
| MINOR-2 §4 switch re-resolves surface set | MINOR | Content Patch — add re-resolution |
| MINOR-3 §2.1 Doc-7E spans two areas | MINOR | Content Patch — clarify |
| NITPICK-1 §3.3 stray phrasing | NIT | Content Patch — clean up |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Content Patch required**, then short closure check, then Content Pass-2 (§5–§9 + Appendix).

*End of Content Pass-1 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — foundation sound; three genuine invariant/precision defects (Staff participation, switch re-resolution, Doc-7E two-area span).*
