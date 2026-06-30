"use client";

// Vendor Workspace top bar (companion §2.4). A presentation frame around APP-SHELL-OWNED slots:
// the active-org indicator + org switcher, notification center and user menu are Doc-7C/M6-owned
// (SR3/SR6, GR12 composition firewall, CHK-7-005) — rendered here as inert placeholders OR injected
// via slots; the Vendor Workspace never re-implements them. The org "participation" badge is
// optional ([ESC-7-API #2]: a caller-facing participation read is genuinely missing from the wire),
// so it renders only when the integration phase supplies it. Presentation-only.
import * as React from "react";
import Link from "next/link";
import { Bell, Languages, Menu, PanelLeft, Search } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Separator } from "@/frontend/primitives/separator";
import { BrandMark } from "@/frontend/brand";
import { ShellSlotPlaceholder } from "./vendor-shell-slot";

/** Platform Participation dimension (Invariant 2 / DP8). Display label only — no logic. */
export type VendorParticipation = "buyer" | "vendor" | "hybrid" | "staff";

export interface VendorTopbarOrg {
  name: string;
  participation?: VendorParticipation;
}

export interface VendorTopbarProps {
  org?: VendorTopbarOrg;
  /** Inject the real shell-owned slots in the integration phase; placeholders render otherwise. */
  orgSwitcherSlot?: React.ReactNode;
  notificationSlot?: React.ReactNode;
  userMenuSlot?: React.ReactNode;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileNav?: () => void;
  /** Temporary URL prefix for the disposable mount segment (e.g. "/workspace"); see [ESC-7G-A7]. */
  basePath?: string;
  className?: string;
}

const PARTICIPATION_LABEL: Record<VendorParticipation, string> = {
  buyer: "Buyer",
  vendor: "Vendor",
  hybrid: "Hybrid",
  staff: "Staff",
};

export function VendorTopbar({
  org,
  orgSwitcherSlot,
  notificationSlot,
  userMenuSlot,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileNav,
  basePath = "",
  className,
}: VendorTopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--iv-z-sticky)] border-b border-border bg-background",
        className,
      )}
    >
      <div className="flex h-14 w-full items-center gap-2 px-3 sm:px-4">
        {/* Mobile: open the navigation drawer. */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={onOpenMobileNav}
        >
          <Menu aria-hidden="true" />
        </Button>

        {/* Desktop/tablet: collapse or expand the rail. */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
          aria-pressed={sidebarCollapsed}
          onClick={onToggleSidebar}
        >
          <PanelLeft aria-hidden="true" />
        </Button>

        <Link
          href={`${basePath}/dashboard`}
          className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark height={28} />
        </Link>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        {/* Active-org indicator + switcher (Doc-7C-owned slot). */}
        <div className="flex min-w-0 items-center gap-2">
          {orgSwitcherSlot ?? (
            <div className="flex min-w-0 items-center gap-2" data-shell-slot="org-switcher">
              <span className="truncate text-sm font-medium text-foreground">
                {org?.name ?? "Active organization"}
              </span>
              {org?.participation && (
                <Badge variant="neutral">{PARTICIPATION_LABEL[org.participation]}</Badge>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ShellSlotPlaceholder icon={Search} label="Search" className="hidden sm:inline-flex" />
          {notificationSlot ?? <ShellSlotPlaceholder icon={Bell} label="Notifications" />}
          <ShellSlotPlaceholder
            icon={Languages}
            label="Language"
            className="hidden md:inline-flex"
          />
          {userMenuSlot ?? (
            <button
              type="button"
              aria-label="Account menu (provided by the app shell)"
              aria-disabled="true"
              data-shell-slot="user-menu"
              className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar className="size-8">
                <AvatarFallback>IV</AvatarFallback>
              </Avatar>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
