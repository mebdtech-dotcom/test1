# Motion Standard — Enterprise UI Animation

**Status:** Living engineering standard v1.0 (2026-07-10, owner-directed). Applies to **every
team and agent** touching frontend code. Non-authoritative under the frozen corpus; visual
design authority stays with Doc-7. This document governs *how things move* and is the **single
source of truth for motion timing, easing, and animated-property rules**: it supersedes
`design_philosophy.md` §2.6 wherever they conflict (recorded in that document's v1.1 amendment
note; RV-0154 F1, **Board-ratified 2026-07-10**). Framer Motion is an approved frontend stack
dependency (CLAUDE.md §2, additive patch v1.2).

---

## 1. The Rule

Animations are **subtle, professional, and fast**. Motion communicates state change — it never
decorates.

| Constraint | Value |
|---|---|
| Library | **Framer Motion** (v12, installed) for client-side choreography; the CSS token layer for server-rendered / Radix-driven surfaces (§3) |
| Duration | **150–250 ms** (micro-interactions 150; entrances 200; large surfaces like drawers 250) |
| Easing | **easeOut** (`--iv-ease-out` / `MOTION_EASE.out`) for entrances; **easeInOut** (`--iv-ease-in-out` / `MOTION_EASE.inOut`) for state morphs |
| Distance | Translations ≤ 8 px; scale within 0.95–1.0 |
| Forbidden | Bounce, spring overshoot (`--iv-ease-spring` is legacy — do not use in new work), flashes, infinite attention-seeking loops, anything > 300 ms |
| Accessibility | `prefers-reduced-motion` is respected globally (§5) — never opt out |
| Performance | **Movement** (entrances, exits, position/size change): `opacity` + `transform` **only** (GPU-composited). **State/hover feedback** may additionally transition the cheap paint properties `color` / `background-color` / `border-color` / `box-shadow` (+ `filter` on small elements like buttons). **Never** animate layout properties (`width`/`height`/`top`/`left`/`margin`/`padding`) except Radix accordion height (measured, contained). No layout thrashing. |

## 2. Shared vocabulary — never duplicate

Reuse the shared variants/utilities. **Writing a new one-off duration, easing, or keyframe in a
surface is a review finding (duplication-as-architecture, Review-A lane).**

- **Framer Motion layer** — `src/frontend/motion/` (import from `@/frontend/motion`):
  - `MOTION_DURATION` / `MOTION_EASE` / `MOTION_STAGGER` — the numeric tokens.
  - `fadeIn`, `fadeInRise`, `scaleIn`, `staggerContainer`, `staggerItem` — shared variants.
  - `<MotionProvider>` — LazyMotion (strict) + `MotionConfig reducedMotion="user"`; mounted once
    in the root layout. All motion components use `m.*` (never `motion.*` — strict mode enforces this).
  - `<PageTransition>` — route-change entrance, keyed on the pathname; wired via the
    per-route-group `template.tsx` files (`app/(public|app|auth)/template.tsx`), mounted BELOW
    each shell so chrome never remounts. (A root template does not remount on within-group
    navigations — RV-0154 F-B1; the pathname key, not template semantics, replays the entrance.)
  - `<FadeIn>`, `<Stagger>`, `<StaggerItem>` — entrance wrappers for **client** surfaces.
- **CSS token layer** (Tailwind + `globals.css`) — for Server Components and Radix `data-state`
  animation:
  - Durations `duration-150 / -200 / -250` for motion work; easing `ease-iv-out` /
    `ease-iv-in-out` (these also drive `tailwindcss-animate` animation duration/easing).
    The legacy named steps (`duration-fast` = 100ms, `duration-normal` = 200ms) predate this
    standard — `fast` sits **below** the 150ms floor and remains valid only for pre-existing
    paint-feedback transitions, never for new movement.
  - Entrance utilities: `animate-iv-fade-in`, `animate-iv-slide-up`, `animate-iv-scale-in`.
  - Stagger choreography: `iv-stagger-rise` (grids/cards) and `iv-stagger-fade` (table rows) —
    apply to the **parent**; children animate with a capped 30 ms stagger.
  - Skeletons: `animate-iv-skeleton` (200 ms fade-in, then gentle pulse).

## 3. Which layer to use (binding)

