# ivendorz-verify-fe Skill

**Invoke:** `/ivendorz-verify-fe`

## Purpose
Extends `/verify` with iVendorz-specific frontend checks. Verifies that UI changes work end-to-end while conforming to frozen architecture, governance, and design system.

## When to Use
- After building any new page or major component
- Before submitting to Review-A
- To verify user journeys work correctly (not just tests)
- Multi-module touches that need integration verification

---

## Verification Scope

### Layer 1: Run the App
Start dev server and manually test the golden path:
```bash
pnpm run dev
# Open http://localhost:3000
# Navigate to your new/modified page
# Test: click, scroll, form submit, error states
```

**Checklist:**
- [ ] Page loads (no 404)
- [ ] Layout renders correctly (sidebar, content, tabs)
- [ ] Real data displays (not empty state forever)
- [ ] No console errors (check DevTools)
- [ ] Forms submit successfully
- [ ] Error states show gracefully

---

### Layer 2: Design System Conformance
Verify the UI matches frozen design decisions:

- [ ] Colors use only token names (Navy, Indigo, Gold, semantics)?
- [ ] Text sizes use Tailwind scale (text-sm, text-lg), not pixels?
- [ ] Spacing uses 8px/16px/24px grid, not random values?
- [ ] No raw HTML elements (`<input>`, `<button>`) where kit primitives exist?
- [ ] Layout matches frozen pattern (sidebar+content, card grid, tabs)?
- [ ] Responsive: tested on mobile (320px) and desktop (1024px+)?

**Run:**
```bash
# Responsive test in DevTools
Ctrl+Shift+M (or right-click → Inspect → toggle device toolbar)
# Test: iPhone SE, iPad, Desktop
```

---

### Layer 3: Governance Conformance
Verify the feature respects frozen invariants (if multi-tenant or auth-touching):

- [ ] Org context validated on server (not client-supplied)?
- [ ] RLS policies align with app-layer auth checks?
- [ ] Private fields never leaked in public responses?
- [ ] Cross-module access only via services, never direct DB queries?
- [ ] No hard-coded secret credentials in code?

---

### Layer 4: Journey Completeness
Test the user flow end-to-end:

**Example: Buyer approves PO**
- [ ] Buyer navigates to Operations → Documents
- [ ] Selects a PO (real data, not fixture)
- [ ] Clicks "Approve"
- [ ] Modal shows confirmation
- [ ] Clicks "Confirm Approval"
- [ ] PO status changes to "Approved" in real-time
- [ ] Success toast appears
- [ ] Page reflects the change (no manual refresh needed)

