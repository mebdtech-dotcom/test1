# Doc-7F — Content Pass-1 **Patch v1.0.1** (applies Pass-1 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7F_Content_v1.0_Pass1.md` (§0–§3) |
| Applies | `Doc-7F_Content_Pass1_Independent_Hard_Review_v1.0.md` (1 MAJOR + 2 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-1 **+ this patch** = clean §0–§3 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-2 (§4–§7) |
| Discipline | Additive; nothing coined; moat boundary corrected against the frozen surface |

---

## Changes

### C-1 — closes **MAJOR-1** (buyer never invites — engine-generated; the moat)
**Verified `Doc-5E`:** no buyer invite/send_invitation/target command exists; invitations are engine-generated (`assemble_and_route_wave`, §8 out-of-wire). §2 reframed:
> Discovery (`search_catalog` / `list_vendor_directory` / favorites) lets the buyer **research and reference** vendors **while authoring the RFQ** — not to invite them. **The buyer issues no invitation.** Any buyer-specified target/preferred vendor is an **RFQ authoring input** (Doc-5E §4) the **engine considers**; the **engine generates invitations out-of-wire per governed routing** (FR3 — the moat). A direct buyer invitation, if ever required, is `[ESC-7-API]` — never assumed/coined.

§2.1 retitled "vendor discovery (research/reference)"; the word "invite" is removed from the discovery framing.

### C-2 — closes **MINOR-1** (internal approval role-gated)
§3.2 note added: the internal approval is **role-gated** — `approve_rfq`/`reject_internal_rfq` are gated (UX) on the **approver's** permission slug, distinct from the submitter (e.g. Director approves an Officer's `submit_rfq`); the **server re-validates** inside the wired command (`Doc-7A §4.3`).

### C-3 — closes **MINOR-2** (favorites per-membership)
§2.2 amended: favorites are **per-membership** (the user's membership in the active org), consistent with BC-MKT-7 (membership-only, no slug).

### C-4 — closes **NITPICK-1** (Doc-4M routed-state label)
§3.3 amended: the post-approval RFQ state is bound to its **Doc-4M state label by pointer** (confirmed at content); "routed by the engine" is descriptive, not a coined state. The engine's routing/matching transitions are System (out-of-wire), displayed not invoked.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 buyer never invites | MAJOR | C-1: discovery = research/reference; engine routes; no buyer invite | **CLOSED** — moat boundary correct |
| MINOR-1 approval role-gated | MINOR | C-2: approver-slug-gated, distinct from submitter | **CLOSED** |
| MINOR-2 favorites per-membership | MINOR | C-3 | **CLOSED** |
| NITPICK-1 Doc-4M state label | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** The moat is correct — the buyer authors RFQs and references vendors via discovery; the engine generates invitations out-of-wire; the buyer never invites. Nothing coined.

**Next pass:** Content Pass-2 (§4–§7) — routing & invitation observability (§4), quotation viewing (§5), comparison & award — no auto-decision (§6), post-award operations (§7) — through the same loop.

*End of Content Pass-1 Patch v1.0.1 + Short Closure Check. Effective §0–§3 = Pass-1 + this patch. Additive; nothing coined; moat boundary corrected.*
