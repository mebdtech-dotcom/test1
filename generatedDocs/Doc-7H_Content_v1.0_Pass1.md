# Doc-7H — Admin Console — **Content Pass-1 (§0–§7)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§7 of `Doc-7H_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§8–§11 + Appendix) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7H_Structure_v1.0_FROZEN` §0–§7; HR1/HR9 (§1) · HR2 (§2) · HR3 (§3) · HR4 (§4) · HR5 (§5) · HR6 (§6) · HR7 (§7) |
| Authority | Conforms to `Doc-7A`/`7B`/`7C` + Doc-4M/Doc-2 (upstream); consistent with frozen Doc-5J |
| Posture | Reference-never-restate; **mechanism only — no JSX/page/route code**. Coins **nothing** |

> **Scope:** control & gating (§0), scope & place (§1), and the core Doc-5J Admin surface — moderation (§2), bans (§3), suggestions triage (§4), import (§5), verification workflow (§6), outreach (§7). §8–§11 + Appendix (cross-module legs, firewalls, conformance) in Pass-2.

---

## §0 — Document Control, Precedence & Gating

### §0.1 Precedence & conformance
Doc-7H is a Doc-7 **surface** document. It **conforms to** `Doc-7A`/`Doc-7B`/`Doc-7C` and to Doc-4M/Doc-2 (upstream); it is **consistent with** the frozen **Doc-5J** + cross-module Admin surfaces. On any conflict the higher document wins; Doc-7H is corrected.

