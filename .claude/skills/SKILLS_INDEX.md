# iVendorz Claude Code Skills Index

Complete reference for all available skills (built-in + custom).

---

## Quick Reference Table

| Skill | Type | When to Use | Purpose |
|-------|------|------------|---------|
| `/security-review` | Built-in | Before commit (security-touching code) | Generic security scan for injection, auth, secrets |
| `/ivendorz-security` | Custom | Before commit (any data/auth change) | Multi-tenant isolation + governance checks |
| `/frontend-design` | Built-in | Designing new UI from scratch | Generic design framework (hero, typography, motion) |
| `/ivendorz-fe-design` | Custom | Applying design to new pages | Frozen palette, kit, patterns specific to iVendorz |
| `/fe-checklist` | Custom | Before commit (frontend code) | Code quality, kit duplication, prettier, routes |
| `/fe-design-apply` | Custom | Building new pages/components | Reuse existing patterns (sidebar, grid, tabs, forms) |
| `/fe-verify-bundle` | Custom | Before Review-B (code-split changes) | Prod-build verification, chunk ownership, barrel audits |
| `/ivendorz-verify-fe` | Custom | After building pages (end-to-end test) | Full verification: design, governance, journey, perf |
| `/artifact-design` | Built-in | Designing Artifact previews | Design guidance for HTML/markdown/React preview panes |
| `/dataviz` | Built-in | Creating charts/dashboards | Data visualization framework (palette, accessibility) |
| `/code-review` | Built-in | After code complete (pre-merge) | General code review (bugs, efficiency, duplication) |
| `/review-a-lens` | Custom | After code complete (Review-A gate) | Architecture & governance conformance check |
| `/verify` | Built-in | Before commit (end-to-end test) | Generic end-to-end verification (not frontend-specific) |

---

## Skill Workflows

### Workflow 1: Write Frontend Code

```
Dev writes code
    ↓
/fe-checklist (before git commit)
    ├─ prettier, tsc, eslint pass?
    ├─ no kit duplication?
    ├─ no barrel re-export leaks?
    └─ routes registered?
    ↓
/ivendorz-fe-design (optional: design conformance audit)
    ├─ tokens, typography, patterns matched?
    └─ frozen kit used?
    ↓
/ivendorz-verify-fe (after local testing)
    ├─ page loads, no console errors
    ├─ journeys work end-to-end
    ├─ responsive, performant
    └─ error states graceful
    ↓
/fe-verify-bundle (if code-split/lazy-load changes)
    ├─ isolated prod build OK
    ├─ chunk manifest correct
    └─ barrel re-exports clean
    ↓
git commit → push
    ↓
/review-a-lens (Review-A, Team-4)
    ├─ scope, contracts, governed signals, privacy?
    └─ verdict: PASS/REVISION/BLOCKER
    ↓
/code-review (Review-B & beyond, optional)
    ├─ bugs, efficiency, duplication?
    └─ verdict: PASS/FINDINGS
```

### Workflow 2: Write Backend/Data Code

```
Dev writes code
    ↓
/ivendorz-security (before git commit)
    ├─ org context validated?
    ├─ RLS policy aligned?
    ├─ private fields hidden?
    └─ cross-module access OK?
    ↓
/review-a-lens (Review-A, Team-4)
    ├─ scope, contracts, signals, privacy?
    └─ verdict: PASS/REVISION/BLOCKER
    ↓
/code-review (Review-B, optional)
    ├─ bugs, efficiency?
    └─ verdict: PASS/FINDINGS
    ↓
/security-review (optional: generic security audit)
```

### Workflow 3: Design New Page

```
Designer/PM: "Build the Vendor RFQ Inbox"
    ↓
/fe-design-apply
    ├─ "card grid pattern?" (list of RFQs)
    └─ "tabs pattern?" (Inbox, Drafts, Sent)
    ↓
Dev: Build components using frozen kit
    ├─ Use WorkspaceTabs from kit
    ├─ Use Card grid (12 col, 24px gap)
    └─ Token colors only (Navy, Indigo, Gold)
    ↓
/ivendorz-fe-design (conformance check)
    ├─ Palette matched?
    ├─ Typography correct?
    ├─ No kit duplication?
    └─ Pattern from frozen library?
    ↓
/ivendorz-verify-fe (end-to-end test)
    ├─ Page loads, data flows
    ├─ Interactions responsive
    └─ Edge cases handled
    ↓
Submit for Review-A
```

