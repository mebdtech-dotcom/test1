// Public marketing footer (Doc-7D Public chrome). Static, anonymous, Server Component. Links
// marked (*) target Wave-3 public views (P-PUB-*) not yet built — placeholdered to "/".
import * as React from "react";
import Link from "next/link";
import { Separator } from "@/frontend/primitives/separator";
import { BrandLogo } from "@/frontend/brand";

const COLUMNS = [
  { title: "Marketplace", links: ["Browse categories", "Find vendors", "Search products"] }, // *
  { title: "Company", links: ["About", "Contact", "Careers"] },
  { title: "Resources", links: ["Help center", "Procurement guides", "API"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security"] },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto w-full max-w-[var(--iv-page-max)] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold text-iv-ink-heading-strong">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((label) => (
                  <li key={label}>
                    <Link
                      href="/"
                      className="text-sm text-iv-ink-secondary transition-colors hover:text-iv-ink-heading"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <BrandLogo height={24} />
            <p>© iVendorz — Industrial Procurement OS for Bangladesh.</p>
          </div>
          <p>Made in Bangladesh · BDT</p>
        </div>
      </div>
    </footer>
  );
}
