import type { NotificationItem } from "../../../_components/shell";

// Presentation SEED for the notification surfaces (P-SH-02 full page + the topbar dropdown). A wired build
// resolves these from the M6 notification read (Doc-5H §5); until then they are a benign, static preview.
//
// FIELD DISCIPLINE: each item uses ONLY the frozen `NotificationItem` fields {id,title,body?,href?,read?,
// timeLabel?} — NO notification "type"/"category"/"event" is coined (the frozen projection has none). Every
// item concerns the viewer's OWN organization; NONE reveals a hidden / excluded / blacklisted / buyer-
// private entity (non-disclosure, Invariant #11 · §7.5 · CHK-7-040). `href` is set only where a real
// in-app destination exists (else omitted — no fabricated route).
export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "A quotation was submitted to your RFQ",
    body: "RFQ-2026-000123",
    timeLabel: "2h ago",
    read: false,
  },
  {
    id: "n2",
    title: "Your organization profile was updated",
    body: "Changes were made by a Director in your organization.",
    timeLabel: "1d ago",
    read: false,
  },
  {
    id: "n3",
    title: "A new member joined your organization",
    timeLabel: "3d ago",
    read: true,
  },
  {
    id: "n4",
    title: "Your subscription renews soon",
    body: "Manage it from Plans & billing.",
    href: "/account/billing",
    timeLabel: "5d ago",
    read: true,
  },
];

/** Non-disclosure-safe unread count (IA §4.2/§5.4) — derived from the seed's unread items. */
export const UNREAD_COUNT = NOTIFICATIONS.filter((n) => !n.read).length;
