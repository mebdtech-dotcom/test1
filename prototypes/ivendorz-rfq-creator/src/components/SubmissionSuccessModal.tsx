import React from "react";
import { CheckCircle2, Clipboard, Printer, ExternalLink, RefreshCw, Layers } from "lucide-react";
import { RFQFormData } from "../types";

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RFQFormData;
  rfqId: string;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  onClose,
  data,
  rfqId,
}) => {
  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(rfqId);
    alert(`Copied RFQ ID: ${rfqId} to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">RFQ Submitted Successfully</h3>
        <p className="text-xs text-slate-500 mb-5">
          Your procurement request has been lodged and processed by our matching engine.
        </p>

        {/* Info Block */}
        <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 space-y-3 mb-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              RFQ Reference
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-600">
              <span>{rfqId}</span>
              <button
                onClick={handleCopyId}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                title="Copy ID"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-slate-500 col-span-2 border-b border-slate-100 pb-1 font-bold text-[10px] uppercase text-indigo-900/60 mb-1">
              Procured Line Items
            </div>
            <div className="col-span-2 space-y-1 max-h-[120px] overflow-y-auto pr-1 scrollbar-none mb-3">
              {(data.items || []).map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="flex justify-between items-center text-xs text-slate-800 font-medium py-0.5"
                >
                  <span className="truncate max-w-[200px]" title={it.itemName}>
                    <span className="text-slate-400 font-bold mr-1">{idx + 1}.</span>
                    {it.itemName || "Unnamed item"}
                    {it.size ? ` (${it.size})` : ""}
                  </span>
                  <span className="font-mono text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {it.quantity || "—"} {it.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-slate-500">Industry:</div>
            <div className="text-right font-medium text-slate-800">
              {data.industry || "General Metals"}
            </div>

            <div className="text-slate-500">Category:</div>
            <div className="text-right font-medium text-slate-800 truncate max-w-[150px]">
              {data.category || "Hot Rolled Plates"}
            </div>

            <div className="text-slate-500">Logistics Destination:</div>
            <div className="text-right font-medium text-slate-800">
              {data.deliveryDistrict ? `${data.deliveryDistrict} site` : "—"}
            </div>

            <div className="text-slate-500">Estimated Budget:</div>
            <div className="text-right font-semibold font-mono text-slate-900">
              {data.estimatedBudget
                ? `BDT ${Number(data.estimatedBudget).toLocaleString()}`
                : "Not declared"}
            </div>
          </div>
        </div>

        {/* AI Routing Match results section */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-left mb-6">
          <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            iVendorz Routing Matches
          </h4>
          <p className="text-[11px] text-indigo-900/80 leading-relaxed font-normal">
            Based on your <b>{data.deliveryDistrict || "Gazipur"}</b> delivery coordinates and{" "}
            <b>{data.category || "Hot Rolled Carbon Steel Plates"}</b> requirements, the engine has
            notified:
          </p>
          <div className="mt-3 flex items-center gap-4 text-center justify-around">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm min-w-[80px]">
              <div className="text-sm font-bold text-indigo-700">14</div>
              <div className="text-[9px] text-slate-500 font-medium">Verified Millers</div>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm min-w-[80px]">
              <div className="text-sm font-bold text-indigo-700">8</div>
              <div className="text-[9px] text-slate-500 font-medium">Stockists</div>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm min-w-[80px]">
              <div className="text-sm font-bold text-indigo-700">3 hrs</div>
              <div className="text-[9px] text-slate-500 font-medium">Avg Bid ETA</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Create Another
          </button>

          <button
            onClick={() => {
              alert("Draft printable PDF generated!");
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print RFQ Doc
          </button>
        </div>
      </div>
    </div>
  );
};
