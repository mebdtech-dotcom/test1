// Import jobs — presentation SEED (P-ADM-14 · Doc-7H · J-ADM-05 · `list_import_jobs`). A curated mock of the
// data-import job list standing in for the unwired read — NOT data, coins nothing. BC-ADM-4 owns `import_jobs`
// (+ child `import_rows`); the seeded categories/vendors are **Marketplace-owned**, created via the Marketplace
// service — import LOADS data, it owns no seeded entity (Doc-4J §BC-ADM-4). No score, no procurement decision
// (firewall + moat). Fields bind to the frozen list-view only (Doc-4J:228 `id`, `job_type`, `state`,
// `initiated_by`, `created_at`); `import_jobs` carry NO human_ref, so the id is shown opaque — never a coined
// ref. No fabricated row/stat totals here (GI-03 — `stats_jsonb` belongs to the detail view, P-ADM-15).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `import_jobs` lifecycle (Doc-4J H.5 / §BC-ADM-4): `queued → processing → completed / failed`.
export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";

// Frozen `import_jobs.job_type` enum (Doc-4J:247).
export type ImportJobType = "categories" | "vendor_seed";

export interface ImportJobVM {
  /** `import_jobs.id` — a bare UUID (no human_ref); shown opaque. */
  id: string;
  jobType: ImportJobType;
  /** `import_jobs.initiated_by` — the platform-staff initiator (display name). */
  initiatedBy: string;
  /** `import_jobs.created_at` (relative) — display only. */
  created: string;
  status: ImportJobStatus;
}

export const IMPORT_STATUS_META: Record<ImportJobStatus, { label: string; tone: StatusTone }> = {
  queued: { label: "Queued", tone: "warning" },
  processing: { label: "Processing", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

export const IMPORT_TYPE_LABEL: Record<ImportJobType, string> = {
  categories: "Categories",
  vendor_seed: "Vendor seed",
};

export const IMPORT_JOBS: ImportJobVM[] = [
  {
    id: "b7e14a02-5c39-4d81-9f26-1a8043c2ef57",
    jobType: "vendor_seed",
    initiatedBy: "A. Rahman",
    created: "20 min ago",
    status: "processing",
  },
  {
    id: "f3906c48-2b7e-4a15-8d63-90c7e1b4a208",
    jobType: "categories",
    initiatedBy: "S. Akter",
    created: "1h ago",
    status: "queued",
  },
  {
    id: "1c85d7f0-6e42-4b93-a71d-58f0342b9ce6",
    jobType: "vendor_seed",
    initiatedBy: "A. Rahman",
    created: "3h ago",
    status: "completed",
  },
  {
    id: "9a24be61-0f57-48c2-b3e9-6d1740c85a33",
    jobType: "categories",
    initiatedBy: "M. Hasan",
    created: "yesterday",
    status: "completed",
  },
  {
    id: "5d0f83a7-91c4-4e26-8b57-2a6390e1d740",
    jobType: "vendor_seed",
    initiatedBy: "S. Akter",
    created: "yesterday",
    status: "failed",
  },
  {
    id: "e6412b98-3a05-4d7f-9c81-70b5e2a9f316",
    jobType: "categories",
    initiatedBy: "M. Hasan",
    created: "2d ago",
    status: "completed",
  },
];
