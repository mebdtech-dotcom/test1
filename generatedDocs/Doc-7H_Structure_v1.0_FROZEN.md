# Doc-7H — Admin Console — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **STRUCTURE FROZEN v1.0** (2026-06-26). Effective = `Doc-7H_Structure_Proposal_v0.1` + `Doc-7H_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-7 — Frontend Realization**; Doc-7H = the **Admin Console** (the last surface) |
| Realizes | the frozen **Doc-5J** Admin surface (BC-ADM-1…6; 32 caller) + **cross-module Admin legs** (Doc-5D/5E/5G/5I/5C/5H Admin), on Doc-7C `(admin)` route group, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (HR11) |
| Coins | **Nothing** — binds frozen Admin contracts by pointer; single event `VendorBanned` by pointer |

**Governing rule (Admin-decides / owning-module-owns):** the console invokes wired Admin commands; the **owning module owns the data/decision/effect** — never bypasses an owning module's domain (R5; Red Flag #8). **Platform-scoped (no active-org)** — acts **ON** a target by ID, never **AS** an org. Makes **no matching/routing/award/eligibility decision** (R7 moat); **writes no governance score** (R8 Trust firewall). Coins nothing.

---

## Ratified decisions (HR1–HR12)
*(`HRn` = Doc-7H realization decisions — distinct from `DR-7-*`.)*

