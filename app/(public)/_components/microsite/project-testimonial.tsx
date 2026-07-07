// ProjectTestimonial (FE-PUB-11 · P-PUB-25) — a client testimonial for the project. Vendor-authored;
// attribution is role-based (never a fabricated individual's name) and the optional organization may name
// the client (R2 scope: detail page only). Adapts the ManagementMessage presentation. Auto-hides when
// absent. Owns the stable #testimonial anchor. Presentation-only; reuses the kit; RSC-friendly.
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { VendorSection } from "./vendor-section";
import type { ProjectTestimonialVM } from "./company-content-seed";

export interface ProjectTestimonialProps {
  testimonial?: ProjectTestimonialVM;
}

export function ProjectTestimonial({ testimonial }: ProjectTestimonialProps) {
  if (!testimonial) return null;
  return (
    <VendorSection id="testimonial" title="Client Testimonial">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Quote aria-hidden="true" className="size-6 text-iv-navy-700" />
          <blockquote className="text-base leading-relaxed text-foreground">
            {testimonial.message}
          </blockquote>
          <footer className="text-sm">
            <span className="font-semibold text-iv-ink-heading">{testimonial.attribution}</span>
            {testimonial.organization ? (
              <span className="text-muted-foreground"> · {testimonial.organization}</span>
            ) : null}
          </footer>
        </CardContent>
      </Card>
    </VendorSection>
  );
}
