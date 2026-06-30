// Brand — the official iVendorz logo (Doc-7B kit · brand assets). SINGLE SOURCE OF TRUTH:
// every surface renders THESE components; the brand is never recreated, redrawn, recolored, or
// approximated in code, and never substituted with text/icons/placeholder squares. The official
// SVGs live in `public/brand/` and are rendered verbatim — no gradients/shadows/outlines/effects,
// scaled proportionally (never stretched). Presentation-only; server-render-friendly (no hooks).
//
// Asset contract (do not change): the files below MUST be the official SVGs, byte-for-byte.
import * as React from "react";
import { cn } from "../lib/cn";

/** Public paths to the official, unmodified brand SVGs (served from `public/`). */
export const BRAND_LOGO_SRC = "/brand/ivendorz-logo-long.svg";
export const BRAND_MARK_SRC = "/brand/ivendorz-logo-s.svg";

interface BrandImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height"
> {
  /** Rendered height in px; width scales proportionally (the logo is never stretched). */
  height?: number;
  /** Accessible name. Defaults to "iVendorz"; pass alt="" when adjacent text already names it. */
  alt?: string;
}

/**
 * Full iVendorz lockup — the DEFAULT/primary brand. Use where horizontal space permits:
 * public header, auth pages, marketing/landing, footer, docs, branded empty states.
 */
export function BrandLogo({
  height = 36,
  alt = "iVendorz",
  className,
  style,
  ...props
}: BrandImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- official brand SVG rendered verbatim; next/image would require dangerouslyAllowSVG and must not re-optimize the brand asset.
    <img
      src={BRAND_LOGO_SRC}
      alt={alt}
      className={cn("w-auto select-none", className)}
      style={{ height, ...style }}
      draggable={false}
      decoding="async"
      {...props}
    />
  );
}

/**
 * Compact iVendorz mark — constrained contexts ONLY: authenticated platform shell, collapsed
 * sidebar, mobile navigation, small avatar-style marks, loading screens, favicon-sized presentations.
 */
export function BrandMark({
  height = 28,
  alt = "iVendorz",
  className,
  style,
  ...props
}: BrandImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- official brand SVG rendered verbatim; next/image would require dangerouslyAllowSVG and must not re-optimize the brand asset.
    <img
      src={BRAND_MARK_SRC}
      alt={alt}
      className={cn("w-auto select-none", className)}
      style={{ height, ...style }}
      draggable={false}
      decoding="async"
      {...props}
    />
  );
}
