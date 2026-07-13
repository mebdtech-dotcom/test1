// Vendor Workspace — Notifications (VX-01 nav destination). Reserved in the redesigned sidebar but
// not yet built as a full history page: the shared shell topbar's `NotificationCenter` already
// renders a compact live preview (fed by `ShellViewModel.notifications`/`unreadCount`, deliberately
// left unset on `VENDOR_SHELL_VM` today — no real notifications read is wired yet). This page would
// be the full paginated history once that read exists. `ImplementationPendingView` discloses the
// gap; no fabricated notification rows.
import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { ImplementationPendingView } from "../../../_components/vendor/implementation-pending-view";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Notifications" }]}
      title="Notifications"
      description="Your full notification history. The topbar bell already shows a live preview once notifications are wired."
      icon={<Bell aria-hidden />}
    />
  );
}
