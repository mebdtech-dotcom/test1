export interface RFQAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export interface RFQItem {
  id: string;
  itemName: string;
  size: string;
  quantity: string;
  unit: string;
}

export interface RFQFormData {
  // 1. Requirement Details
  industry: string;
  category: string;
  requestTypes: {
    supply: boolean;
    service: boolean;
    fabricate: boolean;
    consult: boolean;
  };
  items: RFQItem[];
  itemName: string;
  size: string;
  quantity: string;
  unit: string;

  // 2. Technical Requirements
  specifications: string;
  noSpecificationDoc: boolean;
  brandPreference: string;
  alternativeBrand: string;
  productCondition: string;
  standards: string;
  certifications: string;

  // 3. Attachments
  attachments: RFQAttachment[];

  // 4. Delivery Requirements
  deliveryLocation: string;
  deliveryDistrict: string;
  requiredDeliveryDate: string;
  deliverySite: string;
  deliveryInstructions: string;

  // 5. Vendor Preferences
  routing: string;
  preferredVendor: string;
  vendorType: string;
  preferredVendorClassification: string;
  verifiedVendorsOnly: boolean;
  acceptAlternativeProducts: boolean;

  // 6. Budget & Priority
  estimatedBudget: string;
  urgency: string;
  specialInstructions: string;

  // 7. Communication Preferences
  contactMethods: {
    platform: boolean;
    phone: boolean;
    whatsApp: boolean;
    email: boolean;
  };
  whatsAppAllowContact: boolean;
  whatsAppUseAccountPhone: boolean;
  whatsAppAlternativeNumber: string;
  preferredContactTime: string; // 'Anytime' | 'Business hours' | 'Morning' | 'Afternoon' | 'Evening' | ''
}
