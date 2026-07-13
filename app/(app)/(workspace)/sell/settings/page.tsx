// P-VND-equivalent Settings (FE-VEN-12, companion "vendor-context view reusing P-ACC-02/03/15").
// Board-ruled Option B (2026-07-03, `FE-VEN-14` report §9): a vendor-mounted page composing the
// EXISTING, UNMODIFIED Account components inside vendor-shell chrome — composition only, never a
// fork. Each tab renders the real `/account/*` component unchanged; only the outer shell/chrome is
// vendor-authored — unlike Billing/Organization, none of these three components carries an
// internal link to another Account route, so this page has no leave-chrome trade-off.
//
// `P-ACC-13` Workflow Settings is deliberately NOT composed here — the Board ruled (§6.1) that its
// only wired concept, RFQ approval, is buyer-shaped language with no vendor-side equivalent yet;
// scoped out and carried forward, not fabricated as a vendor variant.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { SettingsTabs } from "../../../_components/vendor/settings";
import { UserProfileForm } from "../../../account/profile/user-profile-form";
import { SecuritySettings } from "../../../account/security/security-settings";
import { NotificationPreferences } from "../../../account/notifications/notification-preferences";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your profile, security, and notification preferences."
      />
      <SettingsTabs
        profile={<UserProfileForm />}
        security={<SecuritySettings />}
        notifications={<NotificationPreferences />}
      />
    </div>
  );
}
