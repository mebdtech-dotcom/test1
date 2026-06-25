# Doc-5J — Structure Proposal v0.1 — Independent Hard Review v0.1

| Field | Value |
|---|---|
| Subject | `Doc-5J_Structure_Proposal_v0.1.md` (M8 Admin Operations — API Realization canonical structure proposal) |
| Review date | 2026-06-26 |
| Reviewer role | Independent Hard Review — Architecture / API Governance Board (adversarial; anchors re-verified verbatim against frozen Doc-4J / Doc-2 / Doc-5A) |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §6/§8`; `Doc-5A_SERIES_FROZEN_v1.0` (gate); `Doc-4J_FROZEN_v1.0` (M8 contracts, FROZEN) |
| Verdict | **CONDITIONAL — NOT yet freeze-ready.** Foundation is sound (count, partition, slugs, machines, single-event, carried register all **verified correct**). **3 MAJOR** must be resolved before structure freeze (all resolvable additively in the proposal → no architecture change, no escalation): R10 async mischaracterization, coined `§F-ADM-N` anchor, R5/§10 cross-module-mechanism conflation. 4 MINOR + 3 NITPICK + 1 observation follow. **0 BLOCKER.** |

## 1. Verified-correct (re-counted / re-anchored against frozen Doc-4J)

| Claim | Verdict | Evidence |
|---|---|---|
| **34 operation tokens** = 32 caller-facing + 2 out-of-wire | ✅ | Doc-4J Appendix A register (L359–364): BC-ADM-1(5)/2(5)/3(7)/4(5)/5(5)/6(7); out-of-wire = `expire_ban` (L123) + `process_import_job` (System) |
| Partition §4(5)/§5(4)/§6(7)/§7(4)/§8(5)/§9(7) = 32; §10 = 2 | ✅ | reconciles to 34 |
| `create_moderation_case` + `queue_verification_task` are dual-template (Admin caller leg **does** exist) | ✅ | BC-ADM-1 L73 "Admin · `staff_can_moderate_rfq` / System"; BC-ADM-5 L292 "Admin · `staff_can_verify` / System" — caller leg realized, System leg → §10 (count integrity holds) |
| Sole Doc-2 §8 event = `VendorBanned` (BC-ADM-2 `issue_ban`); BC-ADM-1/3/4/5/6 No Event | ✅ | BC-ADM-2 L121; H.7 |
| Schema `admin`, token `admin.<op>.v1`, error `admin_`, no route/token split | ✅ | Doc-4J L9–10/24 |
| Platform-staff only; no org context; delegation n/a | ✅ | H.3 (§5.6) |
| 8 frozen machines (Doc-2 §3.9); slugs `staff_can_moderate_rfq`/`staff_can_ban`/`staff_can_manage_categories`(cat-only)/`staff_can_verify` + `[ESC-ADM-SLUG]`; `staff_super_admin` override | ✅ | H.5; H.3; per-BC Pass-A bindings |
| Synchronous write-via-service legs exist: verification→Trust, category-approve→Marketplace, link-confirm→Operations | ✅ | BC-ADM-5 L285/L294; BC-ADM-3 L180/L191 (category via Marketplace service); BC-ADM-3 L183/L193 (link columns via Operations service) |

No BLOCKER: the proposal coins no endpoint/status/header/error-class/slug/POLICY-key/event; the count and partition are exact; no architecture invariant is violated.

## 2. MAJOR findings (resolve before structure freeze)

**MAJOR-01 — R10 mischaracterizes the async surface (two errors).**
- (a) **`run_outreach_campaign` is NOT async.** BC-ADM-6 (L303, L330, L337, L347) shows `run`/`complete` as plain `draft → running → completed` **state commands** with optimistic concurrency; BC-ADM-6 has **no 21.5 System contract** and **no async job**. R10 must **remove `run_outreach_campaign`** — it realizes as a `POST` state command (`200`), full stop.
- (b) **`submit_import_job` synchronously creates the job resource.** BC-ADM-4 returns `job_id, state=queued`; the System `process_import_job` advances `queued → processing → completed|failed` out-of-wire; the caller polls `get_import_job`. This is the **create-resource-then-poll** shape — the frozen evidence points to **`201` created-queued + status-resource polling** (the Doc-5F/5G status-resource-is-source-of-truth precedent), **not** an open `201`-vs-`202` coin-flip. Reframe R10: `submit_import_job` is the sole create-then-poll surface; **lean `201`** (confirm the exact success code from the Doc-4J response shape at content); `202` only if Doc-4J models no synchronous resource. **Drop outreach from R10 entirely.**

**MAJOR-02 — Coined section anchor `§F-ADM-N`.** §4–§10 cite "`Doc-4J §F-ADM-1…6`" throughout. The frozen Doc-4J uses **`# BC-ADM-N`** headers (e.g. L36 `# BC-ADM-1 — Moderation`, L255 `# BC-ADM-5 …`), not `§F-ADM-N` — a non-existent anchor (reference-never-restate violation). **Correct every `§F-ADM-N` citation to `Doc-4J BC-ADM-N`.** (The `§F`-numbering belongs to Doc-2/Doc-4F-style sources, not Doc-4J.)

