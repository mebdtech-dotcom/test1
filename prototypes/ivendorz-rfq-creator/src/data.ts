import { RFQFormData } from "./types";

export const INDUSTRIES = [
  "Steel & Metals",
  "Industrial Machinery",
  "Electrical & Power",
  "Chemicals & Fluids",
  "Construction Materials",
  "Safety & PPE",
  "Tools & Hardware",
];

export const CATEGORIES_BY_INDUSTRY: Record<string, string[]> = {
  "Steel & Metals": [
    "Hot Rolled Carbon Steel Plates",
    "Mild Steel (MS) Plates",
    "Stainless Steel Sheet & Coils",
    "Structural Beams & Channels",
    "Seamless Industrial Pipes",
    "Reinforcement Steel Rebars",
    "Welding Electrodes & Wires",
  ],
  "Industrial Machinery": [
    "Centrifugal Water Pumps",
    "Rotary Screw Air Compressors",
    "Heavy Duty CNC Machines",
    "Industrial Conveyor Belts",
    "Diesel Generators (50kVA+)",
  ],
  "Electrical & Power": [
    "Armored Copper Cables",
    "High Voltage Switchgears",
    "Distribution Transformers",
    "Industrial LED Highbay Lights",
    "Molded Case Circuit Breakers (MCCB)",
  ],
  "Chemicals & Fluids": [
    "Industrial Solvents",
    "Hydrochloric Acid (Technical Grade)",
    "Lubricants & Hydraulic Oils",
    "Water Treatment Chemicals",
  ],
  "Construction Materials": [
    "Portland Cement (Grade 53)",
    "Ready Mix Concrete",
    "Aggregates & Red Bricks",
    "Thermal Insulation Panels",
  ],
};

export const ALL_CATEGORIES = Object.values(CATEGORIES_BY_INDUSTRY).flat();

export const UNITS = [
  "Unit",
  "Ton",
  "Kg",
  "Pcs",
  "Mtr",
  "Ltr",
  "Box",
  "Roll",
  "Set",
  "Drum",
  "Sft",
  "Cft",
];

export const BANGLADESH_DISTRICTS = [
  "Gazipur",
  "Dhaka",
  "Narayanganj",
  "Chittagong",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Bogra",
  "Comilla",
  "Cox's Bazar",
  "Jessore",
];

export const ROUTING_OPTIONS = [
  { value: "broad", label: "Broad Routing — Match all matching verified vendors" },
  { value: "selective", label: "Selective Routing — Match Tier-1 & Tier-2 verified vendors" },
  { value: "direct", label: "Direct Invite — Direct invite preferred vendors only" },
];

export const VENDOR_TYPES = [
  "Any",
  "Manufacturer",
  "Distributor / Stockist",
  "Trader",
  "Service Provider",
];

export const VENDOR_CLASSIFICATIONS = [
  { value: "Any tier", label: "Any Tier" },
  { value: "Tier 1", label: "Tier 1 — Enterprise class (> $10M turnover)" },
  { value: "Tier 2", label: "Tier 2 — Medium scale ($2M - $10M turnover)" },
  { value: "Tier 3", label: "Tier 3 — Small & Medium Enterprises (< $2M)" },
];

export const PRODUCT_CONDITIONS = ["New", "Refurbished", "Surplus / Unused"];

export const URGENCY_OPTIONS = ["Standard", "Urgent", "Critical (Production halted)"];