### §0.2 Realize-never-redecide; the Admin firewalls
Doc-7H binds **frozen Admin contracts** to views; it re-authors none and invents none. **Admin-decides / owning-module-owns** (§1/§9, Pass-2): the console calls the owning module's wired Admin command; the owning module owns the data/effect. The console **makes no matching/award decision** (R7), **writes no governance score** (R8), and **never bypasses an owning module's domain** (R5; Red Flag #8). Gaps → `[ESC-7-API]`, never coined.

### §0.3 Freeze obligation
Doc-7H passes the **full** `Doc-7A` Appendix A applicable per HR11 (no active-org; staff-slug gating) and clears any carried `[ESC-7-*]` before freeze (governance §8 rules 1, 3).

---

## §1 — Scope & the Admin Console's Place *(authors no kit/shell/tenant surface)*

The platform-staff **governance/operations** console. Mounts in the Doc-7C **`(admin)` route group** — **no `Iv-Active-Organization`** (platform-scoped; `Doc-5J R2`/`Doc-5A §7.3`); consumes the 7B kit + 7C server-side wired client by reference. The Admin acts **ON** a target (org/user/vendor/RFQ) **by ID** (a command parameter), **never AS** an org — the target is not an active-org context. **Admin-decides / owning-module-owns** (§9, Pass-2). It authors no kit/shell, no tenant surface (Doc-7D–7G), and **never the matching/routing engine, a score write, or an owning-module domain bypass**.

---

## §2 — Moderation *(mechanism only; Doc-5J BC-ADM-1)*

### §2.1 Binding
Bind `create_moderation_case`, `assign_moderation_case`, `decide_moderation_case` + reads (`get_moderation_case`, `list_moderation_cases`). The Admin opens a moderation case against a target, assigns it to staff, and records a decision.

### §2.2 Notes
`create_moderation_case` has a **dual template** — the console binds the **caller (Admin) leg only**; the **System auto-queue leg is §10 out-of-wire** (the console never invokes it). The `moderation_cases` state machine renders per Doc-4M; **No Event** (moderation emits no Doc-2 §8 event). Org-scoped-by-target (the case references a target by ID; the Admin has no active-org).

---

## §3 — Bans & Enforcement *(mechanism only; Doc-5J BC-ADM-2)*

### §3.1 Binding
Bind `issue_ban`, `lift_ban` + reads (`get_ban_action`, `list_ban_actions`). The Admin issues or lifts a ban against a target vendor.

### §3.2 VendorBanned — the single event
**`issue_ban` emits the single Doc-2 §8 event `VendorBanned`** (R9; the only domain event any Doc-7H surface drives — M8 is the authoritative event-catalog owner yet emits exactly one). The console invokes `issue_ban`; the outbox emission + downstream consumers are M0/owning-module concerns (the console never drives the fan-out). `expire_ban` is **System (§10 out-of-wire)** — displayed, never invoked.

### §3.3 Ban ≠ blacklist
A **ban** is a **platform-wide enforcement** action — **vendor-visible** (the banned vendor knows), emits `VendorBanned`. It is **distinct from a buyer-private blacklist** (undetectable — Doc-7F/7G byte-equivalence). The undetectability/byte-equivalence applies to the **blacklist**, never the ban. `ban_actions` machine per Doc-4M.

---

## §4 — Suggestions Triage *(mechanism only; Doc-5J BC-ADM-3; link non-disclosure R6)*

### §4.1 Binding
Bind `decide_category_suggestion`, `triage_missing_vendor_suggestion`, `close_missing_vendor_suggestion`, `confirm_link_suggestion`, `dismiss_link_suggestion` + reads (`get_suggestion`, `list_suggestions`). Three suggestion machines (category / missing-vendor / link) per Doc-4M. No Event.

### §4.2 Link non-disclosure (R6; Invariant #11)
**Link suggestions are staff-internal and non-disclosure-sensitive** (`Doc-5J R6`; Invariant #11 `link_suggestions`). The triage UI is **staff-only**; confirming/dismissing a link **never reveals a buyer's private association** to a tenant/vendor. The link-suggestion surface exists only in the Admin console, never on any tenant surface.

---

## §5 — Import *(mechanism only; Doc-5J BC-ADM-4)*

### §5.1 Binding (create-then-poll — R10)
Bind `submit_import_job` (**create-then-poll**: the console submits, then **polls** the job/rows) + reads (`get_import_job`, `list_import_jobs`, `list_import_rows`). `process_import_job` is **System (§10 out-of-wire)** — the console submits + polls, **never runs** the job. The `import_jobs` machine renders per Doc-4M; the UI shows submitted → processing → completed/failed via polling (ASYNC_PENDING surfaced per `Doc-5A §10` / `Doc-7A §5.3`). No Event.

---

## §6 — Verification Workflow *(mechanism only; Doc-5J BC-ADM-5; Trust firewall R8)*

### §6.1 Binding (the M8 workflow)
Bind `queue_verification_task`, `assign_verification_task`, `decide_verification_task` + reads (`get_verification_task`, `list_verification_tasks`). The Admin queues a verification task, assigns it to staff, and records the **workflow** decision. `queue` dual-template — caller leg only (System leg → §10). `verification_tasks` machine per Doc-4M. No Event.

### §6.2 Trust firewall (R8) — workflow ≠ decision/score
**`verification_tasks ≠ trust.verification_records/decisions`** (`Doc-5J R8`). The Admin owns the **verification WORKFLOW** (the task — queue/assign/decide); **Trust (M5) owns the verification DECISION, record, and any score** (Doc-5G; auto-calculated under System; Invariant #6). `decide_verification_task` records the **workflow** outcome that feeds Trust **in-process** (M8's service call); the console binds the M8 workflow task **and** (bind-or-ESC, Pass-2 §8) any distinct **M5 (Doc-5G) Trust verification-decision** Admin command, but **NEVER writes the trust record or any score directly**.

---

## §7 — Outreach *(mechanism only; Doc-5J BC-ADM-6; moat R7)*

### §7.1 Binding
Bind `create_outreach_campaign`, `run_outreach_campaign`, `complete_outreach_campaign`, `add_outreach_contact`, `update_outreach_contact` + reads (`get_outreach_campaign`, `list_outreach_campaigns`). `outreach_campaigns` machine per Doc-4M; plain state commands (not async — R10). No Event.

### §7.2 Moat (R7) — informational acquisition only
**Vendor outreach is informational acquisition only** (`Doc-5J R7`) — the campaign reaches out to prospective vendors; it is **not a procurement, matching, routing, or award surface**. The outreach UI never touches an RFQ decision; flag-and-halt if a procurement surface is proposed here.

---

## Pass-1 self-check (pre-review)

- **Bindings verified:** §2–§7 ↔ Doc-5J BC-ADM-1…6 (verified lines 41–46).
- **Firewalls:** §3.2 single event VendorBanned (R9); §6.2 Trust firewall (workflow ≠ decision/score); §7.2 moat (informational); §4.2 link non-disclosure.
- **No active-org:** §1 — acts ON target by ID.
- **System workers displayed not invoked:** §2.2/§5.1 (auto-queue/process_import_job §10).
- **Coins nothing:** 0 new module/contract/route-as-API/field/event/state/POLICY key.
- **Open for review:** confirm `decide_moderation_case` outcome effects (does deciding a case trigger a ban, or are they separate?); confirm import `submit_import_job` create-then-poll uses ASYNC_PENDING (Doc-5A §10) correctly.

*End of Content Pass-1 (§0–§7) — DRAFT. Realizes `Doc-7H_Structure_v1.0_FROZEN` §0–§7. Nothing coined; Admin firewalls held. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§8–§11 + Appendix).*
