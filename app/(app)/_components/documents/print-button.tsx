"use client";

// Documents shared home — PrintButton (FE-DOC, owner finding NIT-3). The hub's print shortcut:
// plain `window.print()` over the current page (browser-native, no document generation implied).
// Client component (event handler); both hubs reuse it — never a per-surface re-implementation.

import { Printer } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
      <Printer aria-hidden className="size-4" />
      {label}
    </Button>
  );
}
