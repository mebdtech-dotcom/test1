import React from "react";
import { RFQFormData } from "../types";
import { PRODUCT_CONDITIONS } from "../data";
import { AnnotationMarker } from "./AnnotationMarker";

interface TechnicalRequirementsProps {
  data: RFQFormData;
  onChange: (fields: Partial<RFQFormData>) => void;
  showAnnotations: boolean;
}

export const TechnicalRequirements: React.FC<TechnicalRequirementsProps> = ({
  data,
  onChange,
  showAnnotations,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
      <h2 className="text-sm font-semibold text-indigo-900 tracking-wide mb-5 uppercase">
        Technical requirements
      </h2>

      {/* Specifications */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Specifications</label>
        <textarea
          rows={4}
          value={data.specifications}
          onChange={(e) => onChange({ specifications: e.target.value })}
          placeholder="Specification, scope, and acceptance criteria..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
        />
        <p className="text-[10px] text-slate-500 mt-1">
          Describe the requirement — grade, dimensions, tolerances, scope of work. Required to
          submit.
        </p>
      </div>

      {/* Checkbox: I don't have a formal spec doc */}
      <div className="mt-4 flex items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.noSpecificationDoc}
            onChange={(e) => onChange({ noSpecificationDoc: e.target.checked })}
            className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
          />
          <span>I don&apos;t have a formal specification document</span>
        </label>
        {showAnnotations && (
          <AnnotationMarker
            id="formal-spec-doc"
            title="Specification Document Option"
            description="Allows small buyers to skip formal document uploads and draft raw text requirements instead."
          />
        )}
      </div>

      {/* Brand preference & Alternative brand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Brand preference
          </label>
          <input
            type="text"
            value={data.brandPreference}
            onChange={(e) => onChange({ brandPreference: e.target.value })}
            placeholder="Preferred brand (optional)"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Alternative brand</label>
            {showAnnotations && (
              <AnnotationMarker
                id="alt-brand"
                title="Alternative Brand Guideline"
                description="Accepting alternative brands dramatically lowers bidding prices and avoids single-source monopolies."
              />
            )}
          </div>
          <input
            type="text"
            value={data.alternativeBrand}
            onChange={(e) => onChange({ alternativeBrand: e.target.value })}
            placeholder="Acceptable alternative"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Product condition & Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Product condition
          </label>
          <select
            value={data.productCondition}
            onChange={(e) => onChange({ productCondition: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="">Select condition</option>
            {PRODUCT_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Standards</label>
          <input
            type="text"
            value={data.standards}
            onChange={(e) => onChange({ standards: e.target.value })}
            placeholder="e.g. ASTM A36, ISO 9001"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Certifications */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Certifications</label>
        <input
          type="text"
          value={data.certifications}
          onChange={(e) => onChange({ certifications: e.target.value })}
          placeholder="e.g. EN 10204 3.1, mill test cert"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>
    </div>
  );
};
