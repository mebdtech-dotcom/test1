import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import type { SessionUser } from "../contracts";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** A single breadcrumb entry. The last entry renders as the current page. */
export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export interface VendorShellProps {
  /** Page heading. */
  title: string;
  /** Optional supporting copy under the title. */
  description?: string;
  /** Breadcrumb trail; the final entry is treated as the current page. */
  breadcrumbs?: BreadcrumbEntry[];
  /** Optional action slot rendered on the right of the page header. */
  actions?: React.ReactNode;
  /** Id of the active nav slot (decided by the caller). */
  activeNavId?: string;
  /** Current user; `null` renders a generic placeholder. */
  user: SessionUser | null;
  /** Optional per-nav badge labels, keyed by nav id. */
  navBadges?: Record<string, string>;
  /** Optional notifications summary (e.g. "3 unread"); `null` shows none. */
  notificationsLabel?: string | null;
  /** Page content rendered inside the scrollable main region. */
  children?: React.ReactNode;
}

/**
 * VendorShell — the application layout for the vendor area.
 *
 * Composes the desktop sidebar, sticky top header (with mobile nav drawer),
 * an optional breadcrumb trail, a page header, and a scrollable main content
 * region. Pure presentation: every piece of content arrives via props and the
 * shell decides nothing about the data it frames. Mirrors BuyerShell so both
 * role areas share one design system and application shell.
 */
export function VendorShell({
  title,
  description,
  breadcrumbs,
  actions,
  activeNavId,
  user,
  navBadges,
  notificationsLabel = null,
  children,
}: VendorShellProps) {
  return (
    <div className="flex h-svh bg-background text-foreground">
      <Sidebar user={user} activeId={activeNavId} badges={navBadges} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          notificationsLabel={notificationsLabel}
          activeId={activeNavId}
          navBadges={navBadges}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <Fragment key={`${crumb.label}-${index}`}>
                        <BreadcrumbItem>
                          {isLast || !crumb.href ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {isLast ? null : <BreadcrumbSeparator />}
                      </Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            ) : null}

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
                {description ? (
                  <p className="text-sm text-muted-foreground text-pretty">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
