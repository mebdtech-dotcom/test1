"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuEmptyState (Approval Addendum R2-MINOR-02, UX doc §9).
// The GLOBAL fallback when the taxonomy fails to resolve at runtime (future adapter era; at
// build time the seed drift-check makes a missing/corrupted seed a build FAILURE). Never a
// blank panel, never a fabricated tree: an honest line + three always-working links.

import * as React from "react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { buttonVariants } from "../../primitives/button";

const FALLBACK_LINKS = [
  { label: "Browse Categories", href: "/categories" },
  { label: "Search Products", href: "/search" },
  { label: "Post RFQ", href: "/login" },
];

export function MegaMenuEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-3 p-6", className)}>
      <p className="text-sm text-muted-foreground">
        Industrial categories temporarily unavailable.
      </p>
      <div className="flex flex-wrap gap-2">
        {FALLBACK_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className={buttonVariants({ variant: i === 0 ? "secondary" : "outline", size: "sm" })}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