| Surface | Layer | Why |
|---|---|---|
| Page transitions | Framer Motion (per-group `template.tsx` → `<PageTransition>`, pathname-keyed) | fires on every client navigation regardless of template remount semantics; skips the initial SSR paint (LCP-safe) |
| Modal / Dialog, Drawer / Sheet, Dropdown, Popover open/close | **CSS `data-state` layer** on the Radix primitives | Radix owns the mount lifecycle; CSS keeps primitives server-friendly, zero extra JS, no `forceMount` hacks. Durations/easing use the same tokens, so motion is indistinguishable from the FM layer. **Do not retrofit `AnimatePresence` into Radix kit primitives.** |
| Card / grid entrance | `iv-stagger-rise` on the container (already applied in `ResultsGrid`); `<FadeIn>`/`<Stagger>` on client surfaces | grids are Server Components by kit contract |
| Table row appearance | `iv-stagger-fade` on `<tbody>` (already applied in `DataListTable`) | fade only — translate breaks `position: sticky` cells |
| Button hover/tap | CSS in the `Button` primitive (`active:scale-[0.98]`, tokenized transitions) | the kit Button is server-render-friendly by frozen contract (no hooks) — wrapping it in `m.button` would break `asChild`/SSR |
| Skeleton fade | `animate-iv-skeleton` (in the `Skeleton` primitive) | pure CSS, streams with RSC |
| Bespoke client choreography (wizards, multi-step reveals, exit animations) | Framer Motion with the **shared variants** | the one place FM is mandatory |

**Kit contract guard:** primitives documented "Server-render-friendly (no hooks)" must stay that
way — motion for them is CSS-token-only. Framer Motion components live in `src/frontend/motion/`
and are **deliberately not re-exported from the main `src/frontend` barrel** (bundle discipline —
the RV-0126 barrel-leak lesson). Import via `@/frontend/motion`.

## 4. Performance rules

1. Movement animates `opacity`/`transform` only (GPU-composited); state/hover feedback may
   also transition the §1 paint properties; `filter` transitions are allowed on small elements
   (buttons) only.
2. No `layout`/`layoutId` FM props on list-sized collections; no `AnimatePresence` around large
   trees.
3. Framer Motion is loaded through `LazyMotion` with lazily-imported `domAnimation` features —
   never import `motion` from `framer-motion` directly (use `m`); `strict` mode will throw.
4. Stagger delays are hard-capped at 200 ms **by construction in both layers**: the CSS layer
   pins every child from the 8th onward to `animation-delay: 200ms`; the FM layer computes
   per-item delay as `min(index × MOTION_STAGGER.step, MOTION_STAGGER.cap)` (`StaggerItem
   index` prop / `FadeIn delay` clamp). Entrance animations must never delay data visibility
   beyond ~400 ms worst case.
5. Never animate on scroll handlers; use CSS or IntersectionObserver-driven one-shot entrances
   if ever needed (Board-gate anything beyond that).

## 5. Reduced motion

- Global guard in `app/globals.css`: `@media (prefers-reduced-motion: reduce)` collapses all
  animation/transition durations app-wide.
- `MotionConfig reducedMotion="user"` disables FM transform motion for those users (opacity
  fades remain, which is the intended enterprise fallback).
- Never add motion that encodes **meaning** only in movement — state must always be readable
  statically (chips, text, aria).

## 6. Review checklist (Review-A / Review-B addendum)

- [ ] Duration within 150–250 ms; easing is a shared token (no raw cubic-beziers in surfaces).
- [ ] Variants imported from `@/frontend/motion` or utilities from the CSS token layer — no
      inline one-off keyframes/variants.
- [ ] `m.*` + LazyMotion (no full `motion` import; no new `framer-motion` import outside
      `src/frontend/motion/` unless it is a client surface using shared variants).
- [ ] Movement animates only `opacity`/`transform` (paint-property transitions allowed for
      state/hover feedback per §1); sticky/layout-sensitive elements fade only.
- [ ] Server-component kit contracts not broken by a `"use client"` addition for motion.
- [ ] No bounce/spring/overshoot; nothing loops infinitely except skeleton/shimmer loading
      states.
- [ ] Reduced-motion behavior verified (DevTools → Rendering → emulate reduced motion).
