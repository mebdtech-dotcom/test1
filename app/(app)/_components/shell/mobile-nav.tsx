"use client";

// Platform shell — mobile navigation drawer (IA §7.2/§7.3 · Doc-7C SR2/SR3). PRESENTATION ONLY. Reuses
// the frozen kit Sheet; renders the same nav sections as the desktop Sidebar (closes on navigate) and —
// per IA §7.3 — relocates the org-switcher into the drawer header on mobile (the topbar hides it below
// `md`). The trigger (hamburger) shows only below `md`.
import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/primitives/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/frontend/primitives/sheet";
import { OrgSwitcher } from "./org-switcher";
import { NAV_ICONS } from "./icons";
import { resolveActiveSurface, toNavBlocks } from "./hybrid-nav";
import type { NavItem, NavSection, ShellOrg, SurfaceSwitchItem } from "./types";

/** Mirrors the desktop `Sidebar`'s `isActive` — see its comment for why `search` is needed
 *  (query-bearing hrefs like `/rfqs?state=draft` never match on `pathname` alone) and for the
 *  `activeAcrossQuery` opt-in (a surface-parent like the merged `/sell/rfqs` stays lit across its
 *  own `?view=`/`?state=` variants — Cluster #1 · Team-1 F2). */
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

/** A leaf link — used both for flat top-level items and for a group's indented children. Mirrors
 *  the desktop `Sidebar`'s `NavLink`, wrapped in `SheetClose` so the drawer closes on navigate. */
function NavLink({
  item,
  pathname,
  search,
  indented,
}: {
  item: NavItem;
  pathname: string;
  search: string;
  indented?: boolean;
}) {
  const Icon = item.icon ? NAV_ICONS[item.icon] : null;
  const active = isActive(pathname, search, item.href, item.activeAcrossQuery);
  return (
    <SheetClose asChild>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium",
          active
            ? "bg-iv-nav-selected-bg text-iv-nav-selected-fg"
            : "text-iv-nav-fg hover:bg-iv-nav-hover",
          indented && "py-1.5 pl-9 font-normal",
        )}
      >
        {Icon && !indented ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
        <span className="truncate">{item.label}</span>
      </Link>
    </SheetClose>
  );
}

/** A group header (e.g. "RFQs") with indented children — an ACCORDION disclosure, one group open
 *  at a time (`isOpen`/`onToggle`, state owned by `MobileNav`). Mirrors the desktop `Sidebar`'s
 *  `NavGroup`; the header is a `<button>`, not a link. */