**Example: Vendor submits quotation**
- [ ] Vendor navigates to RFQ Inbox
- [ ] Opens an RFQ (real data)
- [ ] Clicks "Create Quotation"
- [ ] Form populated with defaults
- [ ] Vendor edits line items
- [ ] Clicks "Submit"
- [ ] Quotation appears in RFQ comparison (buyer's side)
- [ ] Notification sent (check logs or mock)

---

### Layer 5: State Matrix (loading / empty / error / success)
Every surface has more states than its happy path. Walk the full matrix for each new/changed
surface. **Presentation-only phase:** verify the states render correctly from props/fixtures
(no network to simulate); **wired surfaces:** exercise them live with the DevTools steps below.

**Loading:**
- [ ] Route has a `loading.tsx` (skeleton-first convention — e.g. `app/(app)/workspace/rfqs/[rfqId]/quotation/loading.tsx`) or a Suspense fallback
- [ ] Skeleton uses kit `Skeleton` (`src/frontend/primitives/skeleton.tsx`) or a shared content skeleton (e.g. `VendorContentSkeleton`) — never a spinner-only blank page
- [ ] Skeleton mirrors the loaded layout (no layout shift when content resolves)

**Empty:**
- [ ] Kit `EmptyState` (`src/frontend/components/empty-state.tsx`) with honest title/description + optional action
- [ ] Copy NEVER implies exclusion, filtering, or a hidden decision (GI-12; Invariant #11 — blacklist must be undetectable). "No RFQs yet" ✓ · "No vendors match your criteria" ✗ on governed lists
- [ ] No fabricated counts ("0 of 128") unless the contract provides the number

**Error:**
- [ ] Network error → error message, not blank page
- [ ] Permission denied → Unauthorized surface, not 500 — and 404-vs-403 must not leak whether a private record exists
- [ ] Form validation → client + server-side both work
- [ ] Session expired → redirects to login, not silent fail

**Success / confirmation:**
- [ ] Submit → visible confirmation (toast, state change, or confirmation panel)
- [ ] The surface reflects the new state without a manual refresh
- [ ] Presentation-only phase: disabled actions carry an honest note ("Totals and VAT calculate in the integration phase", "Drafts are kept on this device") — never a fake success or fake save

**Test (wired surfaces):**
```bash
# Loading: DevTools → Network → Slow 3G, hard-reload the route → skeleton must show
# Empty: point at a fixture/org with no rows
# Network error: DevTools → Network → Offline, retry the action
# Permission error: modify API response in DevTools
# Session loss: delete/clear localStorage
```

---

### Layer 6: Performance Sanity
Verify no egregious regressions:

- [ ] Page loads in <3s (first contentful paint)
- [ ] Interactions respond within <100ms (no lag)
- [ ] No memory leaks in Network tab (repeating requests)
- [ ] Lazy-loaded components load on-demand, not eagerly

**Check:**
```bash
DevTools → Performance → Record
# Perform user action (click, type, scroll)
# Stop, analyze: look for long Tasks, excessive repaints
```

---

### Layer 7: Responsive Edge Cases
Test boundary conditions:

- [ ] Very long text (company name 100+ chars) → text wraps, doesn't overflow
- [ ] Empty states → show placeholder message
- [ ] Lists with 100+ items → pagination or scroll
- [ ] Modal on mobile → full-screen or responsive width
- [ ] Touch interactions (if applicable) → work on mobile

---

### Layer 8: Production Build Parity
Verify it works in production build (catches turbopack issues):

```bash
pnpm run build
pnpm run start
# Navigate to your page
# Test the same golden path as Layer 1
```

**Critical for:**
- Code-split components (`React.lazy`)
- Barrel re-exports
- CSS-in-JS (if any)
- Image optimization

---

## Verification Checklist Template

Copy this for each verification:

```
🟢 VERIFIED: [Page/Feature Name]

Layer 1 - Run the App:
- [ ] Page loads, no 404
- [ ] Layout renders
- [ ] Real data displays
- [ ] No console errors
- [ ] Forms work

Layer 2 - Design Conformance:
- [ ] Colors: tokens only
- [ ] Text: Tailwind scale
- [ ] Spacing: 8/16/24px grid
- [ ] No kit duplication
- [ ] Layout pattern matched
- [ ] Responsive (320px, 1024px+)

Layer 3 - Governance:
- [ ] Org context validated (if applicable)
- [ ] RLS aligned (if applicable)
- [ ] Private fields hidden (if applicable)
- [ ] No secrets in code

Layer 4 - Journey:
- [ ] [User flow step 1] ✓
- [ ] [User flow step 2] ✓
- [ ] [User flow step 3] ✓

Layer 5 - State Matrix:
- [ ] Loading: loading.tsx / skeleton, no layout shift
- [ ] Empty: kit EmptyState, exclusion-silent copy, no fabricated counts
- [ ] Error: network / permission (no 404-vs-403 leak) / validation / session
- [ ] Success: confirmation visible; honest notes on unwired actions

Layer 6 - Performance:
- [ ] Loads <3s
- [ ] Interactions responsive (<100ms)
- [ ] No memory leaks

Layer 7 - Edge Cases:
- [ ] Long text handled
- [ ] Empty states shown
- [ ] Mobile responsive

Layer 8 - Prod Build:
- [ ] `pnpm build` succeeds
- [ ] `pnpm start` runs
- [ ] Golden path works
```

---

## If Verification Fails

**Page won't load?**
- Check console for errors
- Verify route exists in `app/` directory
- Check API response (DevTools → Network)

**Data missing?**
- Verify API endpoint exists + returns data
- Check database has test data
- Verify org context passed correctly

**Styling wrong?**
- Check token names (should be `--iv-*`)
- Verify Tailwind config loaded
- Check media query for dark mode

**Permission denied?**
- Verify user has correct role/capability
- Check RLS policy matches auth gate
- Verify org ID passed to query

**Performance slow?**
- Check for N+1 queries
- Verify lazy-load components load on-demand
- Look for missing indexes in database

---

## Reference

- `/fe-checklist` — pre-commit gates
- `/fe-verify-bundle` — prod-build verification
- `/ivendorz-fe-design` — design conformance rules
- `/ivendorz-security-checklist` — auth/data governance
- `/verify` — built-in skill (general verification)
