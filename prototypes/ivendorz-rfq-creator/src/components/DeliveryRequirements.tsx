import React from "react";
import { RFQFormData } from "../types";
import { BANGLADESH_DISTRICTS } from "../data";
import { AnnotationMarker } from "./AnnotationMarker";

interface DeliveryRequirementsProps {
  data: RFQFormData;
  onChange: (fields: Partial<RFQFormData>) => void;
  showAnnotations: boolean;
}

export const DeliveryRequirements: React.FC<DeliveryRequirementsProps> = ({
  data,
  onChange,
  showAnnotations,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
      <h2 className="text-sm font-semibold text-indigo-900 tracking-wide mb-5 uppercase">
        Delivery requirements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Delivery Location */}
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Delivery location</label>
            {showAnnotations && (
              <AnnotationMarker
                id="del-location"
                title="Delivery Location Pin"
                description="Specific site coordinates, plot address or street location for direct site drop-off."
              />
            )}
          </div>
          <input
            type="text"
            value={data.deliveryLocation}
            onChange={(e) => onChange({ deliveryLocation: e.target.value })}
            placeholder="Site / address"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Delivery District */}
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Delivery district <span className="text-red-500">*</span>
            </label>
            {showAnnotations && (
              <AnnotationMarker
                id="del-district"
                title="Delivery District Requirement"
                description="Bangladesh districts (e.g. Gazipur, Chittagong). Essential to calculate heavy flatbed trucking costs."
              />
            )}
          </div>
          <select
            value={data.deliveryDistrict}
            onChange={(e) => onChange({ deliveryDistrict: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            required
          >
            <option value="">Select district</option>
            {BANGLADESH_DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">
            At least a district is required to submit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Required Delivery Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Required delivery date
          </label>
          <input
            type="date"
            value={data.requiredDeliveryDate}
            onChange={(e) => onChange({ requiredDeliveryDate: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          />
        </div>

        {/* Delivery Site Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Delivery site</label>
          <select
            value={data.deliverySite}
            onChange={(e) => onChange({ deliverySite: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="Factory / Warehouse / Site">Factory / Warehouse / Site</option>
            <option value="Port (CIF / FOB)">Port (CIF / FOB)</option>
            <option value="Third Party Depot">Third Party Depot</option>
            <option value="Office / Corporate Headquarters">Office / Corporate Headquarters</option>
          </select>
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Delivery instructions
        </label>
        <textarea
          rows={3}
          value={data.deliveryInstructions}
          onChange={(e) => onChange({ deliveryInstructions: e.target.value })}
          placeholder="Access, unloading, timing, packaging..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
        />
      </div>
    </div>
  );
};
