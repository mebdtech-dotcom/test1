import React from "react";
import { RFQFormData } from "../types";
import { AnnotationMarker } from "./AnnotationMarker";

interface CommunicationPreferencesProps {
  data: RFQFormData;
  onChange: (fields: Partial<RFQFormData>) => void;
  showAnnotations: boolean;
}

export const CommunicationPreferences: React.FC<CommunicationPreferencesProps> = ({
  data,
  onChange,
  showAnnotations,
}) => {
  const handleMethodToggle = (method: keyof RFQFormData["contactMethods"]) => {
    if (method === "platform") return; // Always enabled
    onChange({
      contactMethods: {
        ...data.contactMethods,
        [method]: !data.contactMethods[method],
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
      <h2 className="text-sm font-semibold text-indigo-900 tracking-wide mb-5 uppercase">
        Communication preferences
      </h2>

      {/* Preferred contact method */}
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Preferred contact method
          </label>
          {showAnnotations && (
            <AnnotationMarker
              id="contact-methods"
              title="Contact Channels"
              description="Platform chat is always active to preserve clean audit trails. Extra channels share details selectively."
            />
          )}
        </div>
        <p className="text-[10px] text-slate-500 mb-4">
          Platform messages stay on — the official record and audit trail. The rest are optional and
          buyer-controlled.
        </p>

        <div className="flex flex-wrap gap-4 sm:gap-6">
          {/* Platform messages */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.contactMethods.platform}
              disabled
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-not-allowed opacity-80"
            />
            <span className="text-slate-500">Platform messages (always on)</span>
          </label>

          {/* Phone call */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.contactMethods.phone}
              onChange={() => handleMethodToggle("phone")}
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
            />
            <span>Phone call</span>
          </label>

          {/* WhatsApp */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.contactMethods.whatsApp}
              onChange={() => handleMethodToggle("whatsApp")}
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
            />
            <span>WhatsApp</span>
          </label>

          {/* Email */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.contactMethods.email}
              onChange={() => handleMethodToggle("email")}
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
            />
            <span>Email</span>
          </label>
        </div>
      </div>

      {/* WhatsApp Sub-section (Visible/Enabled when WhatsApp contact is checked) */}
      <div
        className={`mt-6 border border-slate-100 rounded-lg p-4 bg-slate-50/50 transition-all ${!data.contactMethods.whatsApp ? "opacity-50 pointer-events-none" : ""}`}
      >
        <h3 className="text-xs font-semibold text-slate-800 mb-1">WhatsApp contact</h3>
        <p className="text-[10px] text-slate-500 mb-4">If you allow WhatsApp:</p>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.whatsAppAllowContact}
              disabled={!data.contactMethods.whatsApp}
              onChange={(e) => onChange({ whatsAppAllowContact: e.target.checked })}
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
            />
            <span>Allow verified vendors to contact me via WhatsApp</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.whatsAppUseAccountPhone}
              disabled={!data.contactMethods.whatsApp}
              onChange={(e) => onChange({ whatsAppUseAccountPhone: e.target.checked })}
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
            />
            <span>Use my account phone number</span>
          </label>
        </div>

        {/* Alternative number */}
        <div className="mt-4">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
            Alternative WhatsApp number
          </label>
          <input
            type="text"
            disabled={!data.contactMethods.whatsApp || data.whatsAppUseAccountPhone}
            value={data.whatsAppAlternativeNumber}
            onChange={(e) => onChange({ whatsAppAlternativeNumber: e.target.value })}
            placeholder="+880 1XXXXXXXXX"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">
            Only if different from your account number. Your WhatsApp number is shared only with
            vendors who receive this RFQ.
          </p>
        </div>
      </div>

      {/* Preferred contact time */}
      <div className="mt-6">
        <div className="flex items-center gap-1.5 mb-3">
          <label className="block text-xs font-semibold text-slate-700">
            Preferred contact time <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          {showAnnotations && (
            <AnnotationMarker
              id="contact-time"
              title="Timezone & SLA Preferences"
              description="Restricts outgoing push notifications to specific hours (e.g. Business Hours only) so you are not disturbed."
            />
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {["Anytime", "Business hours", "Morning", "Afternoon", "Evening"].map((time) => (
            <label
              key={time}
              className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="preferredContactTime"
                value={time}
                checked={data.preferredContactTime === time}
                onChange={(e) => onChange({ preferredContactTime: e.target.value })}
                className="w-4 h-4 border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />
              <span>{time}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
