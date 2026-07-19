"use client";

// Platform shell — desktop primary sidebar (IA §3.3/§4.3 · Doc-7C SR2). PRESENTATION ONLY: renders the
// nav sections passed by props (derived server-side from participation + role + entitlements — IA §4.1,
// deferred). Active state is read from the current route segment; collapse is an ephemeral presentation
// preference. Counts must be non-disclosure-safe (Invariant #11). Reuses the frozen kit Button.
import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/primitives/button";
import { NAV_ICONS } from "./icons";
import { resolveActiveSurface, toNavBlocks } from "./hybrid-nav";
import { SurfaceSwitcher } from "./surface-switcher";
import type { NavItem, NavSection, SurfaceSwitchItem } from "./types";

/**
 * `pathname` from `usePathname()` never includes the query string, so a query-bearing href (e.g.
 * `/rfqs?state=draft`, the Draft Requests filter) needs an EXACT path+query match; a query-less
 * href keeps the original prefix-match behavior (so `/rfqs/123` still activates a plain `/rfqs`
 * link) but only when the CURRENT url also carries no query — otherwise `/rfqs?state=draft` would
 * incorrectly also mark the query-less "My RFQs" (`/rfqs`) link active.
 *
 * `activeAcrossQuery` (opt-in per NavItem) relaxes ONLY that empty-query guard for a surface-parent
 * that owns its own query views: the merged `/sell/rfqs` must stay lit on `?view=board`/`?state=…`
 * (Cluster #1 · Team-1 F2). Query-bearing hrefs are unaffected — they keep exact path+query match, so
 * a deep-link child (documents-hub "Offers" `?state=submitted`) still activates only on its exact URL.
 */
function isActive(
  pathname: string,
  search: string,
  href: string,
  activeAcrossQuery = false,
): boolean {
  const qIndex = href.indexOf("?");
  const hrefPath = qIndex === -1 ? href : href.slice(0, qIndex);
  const hrefQuery = qIndex === -1 ? "" : href.slice(qIndex + 1);
  if (hrefQuery) return pathname === hrefPath && search === hrefQuery;
  return (
    (pathname === hrefPath && (activeAcrossQuery || search === "")) ||
    (hrefPath !== "/" && pathname.startsWith(hrefPath + "/"))
  );
}