---

## Common Scenarios

### "I'm building a new page"
1. **Reference:** `/fe-design-apply` → pick pattern (sidebar+content, grid, tabs)
2. **Code:** Use frozen kit (`src/frontend/`)
3. **Verify:** `/ivendorz-verify-fe` → test journey end-to-end
4. **Review:** `/review-a-lens` → conformance gate

### "I'm touching auth or multi-tenant data"
1. **Code:** Validate org context server-side
2. **Check:** `/ivendorz-security` → firewall, RLS, privacy
3. **Review:** `/review-a-lens` → governance lens

### "I made a code-split or lazy-load change"
1. **Check:** `/fe-checklist` → prettier, tsc, lint
2. **Verify:** `/fe-verify-bundle` → prod-build, chunk ownership
3. **Review:** `/review-a-lens` → scope + `/code-review` → quality

### "I'm designing a chart or dashboard"
1. **Use:** `/dataviz` → chart type, colors, accessibility
2. **Code:** Frozen palette + data visualization framework
3. **Verify:** `/ivendorz-verify-fe` → data flows, responsive

### "I'm unsure if my code matches the architecture"
1. **Check:** `/review-a-lens` → scope, contracts, signals, privacy
2. **If BLOCKER:** Flag-and-Halt, escalate to human review

---

## Skill Depth Reference

### Level 1: Quick Gating (5–10 min)
- `/fe-checklist` — prettier, tsc, lint, routes
- `/ivendorz-security` — 8-point org/auth/privacy checklist

### Level 2: Design Conformance (10–20 min)
- `/ivendorz-fe-design` — palette, tokens, patterns, kit
- `/fe-design-apply` — reuse pattern templates
- `/review-a-lens` — scope, contracts, governance

### Level 3: End-to-End Verification (20–30 min)
- `/ivendorz-verify-fe` — 8-layer verification (run app, design, governance, journey, state matrix, perf, edge cases, prod build)
- `/fe-verify-bundle` — isolated prod build, chunk manifests, barrel audits

### Level 4: Comprehensive Review (30–60 min)
- `/code-review` — bugs, efficiency, duplication
- `/security-review` — injection, auth, secrets, crypto
- `/verify` (built-in) — general end-to-end verification

---

## Built-in Skills Reference

### `/frontend-design`
**Purpose:** Generic UI/page design framework
**When:** Designing new UI from scratch
**Approach:** Hero-as-thesis, typography-as-personality, structure-as-information
**Output:** Design plan (palette, typefaces, layout concept)

### `/artifact-design`
**Purpose:** Design guidance for Artifact previews (HTML/markdown/React mockups)
**When:** Building mockups in Claude artifacts (preview pane)
**Scope:** NOT production code, just artifact visuals

### `/dataviz`
**Purpose:** Data visualization framework (charts, graphs, dashboards)
**When:** Building charts or data visualizations
**Reference:** `references/palette.md` (brand palette for charts)

### `/code-review`
**Purpose:** General code review (bugs, efficiency, duplication)
**When:** After code is functionally complete
**Effort levels:** low/medium/high/ultra (ultra = cloud multi-agent)

### `/security-review`
**Purpose:** Generic security scan (injection, auth, secrets, crypto)
**When:** Before commit on security-touching code
**Scope:** Not iVendorz-specific (use `/ivendorz-security` for multi-tenant)

### `/verify`
**Purpose:** End-to-end verification (run app, test journeys)
**When:** Before commit, confirm changes work
**Scope:** Generic, not frontend-specific

---

## Custom Skills Reference

### `/ivendorz-security`
**Purpose:** Multi-tenant data isolation + governance checks
**Scope:** 8-point checklist (org context, auth layer, privacy, cross-module, signals, secrets, soft-delete, money)
**Severity:** BLOCKER for org bypass, cross-schema SQL, signal mutation
**Location:** `.claude/skills/ivendorz-security-checklist/SKILL.md`

### `/ivendorz-fe-design`
**Purpose:** Frozen design system application
**Scope:** Palette (Navy, Indigo, Gold), typography, layout patterns, kit primitives
**Reference:** Doc-7B (kit foundation), frozen tokens
**Location:** `.claude/skills/ivendorz-fe-design/SKILL.md`

