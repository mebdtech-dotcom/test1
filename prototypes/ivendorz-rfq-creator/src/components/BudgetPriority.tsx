import React from "react";
import { RFQFormData } from "../types";
import { URGENCY_OPTIONS } from "../data";
import { AnnotationMarker } from "./AnnotationMarker";

interface BudgetPriorityProps {
  data: RFQFormData;
  onChange: (fields: Partial<RFQFormData>) => void;
  showAnnotations: boolean;
}

export const BudgetPriority: React.FC<BudgetPriorityProps> = ({
  data,
  onChange,
  showAnnotations,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
      <h2 className="text-sm font-semibold text-indigo-900 tracking-wide mb-5 uppercase">
        Budget & priority (optional)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Estimated Budget */}
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Estimated budget (BDT) <span className="text-red-500">*</span>
            </label>
            {showAnnotations && (
              <AnnotationMarker
                id="est-budget"
                title="Estimated Budget Target"
                description="Guideline budget for bid evaluation. Stored securely and shown to verified suppliers only."
              />
            )}
          </div>
          <input
            type="text"
            value={data.estimatedBudget}
            onChange={(e) => onChange({ estimatedBudget: e.target.value })}
            placeholder="e.g. 1,800,000"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Optional guidance — required only at submit. No currency selector: BDT at create.
          </p>
        </div>

        {/* Urgency */}
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Urgency</label>
            {showAnnotations && (
              <AnnotationMarker
                id="urgency-level"
                title="SLA Priority Tier"
                description="Controls how quickly suppliers must return quotations. High urgency triggers automated reminder runs."
              />
            )}
          </div>
          <select
            value={data.urgency}
            onChange={(e) => onChange({ urgency: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {URGENCY_OPTIONS.map((urg) => (
              <option key={urg} value={urg}>
                {urg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Special Instructions */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Special instructions
        </label>
        <textarea
          rows={3}
          value={data.specialInstructions}
          onChange={(e) => onChange({ specialInstructions: e.target.value })}
          placeholder="Anything else vendors should know — not commercial terms (those come in the quote)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
        />
      </div>
    </div>
  );
};
