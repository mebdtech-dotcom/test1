"use client";

// P-PUB header Explorer entry — the LIGHT half of the preload ladder (FE-PUB-09, ARCH §9.5).
// Renders a static trigger button immediately (server HTML); the first SUSTAINED hover intent
// (~150–200ms, never pointer fly-by — R2-NITPICK-04) or focus preloads the heavy chunk
// (`explorer-menu.tsx`: panel code + taxonomy seed + overlay); a click loads it AND opens the
// panel on mount. Subsequent opens are instant (<100ms budget, ARCH §9.6). Hover preload is
// gated to fine pointers (R2-NITPICK-02) — touch devices load on tap only.

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

const HOVER_INTENT_MS = 150;

const ExplorerMenu = React.lazy(() => import("./explorer-menu"));

export function Explorer({ className }: { className?: string }) {
  const [load, setLoad] = React.useState(false);
  const [openOnMount, setOpenOnMount] = React.useState(false);
  const intent = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (intent.current) clearTimeout(intent.current);
    };
  }, []);

  const preload = () => setLoad(true);
  const openNow = () => {
    setOpenOnMount(true);
    setLoad(true);
  };

  const placeholder = (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={false}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        if (intent.current) clearTimeout(intent.current);
        intent.current = setTimeout(preload, HOVER_INTENT_MS);
      }}
      onPointerLeave={() => {
        if (intent.current) clearTimeout(intent.current);
      }}
      onFocus={preload}
      onClick={openNow}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          openNow();
        }
      }}
    >
      All Categories
      <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );

  if (!load) return <div className={cn("hidden lg:block", className)}>{placeholder}</div>;

  return (
    <div className={cn("hidden lg:block", className)}>
      <React.Suspense fallback={placeholder}>
        <ExplorerMenu defaultOpen={openOnMount} />
      </React.Suspense>
    </div>
  );
}
