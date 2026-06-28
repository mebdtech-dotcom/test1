import { Boxes } from "lucide-react";

import { cn } from "@/shared/ui/lib/cn";

interface LogoProps {
  className?: string;
  /** Hide the wordmark, showing only the glyph (e.g. collapsed sidebar). */
  collapsed?: boolean;
  /** Render on a dark surface (sidebar) using inverted tokens. */
  tone?: "default" | "inverted";
}

/**
 * iVendorz brand lockup — industrial glyph + wordmark.
 * Presentational only; routing is the consumer's responsibility.
 */
export function Logo({ className, collapsed = false, tone = "default" }: LogoProps) {
  const isInverted = tone === "inverted";
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          isInverted ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        <Boxes className="size-5" />
      </span>
      {!collapsed && (
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            isInverted ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          iVendorz
        </span>
      )}
    </span>
  );
}
