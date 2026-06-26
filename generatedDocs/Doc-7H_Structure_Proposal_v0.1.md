# Doc-7H — Admin Console — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-7H artifact (the **last** Doc-7 surface). Next: Independent Hard Review → Structure Patch → short closure check → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Program | **Doc-7 — Frontend Realization**; Doc-7H = the **Admin Console** — the platform-staff governance/operations surface (moderation, bans, suggestions triage, import, verification workflow, outreach + cross-module Admin governance) |
| Realizes | the frozen **Doc-5J** Admin surface (BC-ADM-1…6; 32 caller-facing) + **cross-module Admin legs** (Doc-5D ad-review/profile-status/category · Doc-5E routing-control · Doc-5G trust-publication/verification reads · Doc-5I plan-catalog incl. `activate_plan` · Doc-5C suspend/reinstate/ownership-recovery · Doc-5H support), on Doc-7C `(admin)` route group, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (HR11) |
| Authority | Conforms to `Doc-7A`/`7B`/`7C` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5J + cross-module Admin surfaces |
| Coins | **Nothing** — binds frozen Admin contracts by pointer; the single Doc-2 §8 event `VendorBanned` is by pointer; view/route names are presentation vocabulary |

**Governing rule (Admin-decides / owning-module-owns):** the Admin Console invokes wired **Admin** commands; the **owning module owns the data, decision, and effect** — the console **never bypasses an owning module's domain** (R5; Red Flag #8). It is **platform-scoped (no active-org)**, makes **no matching/routing/award/eligibility decision** (R7 moat), and **computes/writes no governance score** (R8 Trust firewall — Admin owns workflow, Trust owns the decision/score). Coins nothing.

---

## Decisions proposed for ratification (R-set `HR1…HR12`)
*(`HRn` = Doc-7H realization decisions — distinct from `DR-7-*`.)*

