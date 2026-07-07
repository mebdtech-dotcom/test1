// ProjectGallery (FE-PUB-11 · P-PUB-25) — the project photo-gallery grid. Wraps the existing CompanyGallery
// (same VM, same decorative-tile grid — no fabricated <img> source, R4) under the stable #gallery anchor.
// Auto-hides when absent. Presentation-only; reuses the kit; RSC-friendly.
import { VendorSection } from "./vendor-section";
import { CompanyGallery } from "./company-gallery";
import type { GalleryItemVM } from "./company-content-seed";

export interface ProjectGalleryProps {
  items?: GalleryItemVM[];
}

export function ProjectGallery({ items }: ProjectGalleryProps) {
  if (!items || items.length === 0) return null;
  return (
    <VendorSection id="gallery" title="Project Gallery">
      <CompanyGallery gallery={items} />
    </VendorSection>
  );
}
