import Link from "next/link";
import { Button } from "@/frontend/primitives/button";

// Public Forbidden (403) route (`/forbidden`) — P-SH-06 (Doc-7C · T-STATE; screen_specifications §P-SH-06,
// Doc-7A §8.2). A pure SERVER COMPONENT rendered in the Doc-7C `(public)` shell.
//
// GOVERNANCE — the load-bearing rule (Invariant #11 / non-disclosure §7.5, Doc-7A §8.2):
//  • A 403 is shown ONLY where the viewer's RIGHT TO KNOW the resource exists is already established.
//  • Where there is NO right to know, "forbidden" MUST collapse to the byte-identical 404: code calls
//    Next's `notFound()` (rendering the kit `NotFound`, which takes no discriminating prop and is identical
//    to genuine absence — see (public)/not-found.tsx). Such cases NEVER reach this page, so a hidden
//    resource is indistinguishable from one that does not exist.
//  • Therefore this page is the right-to-know 403 ONLY. Even here the copy is GENERIC and names no resource
//    (it reveals nothing beyond "you don't have access"). No page-specific analytics fire (must not leak
//    existence). It coins no contract and binds no data. Styled to match the kit `NotFound` layout for
//    visual consistency (a page-local state view — the frozen kit is unchanged and no primitive is
//    duplicated; `NotFound` is deliberately 404-only). This page owns the single `<h1>`.
export const metadata = {
  title: "Access denied — iVendorz",
};

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">403</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You don’t have access to this page. If you think this is a mistake, contact an administrator
        in your organization.
      </p>
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