**MAJOR-03 — R5/§10 conflate three distinct cross-module mechanisms.** The proposal's single "write-via-service legs" list mixes three categorically different things; they must be separated:
- (a) **synchronous in-command write-via-service** (the genuine Admin-decides/owning-module-owns mechanism, R5): `decide_verification_task` → Trust (`trust.verification_decisions`), `decide_category_suggestion`(approve) → Marketplace (category catalog), `confirm_link_suggestion` → Operations (link columns on `operations.private_vendor_records`). These are caller-command in-transaction service calls (BC-ADM-3 L191/L193; BC-ADM-5 L294).
- (b) **System-worker write**: import-seed → Marketplace happens inside `process_import_job` (the out-of-wire System leg, §10) — not a caller command.
- (c) **event-consumer effect**: **ban reflection → Marketplace is the Marketplace consumer of `VendorBanned`** (DD-3; BC-ADM-2 L121/L126 "Marketplace's `reflect_vendor_ban` consumer effect") — **NOT an M8 write-via-service call.** It belongs with R9 / the `VendorBanned` outbox-delivery leg.

R5 must scope to (a) only; §10 must list (a) as the fenced internal legs of the relevant caller commands, (b) under `process_import_job`, and (c) under the `VendorBanned` outbox delivery (R9). **Remove ban-reflection from the write-via-service list** — as written it misstates the mechanism (an event consumer is not a synchronous service write).

## 3. MINOR findings

**MINOR-01 — Unified suggestion read binds per-root slug.** `get_suggestion`/`list_suggestions` carry a `root` discriminator; authz = `staff_can_manage_categories` (category) / `[ESC-ADM-SLUG]` (missing-vendor, link — link staff-only) **per root** (BC-ADM-3 L194). §6 should state the per-root read-slug binding explicitly and mark a missing/ambiguous root-slug binding a content blocker (consistent with the §3 per-command bound-slug rule).

**MINOR-02 — Precedence chain incomplete (§0).** §0 shows "… → Doc-4A → Doc-4J → Doc-5A → Doc-5J → Code." M8 consumes Doc-4B (Core) + Doc-4C (Identity); match the Doc-5F form: "… Doc-4A → Doc-4B → Doc-4C → Doc-4J → Doc-5A → Doc-5J → Code."

**MINOR-03 — R6 overstates an M8 tenant-leak risk.** R2 establishes M8 has **no tenant/public surface**, so "link content never tenant-visible" is structurally guaranteed (no tenant wire exists to leak through). The active non-disclosure mechanism realized **on M8's wire** is the uniform **`NOT_FOUND` collapse for unauthorized/cross-scope staff reads** (BC-ADM-3 L170/L194, §7.5); the vendor-facing side is the owning module's (Operations/Marketplace) concern. Sharpen R6 to state both facts rather than implying M8 guards a tenant-facing read it does not have.

