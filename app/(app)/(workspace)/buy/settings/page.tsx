// Buyer-mounted "Settings" (BX-04 bug fix, sidebar IA) — composes the EXISTING, UNMODIFIED
// `SecuritySettings` (P-ACC-03) + `NotificationPreferences` (P-ACC-15) inside the Buyer shell.
// Composition-not-fork, same pattern as the Vendor track's `workspace/settings` (FE-VEN-12). Unlike
// the vendor page (which bundles Profile/Security/Notifications into one "Settings" surface), the
// buyer sidebar names "Profile" as its OWN separate nav item — so this page holds only Security +
// Notifications, avoiding a duplicate Profile tab. `P-ACC-13` Workflow Settings (approval chain +
// award threshold) is NOT composed here yet — it's the one Account surface genuinely buyer-shaped
// (the vendor track explicitly excluded it as "no vendor equivalent"), a natural forward candidate
// but out of THIS bug-fix's scope (not requested; would need its own reuse-audit pass).
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { BuyerWorkspaceTabs } from "../_components/buyer-workspace-tabs";
import { SecuritySettings } from "../../../account/security/security-settings";
import { NotificationPreferences } from "../../../account/notifications/notification-preferences";

export const metadata: Metadata = { title: "Settings" };

export default function BuyerSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Your security and notification preferences." />
      <BuyerWorkspaceTabs
        ariaLabel="Settings"
        tabs={[
          { value: "security", label: "Security", content: <SecuritySettings /> },
          {
            value: "notifications",
            label: "Notifications",
            content: <NotificationPreferences />,
          },
        ]}
      />
    </div>
  );
}
