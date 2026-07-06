import React from "react";
import { RFQFormData } from "../types";
import { AnnotationMarker } from "./AnnotationMarker";
import { AlertTriangle, Lightbulb } from "lucide-react";

interface ReviewSectionProps {
  data: RFQFormData;
  showAnnotations: boolean;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ data, showAnnotations }) => {
  // Helper to format values or return fallback
  const renderVal = (val: string | number | boolean | undefined, isCheckbox = false) => {
    if (isCheckbox) {
      return val ? "Yes" : "No";
    }
    if (val === undefined || val === null || val === "") {
      return <span className="text-slate-400">—</span>;
    }
    return <span className="text-slate-800 font-medium">{val}</span>;
  };

  // Build active contact channels string
  const getContactChannels = () => {
    const active = [];
    if (data.contactMethods.platform) active.push("Platform");
    if (data.contactMethods.phone) active.push("Phone");
    if (data.contactMethods.whatsApp) active.push("WhatsApp");
    if (data.contactMethods.email) active.push("Email");
    return active.join(", ") || "None";
  };

  // Get active request types string
  const getRequestTypes = () => {
    const active = [];
    if (data.requestTypes.supply) active.push("Product Supply");
    if (data.requestTypes.service) active.push("Service / Contract Work");
    if (data.requestTypes.fabricate) active.push("Custom Fabrication");
    if (data.requestTypes.consult) active.push("Engineering & Consulting");
    return active.join(", ") || "—";
  };

  return (
    <div className="space-y-6">
      {/* Primary Review Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
        <h2 className="text-sm font-semibold text-indigo-900 tracking-wide mb-5 uppercase">
          Review
        </h2>

        {/* 1. Requirement Details Sub-grid */}
        <div className="border-b border-slate-100 pb-5 mb-5 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-indigo-800">Requirement</h3>
            {showAnnotations && (
              <AnnotationMarker
                id="rev-req"
                title="Review: Requirement Block"
                description="Displays selected industrial category, required volumes, units, and matches real-time."
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="text-slate-500">Category</div>
            <div className="text-right sm:text-left">{renderVal(data.category)}</div>

            <div className="text-slate-500">Request type</div>
            <div className="text-right sm:text-left">{renderVal(getRequestTypes())}</div>

            <div className="text-slate-500 self-start">Items Requested</div>
            <div className="text-right sm:text-left space-y-1">
              {data.items && data.items.length > 0 ? (
                data.items.map((it, idx) => (
                  <div
                    key={it.id || idx}
                    className="text-slate-800 font-semibold text-[11px] leading-tight"
                  >
                    <span className="text-slate-400 font-bold mr-1">{idx + 1}.</span>
                    {it.itemName || "Unnamed item"}
                    {it.size ? ` (${it.size})` : ""}{" "}
                    <span className="font-mono text-indigo-600 font-bold text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded ml-1">
                      {it.quantity || "—"} {it.unit}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Technical Requirements Sub-grid */}
        <div className="border-b border-slate-100 pb-5 mb-5 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-indigo-800">Specifications</h3>
            {showAnnotations && (
              <AnnotationMarker
                id="rev-specs"
                title="Review: Technical Specs"
                description="Summarizes custom text specs, standards, and brand/certification parameters for easy buyer pre-reading."
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="text-slate-500">Specification</div>
            <div
              className="text-right sm:text-left truncate max-w-[200px]"
              title={data.specifications || ""}
            >
              {renderVal(data.specifications)}
            </div>

            <div className="text-slate-500">Brand</div>
            <div className="text-right sm:text-left">
              {data.brandPreference ? (
                <span>
                  {data.brandPreference}{" "}
                  {data.alternativeBrand && (
                    <span className="text-slate-400 font-normal">
                      (Alt: {data.alternativeBrand})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>

            <div className="text-slate-500">Condition</div>
            <div className="text-right sm:text-left">{renderVal(data.productCondition)}</div>

            <div className="text-slate-500">Standards</div>
            <div className="text-right sm:text-left">{renderVal(data.standards)}</div>
          </div>
        </div>

        {/* 3. Attachments Sub-grid */}
        <div className="border-b border-slate-100 pb-5 mb-5">
          <h3 className="text-xs font-semibold text-indigo-800 mb-3">Files</h3>
          {data.attachments.length === 0 ? (
            <p className="text-xs text-slate-400">No attachments</p>
          ) : (
            <div className="space-y-1.5">
              {data.attachments.map((att) => (
                <div
                  key={att.id}
                  className="text-xs flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100 text-left"
                >
                  <span className="text-slate-700 font-medium truncate max-w-[240px]">
                    {att.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{att.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Delivery Requirements Sub-grid */}
        <div className="border-b border-slate-100 pb-5 mb-5 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-indigo-800">Delivery</h3>
            {showAnnotations && (
              <AnnotationMarker
                id="rev-del"
                title="Review: Logistics Specs"
                description="Specifies delivery point, local district boundary, targeted date, and site drop-off constraints."
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="text-slate-500">Location</div>
            <div className="text-right sm:text-left truncate max-w-[200px]">
              {renderVal(data.deliveryLocation)}
            </div>

            <div className="text-slate-500">District</div>
            <div className="text-right sm:text-left">{renderVal(data.deliveryDistrict)}</div>

            <div className="text-slate-500">Needed by</div>
            <div className="text-right sm:text-left">{renderVal(data.requiredDeliveryDate)}</div>

            <div className="text-slate-500">Site</div>
            <div className="text-right sm:text-left">{renderVal(data.deliverySite)}</div>
          </div>
        </div>

        {/* 5. Vendor Preferences Sub-grid */}
        <div className="border-b border-slate-100 pb-5 mb-5">
          <h3 className="text-xs font-semibold text-indigo-800 mb-3">Vendor preferences</h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="text-slate-500">Routing</div>
            <div className="text-right sm:text-left capitalize">{renderVal(data.routing)}</div>

            <div className="text-slate-500">Vendor type</div>
            <div className="text-right sm:text-left">{renderVal(data.vendorType)}</div>

            <div className="text-slate-500">Classification</div>
            <div className="text-right sm:text-left">
              {renderVal(data.preferredVendorClassification)}
            </div>

            <div className="text-slate-500">Verified only</div>
            <div className="text-right sm:text-left">
              {renderVal(data.verifiedVendorsOnly, true)}
            </div>

            <div className="text-slate-500">Accept alternatives</div>
            <div className="text-right sm:text-left">
              {renderVal(data.acceptAlternativeProducts, true)}
            </div>
          </div>
        </div>

        {/* 6. Budget & Priority Sub-grid */}
        <div className="border-b border-slate-100 pb-5 mb-5 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-indigo-800">Budget & priority</h3>
            {showAnnotations && (
              <AnnotationMarker
                id="rev-budget"
                title="Review: Budget Metrics"
                description="Checks BDT target value against average steel market indices in Bangladesh to flag potential outliers."
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="text-slate-500">Estimated budget</div>
            <div className="text-right sm:text-left">
              {data.estimatedBudget ? (
                <span className="text-slate-800 font-semibold font-mono">
                  BDT {Number(data.estimatedBudget).toLocaleString()}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>

            <div className="text-slate-500">Urgency</div>
            <div className="text-right sm:text-left">{renderVal(data.urgency)}</div>
          </div>
        </div>

        {/* 7. Communication Preferences Sub-grid */}
        <div>
          <h3 className="text-xs font-semibold text-indigo-800 mb-3">Communication</h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="text-slate-500">Channels</div>
            <div className="text-right sm:text-left">{renderVal(getContactChannels())}</div>

            <div className="text-slate-500">WhatsApp</div>
            <div className="text-right sm:text-left">
              {data.contactMethods.whatsApp ? "Allowed" : "Not allowed"}
            </div>

            <div className="text-slate-500">Contact time</div>
            <div className="text-right sm:text-left">{renderVal(data.preferredContactTime)}</div>
          </div>
        </div>
      </div>

      {/* Tips for a Strong RFQ Box */}
      <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-5 text-left">
        <h3 className="text-xs font-semibold text-amber-950 flex items-center gap-1.5 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Tips for a strong RFQ
        </h3>
        <ul className="space-y-2 text-xs text-amber-900/80 pl-5 list-disc leading-relaxed font-normal">
          <li>
            Be specific about grade, dimensions, and tolerances — it gets you better-matched quotes.
          </li>
          <li>Attach drawings or a bill of quantities so vendors quote against the same scope.</li>
          <li>Set a realistic delivery date and a district so logistics can be priced.</li>
          <li>
            Vendors are matched by the routing engine — you choose the breadth, not the winner.
          </li>
        </ul>
      </div>
    </div>
  );
};