### `/fe-checklist`
**Purpose:** Frontend pre-commit gating
**Scope:** prettier, tsc, lint, kit duplication, barrel audits, routes, content reality, responsive, tokens, a11y
**Severity:** MINOR for formatting, MAJOR for kit duplication or barrel leaks
**Location:** `.claude/skills/fe-checklist/SKILL.md`

### `/fe-design-apply`
**Purpose:** Reuse frozen design patterns
**Scope:** 8 pattern templates (sidebar+content, card grid, tabs, forms, table, hero, modal, document flow) + composition rules + selection matrix
**Output:** Quick reference to apply frozen patterns to new pages
**Location:** `.claude/skills/fe-design-apply/SKILL.md`

### `/fe-verify-bundle`
**Purpose:** Isolated production-build verification
**Scope:** 8-layer check (worktree, chunk manifest, barrel audits, code-split, parity, route ownership, size, prettier)
**When:** Mandatory before Review-B on code-split changes
**Reference:** Memory "Review-B: isolated production build" (RV-0126 lesson)
**Location:** `.claude/skills/fe-verify-bundle/SKILL.md`

### `/ivendorz-verify-fe`
**Purpose:** Full frontend end-to-end verification
**Scope:** 8-layer verification (run app, design conformance, governance, journey, state matrix, performance, edge cases, prod build)
**When:** After local testing, before Review-A
**Location:** `.claude/skills/ivendorz-verify-fe/SKILL.md`

### `/review-a-lens`
**Purpose:** Review-A (Architecture & Governance) conformance gate
**Scope:** 8-point check (scope/modules, coined fields, firewall, privacy, contracts, routes, invariants, types)
**Role:** Team-4 (Review-A) — catches conformance issues before Review-B
**Reference:** CLAUDE.md §7 (Authority Order), §8 (AI Rules), §13 (Review Governance)
**Location:** `.claude/skills/review-a-lens/SKILL.md`

---

## How to Invoke

**In Claude Code:**
```bash
/fe-checklist
/ivendorz-security
/review-a-lens
etc.
```

**Or ask Claude directly:**
```
"Run /fe-checklist on my frontend changes"
"Use /ivendorz-verify-fe to test the vendor page"
```

---

## Severity Ladder (Review Findings)

Reference: CLAUDE.md §13 (Review & Findings Governance)

| Severity | Meaning | Gating? | Example |
|----------|---------|--------|---------|
| **BLOCKER** | Violates frozen corpus, invariant, or Golden Rule; wrong/unsafe | Yes | Org context bypass, cross-schema SQL, signal mutation |
| **MAJOR** | Substantive defect; degrades correctness/security/conformance | Yes | Kit duplication, invented status field, hard delete |
| **MINOR** | Real but contained defect; doesn't threaten correctness | Yes | Prettier drift, missing route registration, 404 vs 403 leak |
| **NITPICK (NIT)** | Style/clarity/polish | No (deferrable) | Comment style, variable naming |
| **OBS** | Observation — neutral note; no action implied | No | Future-watch item, architectural curiosity |

**Gate rule:** BLOCKER = 0 · MAJOR = 0 · MINOR = 0 before merge. NITPICK & OBS never block.

---

## Validation Findings Gate (§13)

Every finding is adjudicated against four questions before action:

1. **Valid?** — Factually correct?
2. **Applicable?** — Applies in this scope/context?
3. **Best for product?** — Right outcome, not just local fix?
4. **Consistent with frozen corpus?** — Conform upward (§7)? If conflict → Flag-and-Halt, escalate.

A finding failing any question is recorded with disposition but **not** implemented.

---

## Reference Links

- **CLAUDE.md:** §5 (Invariants), §4 (Governance), §13 (Review Governance), §7 (Authority)
- **Doc-2, Doc-4A–4M:** Architecture + contracts
- **Doc-7B–7G:** Frontend UI specs + kit
- **Memory:** Team-4 role, FE-PM model, review pipeline, frozen foundation
- **scripts/verify-fe-wbs-coverage.mjs:** Route registry verification
- **IMPLEMENTATION_START_HERE.md:** Page universe + pre-PR checklist
