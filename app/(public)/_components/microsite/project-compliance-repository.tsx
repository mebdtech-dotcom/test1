// ProjectComplianceRepository (FE-PUB-11 · P-PUB-25) — the grouped project documents (certificates, QA/QC,
// inspection, handover). GOVERNANCE R3: there is NO platform "Verify Project Data" affordance and NO real
// file pipeline, so every Download control is DISABLED-honest (no fabricated file, no fabricated URL) and a
// note states the platform neither verifies nor holds these files. Unlike the other sections this does NOT
// auto-hide when empty — it renders a genuine empty state (the honest posture the surface shipped with).
// Owns the stable #documents anchor. Presentation-only; reuses the kit; RSC-friendly.
import { Download, FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { VendorSection } from "./vendor-section";
import type { ProjectDocumentGroupVM } from "./company-content-seed";

export interface ProjectComplianceRepositoryProps {
  groups?: ProjectDocumentGroupVM[];
}

export function ProjectComplianceRepository({ groups }: ProjectComplianceRepositoryProps) {
  const hasGroups = Boolean(groups && groups.length > 0);
  return (
    <VendorSection id="documents" title="Compliance Repository">
      {hasGroups ? (
        <div className="flex flex-col gap-6">
          {groups!.map((group) => (
            <div key={group.title}>
              <h3 className="text-2xs font-semibold uppercase tracking-wide text-iv-navy-700">
                {group.title}
              </h3>
              <ul className="mt-2 flex flex-col gap-2">
                {group.documents.map((doc) => (
                  <li
                    key={doc.name}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700">
                      <FileText aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                      {doc.fileType ? (
                        <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {doc.fileType}
                        </p>
                      ) : null}
                    </div>
                    {/* Disabled — documents are not wired; the platform neither verifies nor holds them (R3). */}
                    <Button size="sm" variant="outline" disabled>
                      <Download aria-hidden="true" />
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Documents are published by the supplier. The platform does not verify or hold these
            files.
          </p>
        </div>
      ) : (
        <EmptyState
          title="No project documents published"
          description="Project documents appear here when the supplier publishes them. The platform does not verify or hold these files."
        />
      )}
    </VendorSection>
  );
}