**MINOR-04 — §4 "feeds the Doc-3 pipeline via the owning module" implies a push that does not exist.** BC-ADM-1 (L78 AI-precision): "the decision feeds the Doc-3 pipeline, **it does not transition the RFQ here**"; moderation emits **No Event**. There is no M8→RFQ write-via-service and no event — the RFQ/Doc-3 pipeline **consumes** the moderation-case state RFQ-side. §4 should say the decision is consumed downstream RFQ-side, **with no M8 cross-module write and no event** (drop "via the owning module"). Note: moderation is therefore **not** one of the R5 write-via-service legs (correctly already absent from that list — keep it absent).

## 4. NITPICK / observation

- **NP-01** — Header "Realizes: 34 operation tokens": add a parenthetical that Doc-4J's Appendix A register groups reads as `get/list_X` rows, so **34 = the realization-unit (operation-token) count**, reconciled to the grouped register — preempts a token-vs-row counting dispute (the clarity Doc-5F/5G carried).
- **NP-02** — §2 "bound platform-staff slug" column will carry **`[ESC-ADM-SLUG]`** for the missing-vendor / link / import / outreach rows (12 of 32 caller tokens) — note the column carries the marker, not a coined slug.
- **NP-03** — The caller disclosure enumeration is effectively single-valued (`Staff-Internal`); keep the per-read rule for symmetry but note its near-degeneracy — the substantive binding-rule work for M8 is the **per-command bound-slug rule** (the M8 analog of M4's actor-side rule).
- **OBSERVATION O-01** (cross-module trace for the Board) — M8 `link_suggestions` ownership is the reciprocal of Doc-5F (M4) **DF-5**: the link-suggestion **entity** is Admin-owned (M8 BC-ADM-3); `confirm_link_suggestion` writes the link **columns** on `operations.private_vendor_records` via the Operations service (DR-ADM-OPS / A-03), while M4's tenant-side `confirm_vendor_link` writes its own row. Same private record, different actor/side — no conflict. Worth a one-line note in §1.x.

## 5. Disposition

| ID | Severity | Resolution |
|---|---|---|
| MAJOR-01 | MAJOR | Reframe R10: `submit_import_job` only, lean `201` create-then-poll; remove `run_outreach_campaign` (pure state command); resolve exact code from Doc-4J at content |
| MAJOR-02 | MAJOR | Replace all `Doc-4J §F-ADM-N` → `Doc-4J BC-ADM-N` (verify each at apply) |
| MAJOR-03 | MAJOR | Split R5/§10 into (a) synchronous write-via-service caller legs, (b) `process_import_job` System write, (c) `VendorBanned` consumer effect; remove ban-reflection from write-via-service |
| MINOR-01 | MINOR | §6: per-root read-slug binding explicit; ambiguity = content blocker |
| MINOR-02 | MINOR | §0 precedence: add Doc-4B → Doc-4C |
| MINOR-03 | MINOR | R6: no-tenant-surface (R2) + `NOT_FOUND` collapse — both, not a tenant-leak guard |
| MINOR-04 | MINOR | §4: moderation decision consumed RFQ-side, no M8 write, no event |
| NP-01/02/03 · O-01 | NITPICK / OBS | apply as worded |

**All resolutions are additive to the proposal and within Doc-5J's authority** (anchor corrections + mechanism-classification precision + a transport-shape lean derived from the frozen Doc-4J response). **No architecture change, no escalation, no frozen-doc edit.** On disposition of MAJOR-01/02/03 + MINOR-01…04, the proposal is freeze-ready as `Doc-5J_Structure_v1.0_FROZEN` (R-set becomes R1–R10 with R10 narrowed; partition unchanged at 32+2).

*Independent Hard Review — non-authoritative provenance record. On any conflict, frozen Doc-4J / Doc-2 / Doc-5A win; flag-and-halt. Anchors re-verified verbatim against `Doc-4J_FROZEN_v1.0` (BC-ADM-1…6, Appendix A/B).*
