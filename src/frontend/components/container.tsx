import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/cn";

// Container (Doc-7B kit — the "frozen component" named in the Pattern-1 sidebar-shell composition
// and in every page template). THE single source of truth for page-content width + horizontal
// gutters. It owns exactly three things and nothing else:
//   1. the max content width  — token `--iv-content-max` (1280px)
//   2. the responsive horizontal gutters — 16 / 24 / 32px (px-4 · sm:px-6 · lg:px-8)
//   3. horizontal centering — mx-auto + w-full
//
// It deliberately owns NO vertical rhythm: a caller passes its own `py-*` from the design spacing
// scale via `className`. Full-bleed regions (heroes, colored bands, bordered CTA strips, background
// images) stay OUTSIDE the Container — the section owns the edge-to-edge background, and the Container
// wraps only its inner content (Content ≠ Presentation; §4 Full-Width Exceptions).
//
// PRESENTATION-ONLY and Server-render friendly (no hooks, no state, no "use client") so it mounts
// inside Server Components, the app shell, and Radix surfaces alike. Consolidating the container into
// this one primitive means a future width/gutter change is a single edit here rather than ~90 hand-
// copied class strings — no page hard-codes the container classes again.
export type ContainerProps = ComponentPropsWithoutRef<"div">;

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--iv-content-max)] px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
