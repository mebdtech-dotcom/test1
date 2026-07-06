import React from "react";
import { RFQFormData } from "../types";
import { ROUTING_OPTIONS, VENDOR_TYPES, VENDOR_CLASSIFICATIONS } from "../data";
import { AnnotationMarker } from "./AnnotationMarker";

interface VendorPreferencesProps {
  data: RFQFormData;
  onChange: (fields: Partial<RFQFormData>) => void;
  showAnnotations: boolean;
}

export const VendorPreferences: React.FC<VendorPreferencesProps> = ({
  data,
  onChange,
  showAnnotations,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
      <h2 className="text-sm font-semibold text-indigo-900 tracking-wide mb-5 uppercase">
        Vendor preferences
      </h2>

      {/* Routing */}
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Routing <span className="text-red-500">*</span>
          </label>
          {showAnnotations && (
            <AnnotationMarker
              id="routing-mode"
              title="Routing Algorithm selection"
              description="Calculates how widely to dispatch the request. Matches verified regional steel suppliers automatically."
            />
          )}
        </div>
        <select
          value={data.routing}
          onChange={(e) => onChange({ routing: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          required
        >
          <option value="">Select routing breadth</option>
          {ROUTING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500 mt-1">
          How broadly to route this RFQ. The matching engine still decides who is invited.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Preferred Vendor */}
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Preferred vendor</label>
            {showAnnotations && (
              <AnnotationMarker
                id="pref-vendor"
                title="Preferred Vendor Network"
                description="Input any of your existing suppliers. The platform sends them direct email/WhatsApp alerts."
              />
            )}
          </div>
          <input
            type="text"
            value={data.preferredVendor}
            onChange={(e) => onChange({ preferredVendor: e.target.value })}
            placeholder="Search vendors..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Search your network (presentation only — search connects later).
          </p>
        </div>

        {/* Vendor Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vendor type</label>
          <select
            value={data.vendorType}
            onChange={(e) => onChange({ vendorType: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {VENDOR_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preferred Vendor Classification */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Preferred vendor classification
        </label>
        <select
          value={data.preferredVendorClassification}
          onChange={(e) => onChange({ preferredVendorClassification: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
        >
          {VENDOR_CLASSIFICATIONS.map((cls) => (
            <option key={cls.value} value={cls.value}>
              {cls.label}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500 mt-1">
          Optional — preferred Financial Tier (a capability tier, not a plan).
        </p>
      </div>

      {/* Checkboxes: Verified vendors & Alternative products */}
      <div className="mt-5 space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.verifiedVendorsOnly}
            onChange={(e) => onChange({ verifiedVendorsOnly: e.target.checked })}
            className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
          />
          <span>Verified vendors only</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.acceptAlternativeProducts}
            onChange={(e) => onChange({ acceptAlternativeProducts: e.target.checked })}
            className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
          />
          <span>Accept alternative products / brands</span>
        </label>
      </div>
    </div>
  );
};
