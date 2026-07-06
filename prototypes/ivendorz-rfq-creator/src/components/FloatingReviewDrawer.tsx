import React from "react";
import { X, Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { RFQFormData } from "../types";
import { ReviewSection } from "./ReviewSection";

interface FloatingReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: RFQFormData;
  showAnnotations: boolean;
}

export const FloatingReviewDrawer: React.FC<FloatingReviewDrawerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  showAnnotations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with fade-in */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Panel container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-50 shadow-2xl border-l border-slate-200/80 flex flex-col h-full relative animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-100">
                  Step 8 of 8: Final Review
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                Launch Procurement Matching
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect your compiled RFQ data below. Click Confirm to notify vendors.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
            {/* Notice banner */}
            <div className="bg-indigo-50 border border-indigo-100/80 rounded-xl p-4 flex gap-3 text-left">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950">
                  Ready to Dispatch to {data.deliveryDistrict || "Gazipur"} Area
                </h4>
                <p className="text-[11px] text-indigo-900/80 mt-1 leading-relaxed">
                  Upon approval, this request is immediately distributed to vetted millers,
                  stockists, and fabricators matching your specific logistics and steel parameters.
                </p>
              </div>
            </div>

            {/* Embedded Live Review Card */}
            <div>
              <ReviewSection data={data} showAnnotations={showAnnotations} />
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="bg-white border-t border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <div className="text-left hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Draft
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">
                {data.items?.length || 0} line items compiled
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer text-center"
              >
                Go Back & Edit
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse-slow"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Confirm & Launch RFQ Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