- **HR1 — Scope: the Admin Console (platform-staff; no active-org).** Realizes Doc-5J + cross-module Admin legs. Mounts `(admin)` (no `Iv-Active-Organization` — `Doc-5J R2`/`Doc-5A §7.3`). The Admin acts **ON** a target (org/user/vendor/RFQ) **by ID** (command parameter), never **AS** an org. Admin-decides / owning-module-owns (HR9).
- **HR2 — Moderation (Doc-5J BC-ADM-1).** `create_moderation_case`/`assign_moderation_case`/`decide_moderation_case` + reads. `create` dual-template caller leg only (System auto-queue → §10). `moderation_cases` machine. No Event.
- **HR3 — Bans & enforcement (Doc-5J BC-ADM-2).** `issue_ban`/`lift_ban` + reads. **`issue_ban` emits `VendorBanned`** (the single Doc-2 §8 event — R9). `expire_ban` System (§10) — displayed, never invoked. **A ban is a platform-wide enforcement action (vendor-visible), distinct from a buyer-private blacklist (undetectable — Doc-7F/7G);** byte-equivalence applies to blacklist, not ban.
- **HR4 — Suggestions triage (Doc-5J BC-ADM-3; link non-disclosure R6).** `decide_category_suggestion`/`triage_/close_missing_vendor_suggestion`/`confirm_/dismiss_link_suggestion` + reads. **Link suggestions are staff-internal, non-disclosure-sensitive** (`Doc-5J R6`; Invariant #11) — never exposed to a tenant/vendor.
- **HR5 — Import (Doc-5J BC-ADM-4).** `submit_import_job` (**create-then-poll** — R10) + reads (`get_/list_import_jobs`/`list_import_rows`). `process_import_job` System (§10) — submitted + polled, never run by the console.
- **HR6 — Verification workflow (Doc-5J BC-ADM-5; Trust firewall R8).** `queue_/assign_/decide_verification_task` + reads — the **M8 verification WORKFLOW**. **`verification_tasks ≠ trust.verification_records/decisions`** — the **Trust decision/record/score is M5's** (Doc-5G). The console binds the M8 workflow task **and** (bind-or-ESC) any distinct **M5 Trust verification-decision Admin command**, but **NEVER writes the trust record or any score directly** — M5 owns it (auto-calculated under System; Invariant #6). Workflow (M8) and decision (M5) are distinct surfaces.
- **HR7 — Outreach (Doc-5J BC-ADM-6; moat R7).** `create_/run_/complete_outreach_campaign`/`add_/update_outreach_contact` + reads. **Informational acquisition only** — no procurement/matching/award surface. `outreach_campaigns` machine.
- **HR8 — Cross-module Admin governance legs (owning-module Admin commands).** **Ad review** (`review_advertisement` — Doc-5D) · **vendor-profile governance** (`set_vendor_profile_status` — Doc-5D) · **category governance** (`create_/update_category`/`set_category_status` — Doc-5D) · **trust publication** (`freeze_/reactivate_trust_score` — Doc-5G; **publication/ranking only, never edits the value** — R8) · **verification/staff reads** (Doc-5G case detail/fraud/admin ratings — staff-internal) · **plan catalog** (`create_/update_/retire_/activate_plan`/`bundle_plan_entitlement`/`create_entitlement` — Doc-5I BC-BILL-1; **`activate_plan` lands here**) · **routing control** (`assist_routing` Stage-gated / `manage_routing_rule` / `get_matching_results` Admin — Doc-5E §7) · **identity governance** (org/user suspend-reinstate, ownership recovery — Doc-5C, no org context) · **support** (`staff_can_support` — Doc-5H). Each binds the **owning module's** frozen Admin contract by pointer; the console never bypasses the owning domain (R5).
- **HR9 — Admin-decides / owning-module-owns (R5) — load-bearing.** The console invokes wired Admin commands; the **owning module owns the data/decision/effect**. M8's Admin→owning-module effects are M8's **in-process service calls** (never the frontend's); other legs are the respective module's Admin command. The frontend **never directly writes another module's data** (contracts-only).
- **HR10 — Firewalls (R7 moat · R8 Trust · score firewall).** **R7:** no matching/routing/ranking/selection/award/eligibility decision — `assist_routing` adjusts routing **rules/human-assist** (Stage-gated), never an award/winner (the no-auto-decision moat holds). **R8:** Admin verification = workflow; Trust owns decision/score; `freeze_/reactivate_trust_score` = **publication/ranking only**, never edits a value; the console **writes no governance score**. Flag-and-halt if a matching/award/score-write surface is proposed.
- **HR11 — No active-org; staff non-disclosure; applicable Appendix A.** No `Iv-Active-Organization`. Staff-internal reads (verification case detail, fraud signals, admin ratings, link suggestions) are **staff-only, never tenant/public** (`Doc-5G R10`/`Doc-5J R6`). Conformance: **`CHK-7-010` N/A** (no active-org); **`CHK-7-012` APPLIES** (asserts Admin-no-org); **`CHK-7-011` APPLIES** (staff-slug `admin.*` UX gating); all other `CHK-7-xxx` APPLY (full Admin surface; AI per content).
- **HR12 — Coins nothing.** Binds frozen Admin contracts by pointer; single event `VendorBanned` by pointer; gaps → flag-and-halt (`[ESC-7-API]`), never invent.

---

## Section spine (authored in content passes)

§0 Control/Precedence/Gating · §1 Scope & the Admin Console's Place (no active-org; Admin-decides) · §2 Moderation (HR2) · §3 Bans & Enforcement — VendorBanned (HR3) · §4 Suggestions Triage — link non-disclosure (HR4) · §5 Import (HR5) · §6 Verification Workflow — Trust firewall (HR6) · §7 Outreach — moat (HR7) · §8 Cross-Module Admin Governance Legs (HR8) · §9 Admin-Decides/Owning-Module-Owns & Firewalls (HR9/HR10) · §10 State-Machine UI, No-Active-Org & Non-Disclosure (HR11) · §11 Composition, Data, Authz, Baseline & Conformance (HR11/HR12) · Appendix View/Contract-Binding Skeleton.

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7H handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Consumes frozen Doc-7B kit + Doc-7C `(admin)` shell | By reference | No |
| **DR-7-API** | Views bind frozen Doc-5J + cross-module Admin legs | Consistency cross-check; `[ESC-7-API]` on a gap (incl. M5 Trust verification-decision command) | Possible |
| **DR-7-STATE** | Moderation/ban/import/verification/outreach UI per Doc-4M | Bound by pointer (HR2–HR7) | No |
| `[ESC-7-API]` | A view needs a non-existent/wrong-actor/non-Admin contract | Flag-and-halt; additive Doc-5x patch (Board) | Possible |
| `[ESC-7-DESIGN]` | A composed embedded component needs allocation | Doc-7B definer | Possible |

## Fences / out of scope

The kit/shell (Doc-7B/7C) · any tenant surface (Doc-7D/7E/7F/7G) · the **matching/routing engine** (System out-of-wire; Admin adjusts rules, never runs matching/awards — R7) · **writing a trust/performance/financial-tier score** (Trust owns — R8) · **bypassing an owning module's domain** (R5; Red Flag #8) · **active-org context** (Admin has none) · exposing staff-internal data to a tenant/public · coining any contract/route-as-API/field/event/state/POLICY key · the e2e / RBAC **test** obligation (Doc-8).

---

*End of Doc-7H Canonical Structure **v1.0 FROZEN**. Effective = Proposal v0.1 + Patch v0.1.1; Independent Hard Review + Structure Freeze Audit PASS. Doc-7H realizes the Admin Console over the frozen Doc-5J + cross-module Admin surfaces; Admin-decides/owning-module-owns; no active-org (acts ON target by ID); no matching/award/score-write; single event VendorBanned; coins nothing. The last Doc-7 surface. Next: Doc-7H content passes.*
