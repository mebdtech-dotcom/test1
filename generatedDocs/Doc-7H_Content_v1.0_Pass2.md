# Doc-7H — Admin Console — **Content Pass-2 (§8–§11 + Appendix)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §8–§11 + Appendix of `Doc-7H_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7H FROZEN → **Doc-7 surfaces COMPLETE** |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7H_Structure_v1.0_FROZEN` §8–§11 + Appendix; HR8 (§8) · HR9/HR10 (§9) · HR11 (§10) · HR11/HR12 (§11) |
| Carries forward | Pass-1 §2–§7 (Doc-5J core); the Admin firewalls |
| Posture | Reference-never-restate; mechanism only. Coins **nothing** |

> **Scope:** cross-module Admin governance legs (§8), Admin-decides/owning-module-owns & firewalls (§9), state-machine/no-active-org/non-disclosure (§10), composition/data/conformance (§11), skeleton (Appendix).

---

## §8 — Cross-Module Admin Governance Legs *(mechanism only; owning-module Admin commands)*

Each leg binds the **owning module's** frozen **Admin** command by pointer; **Admin-decides / owning-module-owns** (§9) — the console never bypasses the owning domain.

| Governance area | Binds (owning module's Admin command) | Firewall / note |
|---|---|---|
| **Ad review** | `review_advertisement` (Doc-5D BC-MKT-5) | the vendor submits (Doc-7G); Admin reviews |
| **Vendor-profile governance** | `set_vendor_profile_status` (Doc-5D BC-MKT-1) | M2 owns the profile status |
| **Category governance** | `create_category`/`update_category`/`set_category_status` (Doc-5D BC-MKT-2) | M2-owned category tree; vendors only assign |
| **Trust publication** | `freeze_trust_score`/`reactivate_trust_score` (Doc-5G BC-TRUST-2) | **publication/ranking effect only — never edits the value** (R8) |
| **Verification / staff reads** | Doc-5G staff reads (case detail, fraud signals, admin ratings) | **staff-internal only** (`Doc-5G R10`) |
| **Trust verification decision** | the M5 (Doc-5G) Trust verification-decision Admin command, **if distinct from the M8 workflow task** (Pass-1 §6.2) | bind-or-`[ESC-7-API]`; **console writes no score** (R8) |
| **Plan catalog** | `create_plan`/`update_plan`/`retire_plan`/**`activate_plan`**/`bundle_plan_entitlement`/`create_entitlement` (Doc-5I BC-BILL-1) | Admin catalog governance; `activate_plan` (`draft→active`) **lands here** (flagged from Doc-7E) |
| **Routing control** | `assist_routing` (Stage-gated human-assist) / `manage_routing_rule` / `get_matching_results` (Admin leg) (Doc-5E §7) | **adjusts rules/human-assist, never an award/winner** (R7 moat) |
| **Identity governance** | org/user suspend-reinstate, ownership recovery (Doc-5C Admin subset) | no org context; M1 owns the org/user |
| **Support** | `staff_can_support` ticket/delivery-status (Doc-5H) | M6 delivery/support; staff-scoped |

**Binding rule:** each is the owning module's wired Admin command; the console composes them into the governance UI, **never writing another module's data directly** (contracts-only; One Module, One Owner). Any leg whose exact command is unconfirmed is **bind-or-`[ESC-7-API]`** at content (e.g. the distinct M5 Trust verification-decision command).

---

## §9 — Admin-Decides / Owning-Module-Owns & Firewalls *(mechanism only)*

### §9.1 Admin-decides / owning-module-owns (R5; Red Flag #8) — load-bearing
The console invokes wired Admin commands; the **owning module owns the data/decision/effect**. M8's Admin→owning-module effects (verification decision feed, category/link/import writes) are **M8's in-process service calls** (never the frontend's); other legs are the respective module's Admin command. The frontend **never directly writes another module's data** — it calls the owning module's Admin command against the target ID.

### §9.2 Moat firewall (R7)
The console makes **no matching/routing/ranking/supplier-selection/award/eligibility decision**. `assist_routing` adjusts **routing rules / Stage-gated human-assist**, never an award or winner (the no-auto-decision moat holds — consistent with Doc-7F §6.3). `get_matching_results` (Admin leg) is **observability** (non-disclosing — R5/Doc-5E R5), never a selection action.

### §9.3 Trust firewall (R8) + score firewall
The console **writes no trust/performance/financial-tier score**. Verification is a **workflow** (M8 task); the **decision/record/score is M5's** (Doc-5G; auto-calculated under System). `freeze_/reactivate_trust_score` is **publication/ranking effect only** — it never edits a score value. Flag-and-halt if a score-write surface is proposed.

---

## §10 — State-Machine UI, No-Active-Org & Non-Disclosure *(mechanism only)*

### §10.1 State machines (Doc-4M)
Moderation, ban, suggestion, import, verification-task, outreach lifecycles render **only Doc-4M-permitted Admin transitions** (`Doc-7A §7`); **System workers** (`expire_ban`, `process_import_job`, the System auto-queue legs) are **displayed, never invoked** (out-of-wire). STATE/CONFLICT (409) → reconcile.

### §10.2 No active-org
The console carries **no `Iv-Active-Organization`** (Admin platform-scoped — `Doc-5A §7.3`). It acts **ON** target entities by ID; there is no org-context switch, no org-scoped read gate. Authorization is on **Admin staff slugs** (`admin.*`), server-enforced.

### §10.3 Staff-internal non-disclosure
Staff-internal data — **verification case detail, fraud signals, admin ratings, link suggestions** — is **staff-only, never tenant/public** (`Doc-5G R10`/`Doc-5J R6`). These render only in the Admin console; a cross-boundary read would collapse to `NOT_FOUND` on a tenant surface. The console never exposes a tenant's private data beyond the governance need, and never surfaces a buyer's private CRM (Doc-7F-owned).

---

## §11 — Composition, Data, Authz, Baseline & Conformance

### §11.1 Composed embedded components (Doc-7B; `CHK-7-005`)
- **Trust badge** (`Doc-5G`) on vendors under review (Admin reads the vendor's trust — read-only; the console writes no score, §9.3).
- **AI advisory panel** (`Doc-5K`) — advisory only, non-recommending (R6/R10); binds confirmed Doc-5K Admin/staff advisory reads or omit/`[ESC-7-API]`.
- **M6 support thread** (`Doc-5H`) — staff support communications.
- *(No billing/quota indicator — the Admin is not a tenant with a plan.)*

### §11.2 Data, authz, baseline
- **Data** via the Doc-7C **server-side wired client**; reads (RSC) + writes (server actions + stable idempotency key); cursor pagination + POLICY `page_size`; error→state by `error_class`; browser holds no credential. File uploads (import files, moderation evidence) carry the Doc-7C file-upload `[ESC-7-API]` (blobs → Storage; `file_ref` only).
- **Authz** UX gating on **Admin staff slugs** (`admin.*`) is **UX over server enforcement** (`Doc-7A §4.3`); read via contract, never name-string (Invariant #10).
- **Baseline** (Doc-7B §7): WCAG-AA, i18n-ready, **currency-per-field default BDT** on any monetary display (e.g. plan prices in the catalog) (`Doc-2 §0.4`), responsive.

### §11.3 Applicable Appendix A (Admin surface)
| CHK | Status | Reason |
|---|---|---|
| `CHK-7-001/002/003/004` | **APPLIES** | reads + commands across Doc-5J + cross-module Admin legs |
| `CHK-7-005` | **APPLIES** | trust badge / AI panel / support thread |
| `CHK-7-010` | **N/A** | Admin has no active-org |
| `CHK-7-011` | **APPLIES** | UX gating on Admin staff slugs (`admin.*`) |
| `CHK-7-012` | **APPLIES (assertion)** | the console asserts **Admin carries no active-org** |
| `CHK-7-020/021` | **APPLIES** | Content≠Presentation of governance data |
| `CHK-7-030/031` | **APPLIES** | moderation/ban/import/verification/outreach lifecycles |
| `CHK-7-040/041/042` | **APPLIES** | staff-internal non-disclosure; link non-disclosure; NOT_FOUND collapse |
| `CHK-7-050/051` | **APPLIES** | AI advisory non-authoritative, non-recommending |
| `CHK-7-060/061/062/063` | **APPLIES** | baseline; currency on plan catalog |
| `CHK-7-070/071` | **APPLIES** | out-of-frontend; System workers; media as `file_ref` |
| `CHK-7-080/081` | **APPLIES** | realize-never-redecide; no score write; no domain bypass |

### §11.4 Carried items & coins nothing
`DR-7-SHELL` · `DR-7-API` (Doc-5J + cross-module Admin legs; `[ESC-7-API]` incl. file-upload grant + the distinct M5 Trust verification-decision command) · `DR-7-STATE`. Binds frozen Admin contracts by pointer; single event `VendorBanned` by pointer; **never writes another module's data, a score, or an award**; nothing coined (HR12).

---

## Appendix — View / Contract-Binding Skeleton *(names = presentation vocabulary; bound contracts frozen)*

| View | Bound frozen contract(s) | Notes |
|---|---|---|
| Moderation | BC-ADM-1 (Doc-5J) | No Event; separate from ban |
| Bans | BC-ADM-2 (Doc-5J) | `issue_ban`→`VendorBanned`; ban≠blacklist |
| Suggestions triage | BC-ADM-3 (Doc-5J) | staff-internal link non-disclosure |
| Import | BC-ADM-4 (Doc-5J) | 202 + poll (Doc-5A §10) |
| Verification workflow | BC-ADM-5 (Doc-5J) | M8 workflow; M5 owns decision/score |
| Outreach | BC-ADM-6 (Doc-5J) | informational only (moat) |
| Cross-module governance | Doc-5D/5E/5G/5I/5C/5H Admin legs | owning-module-owns; `activate_plan` here |
| Embedded | trust badge (read) · AI panel (non-recommending) · M6 support thread | composed from Doc-7B |

Exact pages/routes realized with the implementation; Doc-7H fixes the **view inventory + bindings**.

---

## Pass-2 self-check (pre-review)

- **Admin-decides/owning-module-owns:** §8/§9.1 — owning module's command; never writes another module's data.
- **Firewalls:** §9.2 moat (no award; assist_routing=rules); §9.3 Trust (no score write; publication only).
- **No active-org:** §10.2; conformance §11.3 (010 N/A; 012 APPLIES-assert; 011 staff-slug).
- **Non-disclosure:** §10.3 staff-internal; never surfaces buyer-private CRM.
- **Coins nothing:** Appendix names presentation vocabulary; bound contracts frozen; single event by pointer.
- **Open for review:** confirm the distinct M5 Trust verification-decision command exists (else `[ESC-7-API]`); confirm `get_matching_results` Admin observability is non-disclosing (R5) on the Admin surface.

*End of Content Pass-2 (§8–§11 + Appendix) — DRAFT. Realizes `Doc-7H_Structure_v1.0_FROZEN` §8–§11 + Appendix. Nothing coined; Admin firewalls held. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7H FROZEN → Doc-7 surfaces COMPLETE.*