- **HR1 — Scope: the Admin Console (platform-staff; no active-org).** Realizes the Doc-5J Admin surface + cross-module Admin legs. Mounts in the Doc-7C **`(admin)` route group** — **no `Iv-Active-Organization`** (platform-scoped; `Doc-5J R2`; `Doc-5A §7.3`); consumes the 7B kit + 7C client by reference. **Admin-decides / owning-module-owns** (HR9); authors its own views only.
- **HR2 — Moderation (Doc-5J BC-ADM-1).** Bind `create_moderation_case`, `assign_moderation_case`, `decide_moderation_case` + reads (`get_moderation_case`, `list_moderation_cases`). The `create` dual-template **caller leg only** (the System auto-queue leg is §10 out-of-wire). `moderation_cases` machine (Doc-4M). No Event.
- **HR3 — Bans & enforcement (Doc-5J BC-ADM-2).** Bind `issue_ban`, `lift_ban` + reads. **`issue_ban` emits the single Doc-2 §8 event `VendorBanned`** (R9; the only event Doc-7H surfaces drive). `expire_ban` is **System (§10 out-of-wire)** — displayed, never invoked. `ban_actions` machine (Doc-4M).
- **HR4 — Suggestions triage (Doc-5J BC-ADM-3; link non-disclosure R6).** Bind `decide_category_suggestion`, `triage_missing_vendor_suggestion`, `close_missing_vendor_suggestion`, `confirm_link_suggestion`, `dismiss_link_suggestion` + reads. **Link suggestions are non-disclosure-sensitive** (`Doc-5J R6`; Invariant #11 `link_suggestions`) — the triage is **staff-internal**, never exposed to a tenant/vendor; confirming/dismissing a link never reveals a buyer's private association.
- **HR5 — Import (Doc-5J BC-ADM-4).** Bind `submit_import_job` (**create-then-poll** — R10) + reads (`get_import_job`, `list_import_jobs`, `list_import_rows`). `process_import_job` is **System (§10 out-of-wire)** — the console submits + polls, never runs the job. `import_jobs` machine (Doc-4M).
- **HR6 — Verification workflow (Doc-5J BC-ADM-5; Trust firewall R8).** Bind `queue_verification_task`, `assign_verification_task`, `decide_verification_task` + reads. **The Admin owns the verification WORKFLOW; Trust (M5) owns the DECISION/record/score** — `verification_tasks ≠ trust.verification_records/decisions` (`Doc-5J R8`). `decide_verification_task` records the Admin workflow outcome that **feeds Trust in-process**; the console **writes no trust/performance/financial-tier score** (auto-calculated under System; Invariant #6). `verification_tasks` machine (Doc-4M).
- **HR7 — Outreach (Doc-5J BC-ADM-6; moat R7).** Bind `create_outreach_campaign`, `run_outreach_campaign`, `complete_outreach_campaign`, `add_outreach_contact`, `update_outreach_contact` + reads. **Vendor outreach is informational acquisition only** (`Doc-5J R7`) — **no procurement/matching/award surface**. `outreach_campaigns` machine (Doc-4M).
- **HR8 — Cross-module Admin governance legs (owning-module Admin commands).** Bind the **Admin legs** of other modules — each is the **owning module's** Admin command (Admin-decides / owning-module-owns): **ad review** (`review_advertisement` — Doc-5D BC-MKT-5), **vendor-profile governance** (`set_vendor_profile_status` — Doc-5D BC-MKT-1), **category governance** (`create_category`/`update_category`/`set_category_status` — Doc-5D BC-MKT-2), **trust publication** (`freeze_trust_score`/`reactivate_trust_score` — Doc-5G; **publication/ranking effect only, never edits the value** — R8), **verification reads** (Doc-5G staff reads — case detail/fraud/admin ratings, staff-internal), **plan catalog** (`create_plan`/`update_plan`/`retire_plan`/**`activate_plan`**/`bundle_plan_entitlement`/`create_entitlement` — Doc-5I BC-BILL-1 Admin; **`activate_plan` lands here**, flagged from Doc-7E), **routing control** (`assist_routing` Stage-gated human-assist / `manage_routing_rule` + `get_matching_results` Admin — Doc-5E §7), **identity governance** (org/user suspend-reinstate, ownership recovery — Doc-5C Admin subset, no org context), **support** (`staff_can_support` ticket/delivery-status — Doc-5H). Each binds the **owning module's** frozen Admin contract by pointer; the console **never bypasses the owning module's domain** (R5; Red Flag #8).
- **HR9 — Admin-decides / owning-module-owns (R5) — load-bearing.** The console invokes wired Admin commands; the **owning module owns the data/decision/effect**. M8's Admin→owning-module effects (verification decision, category/link/import writes) are M8's **in-process service calls** (never the frontend's); other legs are the respective module's Admin command. The frontend **never directly writes another module's data** (contracts-only — One Module, One Owner).
- **HR10 — Firewalls (R7 moat · R8 Trust · score firewall).** **R7:** the console makes **no matching/routing/ranking/supplier-selection/award/eligibility decision** — `assist_routing` adjusts routing **rules/human-assist** (Stage-gated), never an award/winner (the no-auto-decision moat holds). **R8:** Admin verification = workflow; Trust owns the decision/score; `freeze_/reactivate_trust_score` is **publication/ranking only**, never edits a value; the console **writes no governance score**. Flag-and-halt if a matching/award/score-write surface is proposed.
- **HR11 — No active-org; staff non-disclosure; applicable Appendix A.** **No `Iv-Active-Organization`** (Admin platform-scoped — `Doc-5A §7.3`). Staff-internal reads (verification case detail, fraud signals, admin ratings, link suggestions) are **staff-only, never tenant/public** (`Doc-5G R10`/`Doc-5J R6`). Applicable `CHK-7-xxx`: full set **except** active-org (`CHK-7-010/012` adapt — **no active-org**; the console is gated on **Admin staff slugs** — `CHK-7-011` UX gating applies); declared with reasons at content.
- **HR12 — Coins nothing.** Binds frozen Admin contracts by pointer; the single event `VendorBanned` by pointer; gaps → flag-and-halt (`[ESC-7-API]`), never invent.

---

## The Doc-7H section spine (authored in content passes)

| § | Title | Realizes |
|---|---|---|
| §0 | Document Control, Precedence & Gating | governance §3; Doc-7A §0 |
| §1 | Scope & the Admin Console's Place (no active-org; Admin-decides) | HR1/HR9 |
| §2 | Moderation | HR2; Doc-5J BC-ADM-1 |
| §3 | Bans & Enforcement (VendorBanned) | HR3; Doc-5J BC-ADM-2 |
| §4 | Suggestions Triage (link non-disclosure) | HR4; Doc-5J BC-ADM-3 |
| §5 | Import | HR5; Doc-5J BC-ADM-4 |
| §6 | Verification Workflow (Trust firewall) | HR6; Doc-5J BC-ADM-5 |
| §7 | Outreach (moat) | HR7; Doc-5J BC-ADM-6 |
| §8 | Cross-Module Admin Governance Legs | HR8; Doc-5D/5E/5G/5I/5C/5H Admin |
| §9 | Admin-Decides / Owning-Module-Owns & Firewalls | HR9/HR10; R5/R7/R8 |
| §10 | State-Machine UI, No-Active-Org & Non-Disclosure | HR11; Doc-4M; staff-internal |
| §11 | Composition, Data, Authz, Baseline & Conformance | HR11/HR12 |
| Appendix | View / Contract-Binding Skeleton | HR2–HR8 |

*Doc-7H authors no kit/shell, no tenant surface, and **never the matching/routing engine, a score write, or an owning-module domain bypass**. Actual pages realized in content passes.*

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7H handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Consumes frozen Doc-7B kit + Doc-7C `(admin)` shell | By reference | No |
| **DR-7-API** | Views bind frozen Doc-5J + cross-module Admin legs | Consistency cross-check; `[ESC-7-API]` on a gap | Possible |
| **DR-7-STATE** | Moderation/ban/import/verification/outreach UI per Doc-4M | Bound by pointer (HR2–HR7) | No |
| `[ESC-7-API]` | A view needs a non-existent/wrong-actor/non-Admin contract | Flag-and-halt; additive Doc-5x patch (Board) | Possible |
| `[ESC-7-DESIGN]` | A composed embedded component needs allocation | Doc-7B definer | Possible |

## Fences / out of scope

The kit/shell (Doc-7B/7C) · any tenant surface (Doc-7D/7E/7F/7G) · the **matching/routing engine** (System out-of-wire; Admin adjusts rules, never runs matching/awards — R7) · **writing a trust/performance/financial-tier score** (Trust owns — R8) · **bypassing an owning module's domain** (R5; Red Flag #8 — the console calls the owning module's Admin command, never writes its data directly) · **active-org context** (Admin has none) · exposing staff-internal data to a tenant/public · coining any contract/route-as-API/field/event/state/POLICY key · the e2e / RBAC **test** obligation (Doc-8).

---

## Provenance & next steps

- **Provenance:** grounded in `Doc-5J` (M8 Admin surface BC-ADM-1…6 verified — 32 caller; `VendorBanned` R9; Admin-decides/owning-module-owns R5; moat R7; Trust firewall R8; link non-disclosure R6; no active-org) + cross-module Admin legs (`Doc-5D`/`5E`/`5G`/`5I`/`5C`/`5H`) + `Doc-7A/7B/7C` (frozen) + `Doc-4J` (authoritative event catalog). No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. R-set `HR1…HR12`; section spine §0–§11 + skeleton.
- **Next (Board-directed loop):** Independent Hard Review → Structure Patch → short closure check → Structure Freeze Audit → `Doc-7H_Structure_v1.0_FROZEN` → Doc-7H content passes → **Doc-7 surface program COMPLETE** (7A–7H all frozen).

*End of Doc-7H Canonical Structure **Proposal v0.1** — structure only. On any conflict, Doc-7A/7B/7C + the frozen corpus win; flag-and-halt. Doc-7H realizes the Admin Console over the frozen Doc-5J + cross-module Admin surfaces; Admin-decides/owning-module-owns; no active-org; no matching/award/score-write; coins nothing. The last Doc-7 surface. Next: Independent Hard Review.*
