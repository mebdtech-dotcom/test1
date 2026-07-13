// Vendor Workspace — Dashboard header card (VX-01, owner-directed dashboard redesign). Bundles the
// org chip + a search shortcut + notification/message/profile icon links into one card at the top
// of the dashboard, mirroring the buyer track's own `DashboardHeaderCard`
// ((buyer)/dashboard/dashboard-view.tsx) byte-for-byte in posture: this is a DECORATIVE duplicate of
// controls the shared shell topbar already renders (org switcher, search, notifications, user menu)
// — plain navigation LINKS only, deliberately NOT a second live dropdown-menu stack alongside the
// topbar's real ones (owner-confirmed acceptable duplication, same BX-06 precedent). Identity is the
// SAME neutral placeholder the shell renders (`VENDOR_IDENTITY_SEED`) — never a second,
// independently-fabricated name (Inv #5).
import Link from "next/link";
import { Bell, Building2, MessageSquare, Search } from "lucide-react";
import { initials } from "../../shell";

export function DashboardHeaderCard({ userName, orgName }: { userName: string; orgName: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-iv-xs sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex max-w-[220px] items-center gap-2 truncate rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
          <Building2 aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{orgName}</span>
        </span>

        <Link
          href="/sell/company/products"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-iv-xs transition-colors hover:bg-accent sm:max-w-xs"
        >
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="truncate">Search products, suppliers, equipment…</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/sell/notifications"
            aria-label="Notifications"
            className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
          >
            <Bell aria-hidden className="size-5" />
          </Link>
          <Link
            href="/sell/inquiries"
            aria-label="Buyer inquiries"
            className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
          >
            <MessageSquare aria-hidden className="size-5" />
          </Link>
          <Link
            href="/sell/company"
            aria-label="Company profile"
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-iv-navy-700 text-xs font-medium text-primary-foreground">
              {initials(userName)}
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <p className="text-xl font-semibold tracking-tight text-foreground">Good Morning</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {userName} · {orgName}
        </p>
      </div>
    </div>
  );
}