/** A leaf link — used both for flat top-level items and for a group's indented children. */
function NavLink({
  item,
  pathname,
  search,
  collapsed,
  indented,
}: {
  item: NavItem;
  pathname: string;
  search: string;
  collapsed: boolean;
  indented?: boolean;
}) {
  const Icon = item.icon ? NAV_ICONS[item.icon] : null;
  const active = isActive(pathname, search, item.href, item.activeAcrossQuery);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-iv-nav-selected-bg text-iv-nav-selected-fg"
          : "text-iv-nav-fg hover:bg-iv-nav-hover",
        collapsed && "justify-center px-0",
        indented && !collapsed && "py-1.5 pl-9 font-normal",
      )}
    >
      {Icon && !indented ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {!collapsed && typeof item.badge === "number" && item.badge > 0 ? (
        <span
          data-numeric
          className="ml-auto rounded-full bg-iv-nav-badge-bg px-1.5 text-2xs tabular-nums text-iv-nav-badge-fg"
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

/** A group header (e.g. "RFQs") with indented children (e.g. "My RFQs" / "Draft Requests") —
 *  an ACCORDION disclosure: one group open at a time (`isOpen`/`onToggle`, state owned by
 *  `Sidebar`). The header is a `<button>`, not a link — `item.href` is a stable fallback, never
 *  rendered as `<a>` here. */
function NavGroup({
  item,
  pathname,
  search,
  collapsed,
  isOpen,
  onToggle,
}: {
  item: NavItem;
  pathname: string;
  search: string;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon ? NAV_ICONS[item.icon] : null;
  const hasActiveChild =
    item.children?.some((c) => isActive(pathname, search, c.href, c.activeAcrossQuery)) ?? false;
  const panelId = `nav-group-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={!collapsed && isOpen ? panelId : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] font-medium text-iv-nav-fg transition-colors hover:bg-iv-nav-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          hasActiveChild && "text-iv-nav-selected-fg",
          collapsed && "justify-center px-0",
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
        {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
        {!collapsed ? (
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
          />
        ) : null}
      </button>
      {!collapsed && isOpen && item.children && item.children.length > 0 ? (
        <ul id={panelId} className="flex flex-col gap-0.5">
          {/* Keyed by label, not href: two leaves in one group MAY share a destination when they are
              different affordances onto it (`vendor-shell-vm.ts` — "Microsite & Branding" and "View
              Public Page" both open the page that hosts the microsite's `live_url`). Labels are what
              distinguish them, which is why the group loop below keys the same way. */}
          {item.children.map((child) => (
            <li key={child.label}>
              <NavLink
                item={child}
                pathname={pathname}
                search={search}
                collapsed={collapsed}
                indented
              />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** The group (by `item.label`) whose children contain the current route, if any. */
function findActiveGroupLabel(nav: NavSection[], pathname: string, search: string): string | null {
  for (const section of nav) {
    for (const item of section.items) {
      if (item.children?.some((c) => isActive(pathname, search, c.href, c.activeAcrossQuery)))
        return item.label;
    }
  }
  return null;
}

// `useSearchParams()` triggers a client-side-rendering bailout during static prerendering, so its
// caller must sit under a Suspense boundary (Next.js 15 — missing-suspense-with-csr-bailout). The
// fallback renders the SAME sidebar with an empty query string (active-state falls back to
// pathname-only), so there is no layout shift; the real query is applied on hydration. Only
// `useSearchParams` bails — `usePathname()` stays in the inner component.
interface SidebarProps {
  nav: NavSection[];
  surfaces?: SurfaceSwitchItem[];
  foldableSurfaces?: SurfaceSwitchItem[];
  /** Optional static header pinned above the nav (e.g. the workspace identity strip). Presentation
   *  slot only — the shell renders whatever node it is given; it is never a nav item or a control. */
  header?: React.ReactNode;
}

export function Sidebar(props: SidebarProps) {
  return (
    <React.Suspense fallback={<SidebarInner {...props} search="" />}>
      <SidebarWithSearch {...props} />
    </React.Suspense>
  );
}

function SidebarWithSearch(props: SidebarProps) {
  const search = useSearchParams().toString();
  return <SidebarInner {...props} search={search} />;
}

function SidebarInner({
  nav,
  surfaces,
  foldableSurfaces,
  header,
  search,
}: SidebarProps & { search: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const userToggledRef = React.useRef(false);

  // The blocks that FOLD by route: the role workspaces PLUS Account (owner-RULED 2026-07-15, settling
  // the A7 packet's reserved A7.4 question). A superset of `surfaces`, which stays role-only because it
  // drives the participation CONTROL — see `types.ts` → `foldableSurfaces` for the full reasoning.
  // The `?? surfaces` fallback keeps every pre-existing nav rendering exactly as before.
  const foldable = foldableSurfaces ?? surfaces;

  // Which block is foregrounded ([ESC-7G-A7R] SD-2) — derived from the route, stored nowhere. The
  // `SurfaceSwitcher` runs the SAME resolver over its own (role-only) list, so the control and the rail
  // can never disagree about a role surface. On an Account route the control simply highlights neither
  // segment, which is honest: you are in no role workspace, and both stay one click away (SD-5).
  const activeSurface = resolveActiveSurface(foldable, pathname);

  // Accordion: at most ONE group open at a time. Navigating into a group's page auto-opens that
  // group (and, by construction, closes whichever else was open); the user can also freely
  // open/close groups by hand without navigating (browsing).
  const [openGroup, setOpenGroup] = React.useState<string | null>(() =>
    findActiveGroupLabel(nav, pathname, search),
  );
  React.useEffect(() => {
    const activeGroup = findActiveGroupLabel(nav, pathname, search);
    if (activeGroup) setOpenGroup(activeGroup);
  }, [nav, pathname, search]);

  // Tablet auto-collapse: below `lg` (1024px) default to the icon-rail, unless the user pins it.
  // Client-side only — SSR renders expanded and adjusts on mount (no hydration mismatch).
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      if (!userToggledRef.current) setCollapsed(mql.matches);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  // The RFQ create wizard is a focused, full-width task surface — no primary nav alongside it.
  if (pathname === "/buy/rfqs/new") return null;

  return (
    <div
      data-collapsed={collapsed}
      className={cn(
        "group sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r border-iv-nav-border bg-iv-nav-bg md:flex",
        collapsed ? "w-16" : "w-[264px]",
      )}
    >
      {/* Passive workspace identity header (owner-directed 2026-07-18) — a static label of the active
          workspace, pinned above the nav. NOT a switcher: not clickable, no toggle; switching lives in
          the top-right menu. Rendered as an opaque node the shell does not interpret. */}
      {header}

      {/* Participation lens ([ESC-7G-A7R] SD-8, amended by owner 2026-07-15: sidebar top, not topbar)
          — pinned ABOVE the nav it filters, outside the scroll area so it never scrolls away.
          EXPANDED ONLY: the 64px icon-rail cannot hold a two-option segmented control. Hiding it there
          is SD-5-safe rather than a gate, because the collapsed rail switches the lens OFF and draws
          every surface's icons in full (see the block loop below) — nothing becomes unreachable. */}
      {/* Deliberately `surfaces`, NOT `foldable`: this control is the PARTICIPATION lens and stays
          role-only (Buying | Selling). Account folds like a surface but is not a participation, so it
          never becomes a third segment here — `types.ts` → `foldableSurfaces` carries the ruling.
          On an Account route the control still renders with neither segment marked current, which is
          both honest and SD-5's requirement that each role surface stay one click away. */}
      {/* The `surfaces.length > 1` guard is deliberately repeated from `SurfaceSwitcher`'s own: without
          it a single-surface nav (e.g. admin) would render this bordered wrapper around a null child
          — a stray empty strip above the nav. */}
      {!collapsed && surfaces && surfaces.length > 1 ? (
        <div className="border-b border-iv-nav-border p-3">
          <SurfaceSwitcher surfaces={surfaces} />
        </div>
      ) : null}

      <nav aria-label="Primary" className="flex-1 overflow-y-auto p-3">
        {toNavBlocks(nav).map((block, index) => {
          // The fold ([ESC-7G-A7R] SD-1/SD-5). A block is BACKGROUNDED only when it is foldable (i.e.
          // it appears in `foldable`) and some OTHER foldable block is active. It is then collapsed to
          // its header — which is a LINK to that surface, keeping it exactly one click away. It is
          // never removed from `nav`, never disabled, never gated: the composed surface set is
          // identical however the sidebar is folded, which is what keeps this a fold and not the
          // Doc-7A §4.2-forbidden partition into "mutually exclusive apps".
          //
          // Account folds by this same rule (owner-RULED 2026-07-15) — one open, the rest closed,
          // every dashboard alike. It is foldable but NOT in `surfaces`, so it never becomes a segment
          // of the participation control; `types.ts` → `foldableSurfaces` carries that reasoning.
          //
          // `activeSurface === null` (a route belonging to no foldable block, or a single-surface nav)
          // ⇒ NOTHING is backgrounded — the fallback is always "show everything", never "hide
          // everything".
          //
          // SD-6: `Trust` carries a surface tag but appears in NEITHER list, so `foldableSurface` is
          // false and it renders in full however the rest is folded — terminal and always visible, by
          // construction rather than by a special case.
          //
          // COLLAPSED (64px icon-rail): folding does NOT apply. The surface header is not rendered at
          // that width, so backgrounding would leave an unlabelled surface with no way back in —
          // an SD-5 violation. The rail is already compact, so every surface stays fully drawn there
          // (identical to pre-lens behaviour) and the control remains the way to switch.
          const foldableSurface = Boolean(
            block.surface && foldable?.some((s) => s.label === block.surface),
          );
          const backgrounded =
            !collapsed &&
            foldableSurface &&
            activeSurface !== null &&
            block.surface !== activeSurface;
          const surfaceHref = backgrounded
            ? foldable?.find((s) => s.label === block.surface)?.href
            : undefined;

          return (
            <div
              key={block.surface ?? block.sections[0].id}
              // A visible divider + breathing room between every BLOCK, so the co-mounted surfaces
              // (Buying / Selling / Trust) read as distinct blocks — never a run-on list. Reuses the
              // shell's own nav-border token (no new token).
              className={cn(index > 0 && "mt-3 border-t border-iv-nav-border pt-3")}
            >
              {/* Surface header — deliberately STRONGER than a section label (full-strength ink,
                  bolder, wider tracking) so a surface reads as the PARENT of its sections rather than
                  a sibling. Rendered verbatim from the seam's tag; the shell interprets nothing.
                  Backgrounded, the same header becomes the one-click way back in. */}
              {block.surface && !collapsed ? (
                surfaceHref ? (
                  <Link
                    href={surfaceHref}
                    className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-iv-nav-fg-muted transition-colors hover:bg-iv-nav-hover hover:text-iv-nav-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="truncate">{block.surface}</span>
                    <ChevronRight aria-hidden className="size-3.5 shrink-0" />
                  </Link>
                ) : (
                  <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-iv-nav-fg">
                    {block.surface}
                  </p>
                )
              ) : null}
              {/* Accent rail — brackets every section owned by this surface. Expanded only: at 64px
                  the icon-rail has no room, and there the block dividers below carry the separation.
                  A backgrounded surface renders its header link ONLY — its sections stay in `nav`
                  (still composed, still routable) but are not drawn under this lens. */}
              {backgrounded ? null : (
                <div
                  className={cn(
                    block.surface && !collapsed && "ml-3 border-l border-iv-nav-border pl-2",
                  )}
                >
                  {block.sections.map((section, sectionIndex) => (
                    <div
                      key={section.id}
                      className={cn(
                        // Collapsed, the divider is the ONLY separation between icon groups, so
                        // sections inside a surface keep theirs. Expanded, the rail already brackets
                        // them — a divider per section would rebuild the flat run-on list this block
                        // replaced.
                        sectionIndex > 0 &&
                          (collapsed ? "mt-3 border-t border-iv-nav-border pt-3" : "mt-2"),
                      )}
                    >
                      {section.label && !collapsed ? (
                        <p className="px-3 pb-1.5 text-2xs font-semibold uppercase tracking-wide text-iv-nav-fg-muted">
                          {section.label}
                        </p>
                      ) : null}
                      <ul className="flex flex-col gap-0.5">
                        {section.items.map((item) =>
                          item.children && item.children.length > 0 ? (
                            <NavGroup
                              key={item.label}
                              item={item}
                              pathname={pathname}
                              search={search}
                              collapsed={collapsed}
                              isOpen={openGroup === item.label}
                              onToggle={() =>
                                setOpenGroup((cur) => (cur === item.label ? null : item.label))
                              }
                            />
                          ) : (
                            <li key={item.href}>
                              <NavLink
                                item={item}
                                pathname={pathname}
                                search={search}
                                collapsed={collapsed}
                              />
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-iv-nav-border p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            userToggledRef.current = true;
            setCollapsed((c) => !c);
          }}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full justify-center gap-2 text-iv-nav-fg hover:bg-iv-nav-hover hover:text-iv-nav-fg"
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
      </div>
    </div>
  );
}
