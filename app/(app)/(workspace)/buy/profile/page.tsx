// Buyer-mounted "Profile" (BX-04 bug fix, sidebar IA) — composes the EXISTING, UNMODIFIED
// `UserProfileForm` (P-ACC-02) inside the Buyer shell. Composition-not-fork, same pattern as the
// Vendor track's `workspace/settings|organization|billing` pages (FE-VEN-10/11/12, Board-ruled
// Option B): the real `/account/profile` component renders unchanged here; only the outer
// PageHeader/shell chrome is buyer-authored. Fixes the shell remount bug — `/account/profile` sits
// OUTSIDE the `(buyer)` route group with its own layout mounting a different ShellViewModel; this
// page reuses the same underlying component while staying inside `(buyer)/`, so the sidebar/topbar
// never remount when navigating here from Dashboard/RFQs/etc.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { UserProfileForm } from "../../../account/profile/user-profile-form";

export const metadata: Metadata = { title: "Profile" };

export default function BuyerProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="Your personal account details." />
      <UserProfileForm />
    </div>
  );
}
