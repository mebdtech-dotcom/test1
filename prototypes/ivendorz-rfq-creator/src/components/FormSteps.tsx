import React from "react";
import { Check } from "lucide-react";

interface FormStepsProps {
  activeSection: number;
  onStepClick: (stepIndex: number) => void;
}

export const FormSteps: React.FC<FormStepsProps> = ({ activeSection, onStepClick }) => {
  const steps = [
    { number: 1, label: "Requirement" },
    { number: 2, label: "Technical" },
    { number: 3, label: "Attachments" },
    { number: 4, label: "Delivery" },
    { number: 5, label: "Vendor preferences" },
    { number: 6, label: "Budget & priority" },
    { number: 7, label: "Communication" },
    { number: 8, label: "Review" },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-sm overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-1 py-3 justify-between min-w-[1000px]">
          {steps.map((step, idx) => {
            const isCompleted = step.number < activeSection;
            const isActive = step.number === activeSection;

            return (
              <React.Fragment key={step.number}>
                {/* Step Item */}
                <button
                  onClick={() => onStepClick(step.number)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-left group cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {/* Step Circle */}
                  <span
                    className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
                  </span>
                  <span className="text-xs whitespace-nowrap">{step.label}</span>
                </button>

                {/* Line Separator (except last) */}
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[1px] bg-slate-200 mx-1 max-w-[24px]"></div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
