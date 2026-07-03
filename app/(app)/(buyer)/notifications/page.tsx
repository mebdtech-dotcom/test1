// Notification center — full page (`/notifications`) — P-SH-02 (Doc-7C Shared Authenticated Shell ·
// T-LISTING; IA §5.4). A SERVER COMPONENT; ROUTING + COMPOSITION ONLY, mounted in the Platform Shell.
//
// RELOCATED into `(buyer)/` (BX-04 bug fix, 2026-07-03): this page previously lived at the bare
// `app/(app)/notifications/` top level with its own `layout.tsx` mounting a DIFFERENT ShellViewModel
// (the generic `ACCOUNT_NAV`) — every buyer click into Notifications was a real Next.js layout-tree
// remount (verified empirically: a DOM probe attached to the sidebar did not survive navigation),
// swapping out the Buyer sidebar/topbar entirely. The original `layout.tsx`'s own header comment
// already flagged this as unresolved ("SHELL PLACEMENT... not settled in the corpus... flagged for
// Team-4"). Zero non-buyer code referenced `/notifications` (grepped repo-wide) — buyer was its only
// real consumer, so relocating it under `(buyer)/` resolves the OBS in the direction the evidence
// already pointed, at the SAME URL (`(buyer)` is a route group, invisible in the path — no link
// anywhere needed to change). If a vendor/admin notification center is ever needed, it mints its own
// path under `/workspace/*` or `/admin/*`, the same pattern every other cross-workspace concept in
// this codebase already follows (e.g. vendor's own `/workspace/settings`, `/workspace/organization`).
// The old top-level `app/(app)/notifications/` (page + layout + seed) is deleted, not left dangling.
//
// This is the full-history view of the same M6 notifications shown in the topbar dropdown
// (NotificationCenter) — a different presentation of one source (`notifications-seed.ts`, now
// co-located here and fed into the Buyer shell's `ShellViewModel.notifications` by `../layout.tsx`,
// so the bell count and this page stay consistent, exactly as before the relocation).
//
// FIELD DISCIPLINE (invent nothing) — unchanged from the pre-relocation page:
//  • Renders ONLY the frozen `NotificationItem` fields {id,title,body?,href?,read?,timeLabel?}. The frozen
//    projection has NO notification "type"/"category"/"archived" field, so the spec's optional Archived tab
//    + type filter + per-type columns are DEFERRED (they need a richer M6 read — [ESC-7-API]); none is
//    coined. All / Unread tabs are derived from `read` alone.
//  • NON-DISCLOSURE ABSOLUTE (Invariant #11 · §7.5 · CHK-7-040): a deferral / blacklist / private exclusion
//    NEVER surfaces as a notification; the list shows only the viewer's own benign items; no cross-org leak.
//  • Unread is NOT colour-only — a text StatusChip ("Unread") labels it.
//  • Manage actions (mark read / archive — Doc-5H §5) are DEFERRED (no wired mutation); the control is
//    present but disabled and labelled as a preview. Pagination is deferred with the wired cursor read — no
//    fabricated totals (GI-03). Binds no Doc-5 contract. The page owns the single `<h1>` (via PageHeader).
import { Bell, Info } from "lucide-react";
import { PageHeader } from "../../_components/shell/page-header";
import { StatusChip } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";
import { NOTIFICATIONS, UNREAD_COUNT } from "./notifications-seed";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function resolveFilter(raw: string | undefined): FilterKey {
  return FILTERS.some((f) => f.key === raw) ? (raw as FilterKey) : "all";
}

export const metadata = {
  title: "Notifications — iVendorz",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = resolveFilter(filter);
  const items = activeFilter === "unread" ? NOTIFICATIONS.filter((n) => !n.read) : NOTIFICATIONS;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates about your organization and activity."
        actions={
          <Button variant="outline" size="sm" disabled>
            Mark all as read
          </Button>
        }
      />

      <div className="max-w-3xl space-y-6">
        {/* Filter tabs (All / Unread) — links, active reflects ?filter=. */}
        <nav aria-label="Notification filter">
          <ul className="flex gap-1 border-b border-border">
            {FILTERS.map((f) => {
              const active = f.key === activeFilter;
              const count = f.key === "unread" ? UNREAD_COUNT : NOTIFICATIONS.length;
              return (
                <li key={f.key}>
                  <a
                    href={f.key === "all" ? "/notifications" : `/notifications?filter=${f.key}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-mb-px inline-block border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-iv-brand-500 text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}{" "}
                    <span className="text-xs tabular-nums text-muted-foreground">({count})</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {items.length === 0 ? (
          <EmptyState
            icon={<Bell aria-hidden="true" />}
            title="You're all caught up."
            description="You have no unread notifications."
          />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {items.map((n) => {
              const Row = n.href ? "a" : "div";
              return (
                <li key={n.id}>
                  <Row
                    {...(n.href ? { href: n.href } : {})}
                    className={cn(
                      "flex flex-col gap-1 px-4 py-3",
                      n.href && "transition-colors hover:bg-muted/50",
                      !n.read && "bg-iv-brand-50/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {!n.read ? <StatusChip label="Unread" tone="info" /> : null}
                      <span
                        className={cn(
                          "text-sm",
                          n.read ? "text-foreground" : "font-medium text-foreground",
                        )}
                      >
                        {n.title}
                      </span>
                      {n.timeLabel ? (
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {n.timeLabel}
                        </span>
                      ) : null}
                    </div>
                    {n.body ? <p className="text-xs text-muted-foreground">{n.body}</p> : null}
                  </Row>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            This is a preview — marking read, archiving, and older history aren’t connected yet. You
            only ever see notifications meant for you.
          </p>
        </div>
      </div>
    </>
  );
}
