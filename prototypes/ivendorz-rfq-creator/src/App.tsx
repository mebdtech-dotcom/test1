import React, { useState, useEffect, useRef } from "react";
import { INITIAL_RFQ_DATA, DEMO_RFQ_DATA } from "./data";
import { RFQFormData } from "./types";
import { Header } from "./components/Header";
import { FormSteps } from "./components/FormSteps";
import { RequirementDetails } from "./components/RequirementDetails";
import { TechnicalRequirements } from "./components/TechnicalRequirements";
import { AttachmentsSection } from "./components/AttachmentsSection";
import { DeliveryRequirements } from "./components/DeliveryRequirements";
import { VendorPreferences } from "./components/VendorPreferences";
import { BudgetPriority } from "./components/BudgetPriority";
import { CommunicationPreferences } from "./components/CommunicationPreferences";
import { ReviewSection } from "./components/ReviewSection";
import { FloatingReviewDrawer } from "./components/FloatingReviewDrawer";
import { SubmissionSuccessModal } from "./components/SubmissionSuccessModal";
import { BottomNav } from "./components/BottomNav";
import { Save, CheckCircle, Info, Sparkles, Check, HelpCircle } from "lucide-react";

export default function App() {
  const [data, setData] = useState<RFQFormData>(() => {
    const saved = localStorage.getItem("ivendorz_rfq_draft");
    return saved ? JSON.parse(saved) : INITIAL_RFQ_DATA;
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isReviewFloatingOpen, setIsReviewFloatingOpen] = useState<boolean>(false);
  const [generatedRfqId, setGeneratedRfqId] = useState<string>("");

  // Refs for scroll elements
  const sectionRefs = {
    1: useRef<HTMLDivElement>(null),
    2: useRef<HTMLDivElement>(null),
    3: useRef<HTMLDivElement>(null),
    4: useRef<HTMLDivElement>(null),
    5: useRef<HTMLDivElement>(null),
    6: useRef<HTMLDivElement>(null),
    7: useRef<HTMLDivElement>(null),
    8: useRef<HTMLDivElement>(null),
  };

  // Auto-save logic
  useEffect(() => {
    localStorage.setItem("ivendorz_rfq_draft", JSON.stringify(data));
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLastSaved(timeString);
  }, [data]);

  // Scroll spy to highlight active step
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header & sticky steps bar

      let currentStep = 1;
      for (const [stepStr, ref] of Object.entries(sectionRefs)) {
        const stepNum = Number(stepStr);
        if (ref.current) {
          const offsetTop = ref.current.offsetTop;
          const offsetHeight = ref.current.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentStep = stepNum;
            break;
          }
        }
      }
      setActiveStep(currentStep);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll helper
  const handleStepClick = (stepIndex: number) => {
    const targetRef = sectionRefs[stepIndex as keyof typeof sectionRefs];
    if (targetRef?.current) {
      const yOffset = -140; // Space for sticky header + sticky steps
      const y = targetRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveStep(stepIndex);
    }
  };

  const handleUpdateField = (fields: Partial<RFQFormData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleLoadDemo = () => {
    setData(DEMO_RFQ_DATA);
    showToast("Demo procurement data populated successfully!", "success");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the entire RFQ draft?")) {
      setData(INITIAL_RFQ_DATA);
      showToast("Draft cleared", "info");
    }
  };

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveDraftManual = () => {
    localStorage.setItem("ivendorz_rfq_draft", JSON.stringify(data));
    showToast("Draft manually saved to browser storage!", "success");
  };

  const handleSubmitRFQ = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!data.category) {
      alert("Please select a category under Requirement Details first.");
      handleStepClick(1);
      return;
    }
    if (!data.deliveryDistrict) {
      alert("Please select a delivery district under Delivery Requirements first.");
      handleStepClick(4);
      return;
    }
    if (!data.routing) {
      alert("Please select a routing mode under Vendor Preferences first.");
      handleStepClick(5);
      return;
    }

    // Open the FLOATING Review Section drawer
    setIsReviewFloatingOpen(true);
  };

  const handleConfirmFinalSubmit = () => {
    setIsReviewFloatingOpen(false);

    // Generate RFQ Reference ID
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const rfqId = `RFQ-${year}-${month}-${randomSuffix}`;

    setGeneratedRfqId(rfqId);
    setIsModalOpen(true);
  };

  const hasData = data.category !== "" || data.itemName !== "" || data.deliveryLocation !== "";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-indigo-500/10 selection:text-indigo-600">
      {/* Header Bar */}
      <Header onLoadDemo={handleLoadDemo} onReset={handleReset} hasData={hasData} />

      {/* Hero Heading Section */}
      <section className="bg-white py-6 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-indigo-950 tracking-tight flex items-center gap-2">
                Create a request for quotation
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
                Describe what you need; the routing engine matches verified vendors and gathers
                quotations.
              </p>
            </div>

            {/* Toggle Annotations (Figma Comments) */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Figma Comments
              </span>
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  showAnnotations
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {showAnnotations ? "Visible" : "Hidden"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Progress Steps */}
      <FormSteps activeSection={activeStep} onStepClick={handleStepClick} />

      {/* Main Multi-Section Form Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <form
          onSubmit={handleSubmitRFQ}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Interactive Cards Stack */}
          <div className="lg:col-span-7 space-y-6">
            <div ref={sectionRefs[1]}>
              <RequirementDetails
                data={data}
                onChange={handleUpdateField}
                showAnnotations={showAnnotations}
              />
            </div>

            <div ref={sectionRefs[2]}>
              <TechnicalRequirements
                data={data}
                onChange={handleUpdateField}
                showAnnotations={showAnnotations}
              />
            </div>

            <div ref={sectionRefs[3]}>
              <AttachmentsSection
                data={data}
                onChange={handleUpdateField}
                showAnnotations={showAnnotations}
              />
            </div>

            <div ref={sectionRefs[4]}>
              <DeliveryRequirements
                data={data}
                onChange={handleUpdateField}
                showAnnotations={showAnnotations}
              />
            </div>

            <div ref={sectionRefs[5]}>
              <VendorPreferences
                data={data}
                onChange={handleUpdateField}
                showAnnotations={showAnnotations}
              />
            </div>

            <div ref={sectionRefs[6]}>
              <BudgetPriority
                data={data}
                onChange={handleUpdateField}
                showAnnotations={showAnnotations}
              />
            </div>

            <div ref={sectionRefs[7]}>
              <CommunicationPreferences
                data={data}
                onChange={handleUpdateField}
                showAnnotations={showAnnotations}
              />
            </div>
          </div>

          {/* Right Column: Live Sync Review Card (Sticks beside form cards on large screens!) */}
          <div className="lg:col-span-5 lg:sticky lg:top-40 space-y-6" ref={sectionRefs[8]}>
            <ReviewSection data={data} showAnnotations={showAnnotations} />
          </div>
        </form>
      </main>

      {/* Custom Floating Toast Alert */}
      {toast && (
        <div className="fixed bottom-24 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Fixed/Sticky Bottom Submission Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium text-center sm:text-left flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Drafts and submission connect in the integration phase.</span>
            {lastSaved && (
              <span className="text-slate-400 font-normal">(Auto-saved at {lastSaved})</span>
            )}
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraftManual}
              className="flex-1 sm:flex-none bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save draft
            </button>
            <button
              onClick={handleSubmitRFQ}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
            >
              <span>+ Submit RFQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Footer */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] py-4 border-t border-slate-800 px-4 mb-24">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© Yasin A. — Industrial Procurement OS.</span>
          <span className="font-mono text-slate-500">BDT Currency Standard</span>
        </div>
      </footer>

      {/* Bottom Hub Navigator */}
      <BottomNav />

      {/* Interactive Floating Review Drawer */}
      <FloatingReviewDrawer
        isOpen={isReviewFloatingOpen}
        onClose={() => setIsReviewFloatingOpen(false)}
        onConfirm={handleConfirmFinalSubmit}
        data={data}
        showAnnotations={showAnnotations}
      />

      {/* Interactive Submission Success Modal */}
      <SubmissionSuccessModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setData(INITIAL_RFQ_DATA);
        }}
        data={data}
        rfqId={generatedRfqId}
      />
    </div>
  );
}