function NavGroup({
  item,
  pathname,
  search,
  isOpen,
  onToggle,
}: {
  item: NavItem;
  pathname: string;
  search: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon ? NAV_ICONS[item.icon] : null;
  const hasActiveChild =
    item.children?.some((c) => isActive(pathname, search, c.href, c.activeAcrossQuery)) ?? false;
  const panelId = `mobile-nav-group-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] font-medium text-iv-nav-fg hover:bg-iv-nav-hover",
          hasActiveChild && "text-iv-nav-selected-fg",
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && item.children && item.children.length > 0 ? (
        <ul id={panelId} className="flex flex-col gap-0.5">
          {item.children.map((child) => (
            <li key={child.href}>
              <NavLink item={child} pathname={pathname} search={search} indented />
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

interface MobileNavProps {
  nav: NavSection[];
  surfaces?: SurfaceSwitchItem[];
  /** The blocks that fold by route — role workspaces PLUS Account. Superset of `surfaces`; see
   *  `types.ts` → `foldableSurfaces`. The drawer carries no lens CONTROL (SD-8: it would sit beside
   *  the org switcher this header relocates in), so it uses only this list — it applies the fold
   *  through its one-click surface headers, exactly as SD-8 prescribes. */
  foldableSurfaces?: SurfaceSwitchItem[];
  org?: ShellOrg;
  organizations?: ShellOrg[];
}

// `useSearchParams()` triggers a client-side-rendering bailout during static prerendering, so its
// caller must sit under a Suspense boundary (Next.js 15 — missing-suspense-with-csr-bailout). The
// fallback renders the same drawer with an empty query string (active-state falls back to
// pathname-only); the real query is applied on hydration. Only `useSearchParams` bails —
// `usePathname()` stays in the inner component.
export function MobileNav(props: MobileNavProps) {
  return (
    <React.Suspense fallback={<MobileNavInner {...props} search="" />}>
      <MobileNavWithSearch {...props} />
    </React.Suspense>
  );
}

function MobileNavWithSearch(props: MobileNavProps) {
  const search = useSearchParams().toString();
  return <MobileNavInner {...props} search={search} />;
}

function MobileNavInner({
  nav,
  foldableSurfaces,
  surfaces,
  org,
  organizations,
  search,
}: MobileNavProps & { search: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Mirrors the desktop rail exactly (see `sidebar.tsx`): fold by the SUPERSET list, so Account folds
  // here too and the two navs cannot drift into two dialects of the co-mount.
  const foldable = foldableSurfaces ?? surfaces;

  // Which block is foregrounded ([ESC-7G-A7R] SD-2) — route-derived, via the SAME resolver the desktop
  // rail and the sidebar control use.
  const activeSurface = resolveActiveSurface(foldable, pathname);

  // Accordion: at most ONE group open at a time (mirrors the desktop `Sidebar`); navigating into a
  // group's page auto-opens that group.
  const [openGroup, setOpenGroup] = React.useState<string | null>(() =>
    findActiveGroupLabel(nav, pathname, search),
  );
  React.useEffect(() => {
    const activeGroup = findActiveGroupLabel(nav, pathname, search);
    if (activeGroup) setOpenGroup(activeGroup);
  }, [nav, pathname, search]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-iv-nav-bg p-0">
        <SheetHeader className="gap-3 border-b border-iv-nav-border p-4 text-left text-iv-nav-fg">
          <SheetTitle className="text-iv-nav-fg">Menu</SheetTitle>
          <SheetDescription className="sr-only">Primary navigation</SheetDescription>
          {/* IA §7.3 — org-switcher relocates into the drawer header on mobile. */}
          {org ? <OrgSwitcher activeOrg={org} organizations={organizations ?? [org]} /> : null}
        </SheetHeader>
        <nav aria-label="Primary" className="overflow-y-auto p-3">
          {/* Same co-mount blocking rule as the desktop Sidebar (shared `toNavBlocks`) so the two navs
              never drift: a surface's sections render under ONE strong header inside an accent rail;
              untagged sections render exactly as before. */}
          {toNavBlocks(nav).map((block) => {
            // The fold — identical rule to the desktop rail (see `sidebar.tsx` for the full
            // SD-1/SD-5/SD-6 rationale): a backgrounded block collapses to a header LINK, one click
            // away, never removed. Trust appears in neither list, so it always renders in full.
            const foldableSurface = Boolean(
              block.surface && foldable?.some((s) => s.label === block.surface),
            );
            const backgrounded =
              foldableSurface && activeSurface !== null && block.surface !== activeSurface;
            const surfaceHref = backgrounded
              ? foldable?.find((s) => s.label === block.surface)?.href
              : undefined;

            return (
              <div key={block.surface ?? block.sections[0].id} className="mb-4 last:mb-0">
                {block.surface ? (
                  surfaceHref ? (
                    <SheetClose asChild>
                      <Link
                        href={surfaceHref}
                        className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-iv-nav-fg-muted hover:bg-iv-nav-hover hover:text-iv-nav-fg"
                      >
                        <span className="truncate">{block.surface}</span>
                        <ChevronRight aria-hidden className="size-3.5 shrink-0" />
                      </Link>
                    </SheetClose>
                  ) : (
                    <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-iv-nav-fg">
                      {block.surface}
                    </p>
                  )
                ) : null}
                {backgrounded ? null : (
                  <div className={cn(block.surface && "ml-3 border-l border-iv-nav-border pl-2")}>
                    {block.sections.map((section, sectionIndex) => (
                      <div key={section.id} className={cn(sectionIndex > 0 && "mt-3")}>
                        {section.label ? (
                          <p className="px-3 pb-1 text-2xs font-semibold uppercase tracking-wide text-iv-nav-fg-muted">
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
                                isOpen={openGroup === item.label}
                                onToggle={() =>
                                  setOpenGroup((cur) => (cur === item.label ? null : item.label))
                                }
                              />
                            ) : (
                              <li key={item.href}>
                                <NavLink item={item} pathname={pathname} search={search} />
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
      </SheetContent>
    </Sheet>
  );
}
