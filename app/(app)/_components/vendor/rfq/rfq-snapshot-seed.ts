// RFQ detail (S3) — presentation SEED for RfqSnapshotView. Curated, realistic Bangladesh industrial
// procurement example standing in for the wired grant-scoped read (`rfq.get_rfq.v1`, not wired yet)
// — NOT data, coins nothing. Presentation-only; do not wire a real fetch here.
import type { RfqSnapshotView } from "./types";

export const RFQ_SNAPSHOT_SEED: RfqSnapshotView = {
  rfq_id: "rfq-000318",
  human_ref: "RFQ-2026-000318",
  buyer_org_name: "Dhaka Industrial Fabricators Ltd.",
  summary: "MS plate 10mm · 20 ton, delivered to Savar EPZ",
  state: "vendors_notified",
  scope_text:
    "Supply of hot-rolled mild steel plates, 10mm thickness, ASTM A36 equivalent, for structural fabrication of a boiler support frame. Plates must be mill-certified with visible heat numbers; no rust pitting or lamination defects accepted.",
  work_nature: ["supply"],
  category_label: "Steel & Metals",
  estimated_value: 1_850_000,
  currency: "BDT",
  delivery_geography: "Savar, Dhaka",
  no_formal_spec: false,
  version_locked_label: "Version 2 (locked at invitation)",
  window_state: "open",
  window_deadline_label: "Closes 8 Jul 2026, 6:00 PM (Asia/Dhaka)",
  window_urgency: "normal",
  granted_documents: [
    { href: "#", name: "MS-Plate-Drawing-Rev2.pdf" },
    { href: "#", name: "Material-Spec-Sheet.pdf" },
  ],

  // Dev-doc capture (mirrors buyer RfqDraftForm — not standalone frozen columns).
  item_name: "MS Plate, 10mm thickness",
  quantity: "20",
  unit: "ton",
  brand_preference: "BSRM or PHP Steel preferred",
  alternative_brand: "Equivalent grade accepted with mill test certificate",
  product_condition: "New",
  standards: "ASTM A36 or equivalent",
  certifications: "Mill Test Certificate (MTC) required",
  delivery_location: "Savar EPZ, Plot 24, Block C",
  delivery_district: "Dhaka",
  delivery_date_label: "On or before 25 Jul 2026",
  delivery_site: "Factory",
  delivery_instructions:
    "Deliver during working hours (9am–5pm); forklift unloading available on site.",
  preferred_contact_channels: ["platform", "whatsapp"],
  preferred_contact_time_label: "Weekdays, 10am–5pm",
  contact_phone: "+880 1712-000000",
  contact_whatsapp: "+880 1712-000000",
  contact_email: "procurement@buyer.example",
  contact_person: "Engr. Kamrul Hassan",
};
