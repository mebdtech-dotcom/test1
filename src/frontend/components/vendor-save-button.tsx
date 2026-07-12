// VendorSaveButton (Doc-7B kit, App tier) — the "save / pin a vendor" affordance shared across the vendor
// showcase, directory, and microsite cards. PRESENTATION-ONLY: the `saved` state is SUPPLIED by the surface
// (no hooks, no state, no wiring here) so it stays Server-render-friendly; the real toggle is an M2 favorite
// and is AUTH-GATED — on the anonymous Public surface the control routes to `(auth)` and never mutates.
//
// Icon: a thumbtack `Pin` (not a bookmark). Two presentation states:
//   • UNSAVED → muted outline pin.
//   • SAVED   → pin FILLED with the primary button colour (`--iv-primary`), matching the primary CTA.
import Link from "next/link";
import { Pin } from "lucide-react";
import { Button } from "../primitives/button";
import { cn } from "../lib/cn";

export interface VendorSaveButtonProps {
  /** Whether the viewer has saved this vendor. Surface-supplied (presentation-only). Default: unsaved. */
  saved?: boolean;
  /** Destination for the save action (anonymous → `(auth)`; authed surfaces pass their own route). */
  href: string;
  /** Vendor name — the control is icon-only, so this drives the accessible label. */
  vendorName: string;
  className?: string;
}

export function VendorSaveButton({
  saved = false,
  href,
  vendorName,
  className,
}: VendorSaveButtonProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn(
        // SAVED → solid primary navy (`--primary`, theme-aware). NOTE: the `iv-primary` token is a
        // GRADIENT (valid for `bg-`, invalid for `text-`/`fill-`), so the fill uses `text-primary`.
        saved
          ? "text-primary hover:text-primary"
          : "text-muted-foreground hover:text-iv-ink-heading",
        className,
      )}
    >
      {/* NOTE: this renders an <a> (Button asChild → Link). `aria-pressed` is invalid on a link role
          (axe `aria-allowed-attr`, critical) — the saved/unsaved state is conveyed by the label instead. */}
      <Link href={href} aria-label={saved ? `Saved — ${vendorName}` : `Save ${vendorName}`}>
        {/* SAVED fills the pin with currentColor (= primary); UNSAVED is the outline pin. */}
        <Pin aria-hidden="true" className={cn(saved && "fill-current")} />
      </Link>
    </Button>
  );
}
