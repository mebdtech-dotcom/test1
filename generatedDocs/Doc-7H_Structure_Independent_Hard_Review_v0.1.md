# Doc-7H — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7H_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Admin-decides/owning-module-owns + Trust-firewall + Doc-5J conformance |
| Verdict | **NOT YET FREEZE-READY** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Structure Patch → short closure check → Structure Freeze Audit |

---

## Anchors verified CORRECT

- **Doc-5J BC-ADM-1…6** (moderation/bans/suggestions/import/verification/outreach; 32 caller) — verified lines 41–47. `issue_ban`→**`VendorBanned`** (single event, R9); `expire_ban`/`process_import_job` System §10 — CORRECT.
- **R5 Admin-decides/owning-module-owns** (in-process effects, never bypass domain — Red Flag #8); **R7 moat** (no matching/award; outreach informational); **R8 Trust firewall** (M8 owns workflow, computes no score); **R6 link non-disclosure** — all correctly invoked.
- **No active-org** (`Doc-5J R2`/`Doc-5A §7.3`); **HR8 cross-module Admin legs** (each the owning module's Admin command) — CORRECT in shape.
- `activate_plan` correctly landed here (Doc-5I BC-BILL-1 Admin) per the Doc-7E flag. CORRECT.

0 BLOCKER, 0 MAJOR — the Admin scope and firewalls are sound. Three realization/conformance refinements + one nit.

### MINOR-1 — HR6/HR8 verification realization: pin M8 workflow vs M5 Trust decision/record
HR6 binds `decide_verification_task` (M8 workflow); HR8 binds Doc-5G staff **reads**. But the **Trust verification DECISION/record/score is M5's** (`Doc-5J R8` — `verification_tasks ≠ trust.verification_records/decisions`). The structure leaves ambiguous **where the Trust decision is written** — risking either a missing M5 binding or (worse) the console writing the Trust record directly (R8 violation).
**Required fix:** HR6/HR8 clarify — the Admin Console binds the **M8 workflow task** (`decide_verification_task`) **and**, if a distinct **M5 (Doc-5G) Trust verification-decision Admin command** exists, binds that too (bind-or-ESC at content); the console **NEVER writes the trust verification record or any score directly** — M5 owns the decision/record/score (R8; auto-calculated under System). The workflow (M8) and the decision (M5) are distinct surfaces.

### MINOR-2 — HR11 conformance mapping imprecise
HR11 says "`CHK-7-010/012` adapt — no active-org." Precisely:
- **`CHK-7-010`** (active-org server-resolved) → **N/A** (Admin has no active-org).
- **`CHK-7-012`** (incl. "Admin carries no active-org") → **APPLIES** (the console **asserts** Admin-no-org).
- **`CHK-7-011`** (UI gate = UX over server) → **APPLIES** — gated on **Admin staff slugs** (`admin.*`).
**Required fix:** HR11 state the precise mapping (010 N/A; 012 APPLIES-as-assertion; 011 APPLIES on staff slugs).

### MINOR-3 — HR1/HR9 distinguish acting ON a target vs AS an org
The Admin has **no active-org**, yet Admin commands act **on** target orgs/users/vendors (e.g. suspend an org, ban a vendor). Clarify the distinction to avoid a "no-active-org therefore no target" misread.
**Required fix:** HR1/HR9 state — the Admin acts **ON** a target (org/user/vendor) **by ID** (a command parameter), never **AS** an org; the target is **not** an active-org context (no `Iv-Active-Organization`).

### NITPICK-1 — HR3 distinguish ban from blacklist
A **ban** (platform-wide enforcement, `VendorBanned`, vendor-visible) is distinct from a **blacklist** (buyer-private, undetectable — Doc-7F/7G byte-equivalence).
**Required fix:** HR3 note — a ban is a **platform enforcement** action (visible; emits `VendorBanned`), **not** a buyer-private blacklist; the two are different concepts (the byte-equivalence/undetectability applies to blacklist, not ban).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 verification M8-workflow vs M5-decision | MINOR | Structure Patch — pin + never-write-score |
| MINOR-2 HR11 conformance mapping | MINOR | Structure Patch — precise 010/011/012 |
| MINOR-3 act ON vs AS org | MINOR | Structure Patch — clarify |
| NITPICK-1 ban ≠ blacklist | NIT | Structure Patch — note |

**Gate:** freeze only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Structure Patch required**, then short closure check, then Structure Freeze Audit.

*End of Doc-7H Structure Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — Admin scope/firewalls sound; three refinements pin the Trust-firewall verification boundary (M8 workflow ≠ M5 decision/score) and the no-active-org conformance/targeting model.*
