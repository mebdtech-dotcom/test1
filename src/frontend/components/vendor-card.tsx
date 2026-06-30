// VendorCard (Doc-7B kit, App tier — landing_page_spec §5; promoted from the Public surface after M2.2
// validated its API). PRESENTATION-ONLY, route-agnostic vendor card: a pure Server Component rendering
// the VendorCardVM the surface supplies. ONE canonical implementation shared across every surface —
// differences are expressed via props/slots (href, action), NEVER by forking a Public/Shared variant.
//
// GOVERNANCE: capability = the four-flag MATRIX (Invariant #1) via the shared CapabilityMatrix (compact),
// absent flags shown OFF; the only trust signal is the binary "Verified" badge (M5 public projection,
// absence = no badge, never a "pending" state) — NO numeric/band trust SCORE ([ESC-7G-SCORE-DISPLAY]).
// The VM carries no buyer-private field, so an excluded vendor is byte-identical to any other (Inv #11).
import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CapabilityMatrix, type CapabilityFlags } from "./capability-matrix";
import { Card } from "../primitives/card";
import { Button } from "../primitives/button";
import { Badge } from "../primitives/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../primitives/avatar";
import { cn } from "../lib/cn";

/** Vendor directory / showcase card data — a presentation VM, NOT a contract DTO. */
export interface VendorCardVM {
  /** Vendor identity slug (the surface builds the destination href from it). */
  slug: string;
  name: string;
  category: string;
  location?: string;
  /** Verification status (M5 public projection). true → "Verified" badge; absence = no badge. */
  verified?: boolean;
  /** Four-flag capability matrix (Invariant #1) — a matrix, never a label. Absent flags render OFF. */
  capability?: Partial<CapabilityFlags>;
  /** Resolved logo URL; missing → identity fallback (no broken image). */
  logoUrl?: string;
}

/** Two-letter identity initials for the logo fallback (no broken image). */
export function vendorInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export interface VendorCardProps {
  vendor: VendorCardVM;
  /** Destination for the default "View profile" action — surface-supplied (route-agnostic). */
  href?: string;
  /** Action slot — overrides the default. The card asserts no specific action of its own. */
  action?: ReactNode;
  className?: string;
}

export function VendorCard({ vendor, href, action, className }: VendorCardProps) {
  return (
    <Card className={cn("flex h-full flex-col p-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar className="size-10 rounded-md">
          {vendor.logoUrl ? <AvatarImage src={vendor.logoUrl} alt="" /> : null}
          <AvatarFallback className="rounded-md text-2xs">
            {vendorInitials(vendor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-iv-ink-heading" title={vendor.name}>
            {vendor.name}
          </h3>
          <p className="truncate text-sm text-iv-navy-700">{vendor.category}</p>
        </div>
        {vendor.verified ? (
          <Badge variant="success" className="shrink-0 gap-1">
            <ShieldCheck aria-hidden="true" className="size-3" />
            Verified
          </Badge>
        ) : null}
      </div>

      {vendor.location ? (
        <p className="mt-2 text-xs text-muted-foreground">{vendor.location}</p>
      ) : null}

      <div className="mt-3">
        <CapabilityMatrix variant="compact" flags={vendor.capability} />
      </div>

      {action ? (
        <div className="mt-auto pt-4">{action}</div>
      ) : href ? (
        <div className="mt-auto pt-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={href}>
              View profile
              <span className="sr-only"> — {vendor.name}</span>
            </Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
