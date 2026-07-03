"use client";

// Platform shell — desktop primary sidebar (IA §3.3/§4.3 · Doc-7C SR2). PRESENTATION ONLY: renders the
// nav sections passed by props (derived server-side from participation + role + entitlements — IA §4.1,
// deferred). Active state is read from the current route segment; collapse is an ephemeral presentation
// preference. Counts must be non-disclosure-safe (Invariant #11). Reuses the frozen kit Button.
import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/primitives/button";
import { NAV_ICONS } from "./icons";
import type { NavItem, NavSection } from "./types";

/**
 * `pathname` from `usePathname()` never includes the query string, so a query-bearing href (e.g.
 * `/rfqs?state=draft`, the Draft Requests filter) needs an EXACT path+query match; a query-less
 * href keeps the original prefix-match behavior (so `/rfqs/123` still activates a plain `/rfqs`
 * link) but only when the CURRENT url also carries no query — otherwise `/rfqs?state=draft` would
 * incorrectly also mark the query-less "My RFQs" (`/rfqs`) link active.
 */
function isActive(pathname: string, search: string, href: string): boolean {
  const qIndex = href.indexOf("?");
  const hrefPath = qIndex === -1 ? href : href.slice(0, qIndex);
  const hrefQuery = qIndex === -1 ? "" : href.slice(qIndex + 1);
  if (hrefQuery) return pathname === hrefPath && search === hrefQuery;
  return (
    (pathname === hrefPath && search === "") ||
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
  const active = isActive(pathname, search, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-iv-nav-selected-bg text-iv-nav-selected-fg"
          : "text-iv-nav-fg hover:bg-iv-nav-hover",
        collapsed && "justify-center px-0",
        indented && !collapsed && "py-1.5 pl-9 text-[13px] font-normal",
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
  const hasActiveChild = item.children?.some((c) => isActive(pathname, search, c.href)) ?? false;
  const panelId = `nav-group-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-iv-nav-fg transition-colors hover:bg-iv-nav-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
          {item.children.map((child) => (
            <li key={child.href}>
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
      if (item.children?.some((c) => isActive(pathname, search, c.href))) return item.label;
    }
  }
  return null;
}

export function Sidebar({ nav }: { nav: NavSection[] }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [collapsed, setCollapsed] = React.useState(false);
  const userToggledRef = React.useRef(false);

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

  return (
    <div
      data-collapsed={collapsed}
      className={cn(
        "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r border-iv-nav-border bg-iv-nav-bg md:flex",
        collapsed ? "w-16" : "w-[264px]",
      )}
    >
      <nav aria-label="Primary" className="flex-1 overflow-y-auto p-3">
        {nav.map((section) => (
          <div key={section.id} className="mb-4 last:mb-0">
            {section.label && !collapsed ? (
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
                    collapsed={collapsed}
                    isOpen={openGroup === item.label}
                    onToggle={() => setOpenGroup((cur) => (cur === item.label ? null : item.label))}
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
          className="w-full justify-center gap-2 text-iv-nav-fg hover:bg-iv-nav-hover hover:text-white"
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
      </div>
    </div>
  );
}