export const INITIAL_RFQ_DATA: RFQFormData = {
  industry: "",
  category: "",
  requestTypes: {
    supply: false,
    service: false,
    fabricate: false,
    consult: false,
  },
  items: [{ id: "item-1", itemName: "", size: "", quantity: "", unit: "Unit" }],
  itemName: "",
  size: "",
  quantity: "",
  unit: "Unit",
  specifications: "",
  noSpecificationDoc: false,
  brandPreference: "",
  alternativeBrand: "",
  productCondition: "",
  standards: "",
  certifications: "",
  attachments: [],
  deliveryLocation: "",
  deliveryDistrict: "",
  requiredDeliveryDate: "",
  deliverySite: "Factory / Warehouse / Site",
  deliveryInstructions: "",
  routing: "",
  preferredVendor: "",
  vendorType: "Any",
  preferredVendorClassification: "Any tier",
  verifiedVendorsOnly: false,
  acceptAlternativeProducts: false,
  estimatedBudget: "",
  urgency: "Standard",
  specialInstructions: "",
  contactMethods: {
    platform: true,
    phone: false,
    whatsApp: false,
    email: false,
  },
  whatsAppAllowContact: false,
  whatsAppUseAccountPhone: false,
  whatsAppAlternativeNumber: "",
  preferredContactTime: "",
};

export const DEMO_RFQ_DATA: RFQFormData = {
  industry: "Steel & Metals",
  category: "Hot Rolled Carbon Steel Plates",
  requestTypes: {
    supply: true,
    service: false,
    fabricate: true,
    consult: false,
  },
  items: [
    {
      id: "item-1",
      itemName: "MS plate Grade Q345B",
      size: "12mm thick",
      quantity: "45",
      unit: "Ton",
    },
    {
      id: "item-2",
      itemName: "MS plate Grade Q345B",
      size: "16mm thick",
      quantity: "20",
      unit: "Ton",
    },
    {
      id: "item-3",
      itemName: "H-Beam Grade S275JR",
      size: "200x200mm",
      quantity: "15",
      unit: "Pcs",
    },
  ],
  itemName: "MS plate Grade Q345B",
  size: "12mm thick",
  quantity: "45",
  unit: "Ton",
  specifications:
    "Provide 12mm thickness MS Plate with mill test certificate. Flatness tolerance less than 3mm per meter. Must be free from heavy rust or pitting. Surface inspection will be carried out at site prior to unloading.",
  noSpecificationDoc: false,
  brandPreference: "TATA Steel",
  alternativeBrand: "BSRM or KDS",
  productCondition: "New",
  standards: "ASTM A36 / BS EN 10025",
  certifications: "EN 10204 3.1 mill cert, Quality system ISO 9001",
  attachments: [
    {
      id: "att-1",
      name: "MS_Plate_12mm_Technical_Spec_Sheet.pdf",
      size: "2.4 MB",
      type: "application/pdf",
      uploadedAt: "Just now",
    },
    {
      id: "att-2",
      name: "CAD_Drawing_MS_Plates_Rev_3.dwg.pdf",
      size: "4.8 MB",
      type: "application/pdf",
      uploadedAt: "Just now",
    },
  ],
  deliveryLocation: "Plot 24, Mawna Industrial Area, Sreepur",
  deliveryDistrict: "Gazipur",
  requiredDeliveryDate: "2026-08-15",
  deliverySite: "Factory / Warehouse / Site",
  deliveryInstructions:
    "Must be delivered by flatbed trailer. Mobile crane (15 ton) available at site for unloading between 8 AM to 5 PM. Gate entry requires driver NID and vehicle registration copy 24 hrs prior.",
  routing: "broad",
  preferredVendor: "Elite Metal Traders Ltd",
  vendorType: "Manufacturer",
  preferredVendorClassification: "Tier 1",
  verifiedVendorsOnly: true,
  acceptAlternativeProducts: true,
  estimatedBudget: "1800000",
  urgency: "Standard",
  specialInstructions:
    "Quotations must specify delivery lead times and validity. Credit terms of 45 days preferred.",
  contactMethods: {
    platform: true,
    phone: true,
    whatsApp: true,
    email: false,
  },
  whatsAppAllowContact: true,
  whatsAppUseAccountPhone: true,
  whatsAppAlternativeNumber: "",
  preferredContactTime: "Business hours",
};
