// ProductCard (Doc-7B kit, App tier — landing_page_spec §6; promoted from the Public surface after M2.2).
// PRESENTATION-ONLY, route-agnostic. ONE canonical implementation. Interim [ESC-7-API-PRODDETAIL]: there
// is no standalone anonymous product page — the whole card opens the destination the surface supplies
// (e.g. the supplier microsite). Price via CurrencyDisplay (default BDT) else "On request" — never a
// fabricated number (GI-08). The product image is a decorative tile background (no <img> element).
import Link from "next/link";
import { Package } from "lucide-react";
import { Card } from "../primitives/card";
import { CurrencyDisplay } from "./currency-display";
import { cn } from "../lib/cn";

/** A price pair carried by the value field (Doc-2 §0.4) — currency a prop, default BDT, never assumed. */
export interface PriceVM {
  amount: number;
  currency?: string;
}

/** Product result card data — a presentation VM, NOT a contract DTO. */
export interface ProductCardVM {
  id: string;
  name: string;
  vendorName: string;
  vendorSlug: string;
  category?: string;
  spec?: string;
  /** Price pair if the contract carries one; absent → "On request" (never fabricated). */
  price?: PriceVM;
  /** Resolved image URL; rendered as a decorative tile background. Missing → glyph placeholder. */
  imageUrl?: string;
}

export interface ProductCardProps {
  product: ProductCardVM;
  /** Destination for the card link — surface-supplied (route-agnostic). */
  href: string;
  className?: string;
}

export function ProductCard({ product, href, className }: ProductCardProps) {
  return (
    <Card className={cn("flex h-full flex-col overflow-hidden p-0", className)}>
      <Link
        href={href}
        className="flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          aria-hidden="true"
          className="flex aspect-[4/3] w-full items-center justify-center border-b border-border bg-muted bg-cover bg-center text-muted-foreground"
          style={product.imageUrl ? { backgroundImage: `url("${product.imageUrl}")` } : undefined}
        >
          {product.imageUrl ? null : <Package className="size-8" />}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-iv-ink-heading">{product.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {product.vendorName}
            {product.category ? ` · ${product.category}` : null}
          </p>
          {product.spec ? (
            <p className="truncate text-xs text-muted-foreground">{product.spec}</p>
          ) : null}
          <div className="mt-auto pt-2 text-sm font-semibold text-foreground">
            {product.price ? (
              <CurrencyDisplay amount={product.price.amount} currency={product.price.currency} />
            ) : (
              <span className="font-medium text-muted-foreground">On request</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
