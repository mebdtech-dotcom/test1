import React, { useState } from "react";
import { Info } from "lucide-react";

interface AnnotationMarkerProps {
  id: string;
  title: string;
  description: string;
  className?: string;
}

export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  id,
  title,
  description,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className} select-none z-10`}>
      {/* Black N Badge exactly like Figma annotations */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-md border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
        title={`Review annotation: ${title}`}
      >
        N
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-7 w-64 bg-slate-900 text-white p-3 rounded-lg shadow-xl z-50 text-xs border border-slate-700 pointer-events-auto">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">#{id}</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-normal">{description}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>
        </>
      )}
    </div>
  );
};
