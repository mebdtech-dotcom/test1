import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Trash2, Paperclip, AlertCircle } from "lucide-react";
import { RFQFormData, RFQAttachment } from "../types";
import { AnnotationMarker } from "./AnnotationMarker";

interface AttachmentsSectionProps {
  data: RFQFormData;
  onChange: (fields: Partial<RFQFormData>) => void;
  showAnnotations: boolean;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  data,
  onChange,
  showAnnotations,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileAdd = (files: FileList) => {
    setError(null);
    const newAttachments: RFQAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Max 20MB limit
      if (file.size > 20 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 20MB limit.`);
        continue;
      }

      // Format size
      const sizeKB = file.size / 1024;
      const sizeFormatted =
        sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;

      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: sizeFormatted,
        type: file.type || "application/octet-stream",
        uploadedAt: "Just now",
      });
    }

    if (newAttachments.length > 0) {
      onChange({
        attachments: [...data.attachments, ...newAttachments],
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileAdd(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileAdd(e.target.files);
    }
  };

  const handleDeleteAttachment = (id: string) => {
    onChange({
      attachments: data.attachments.filter((att) => att.id !== id),
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-indigo-900 tracking-wide uppercase">
            Attachments
          </h2>
          {showAnnotations && (
            <AnnotationMarker
              id="attachments-header"
              title="Attachments Header"
              description="High-resolution industrial technical drawings, engineering blueprints, and Bill of Quantities (BOQ) are uploaded here."
            />
          )}
        </div>
      </div>

      {/* Drag & Drop Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
            : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.dwg"
        />

        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-500 border border-slate-100">
          <UploadCloud className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="flex items-center gap-1.5 mb-1 justify-center">
          <span className="text-sm font-semibold text-slate-700">
            Drag & drop spec documents here
          </span>
          {showAnnotations && (
            <AnnotationMarker
              id="drag-drop-box"
              title="Drag & Drop Spec Upload"
              description="Supports PDF, DOCX, XLSX, DWG up to 20MB. Drag files directly from your desktop folder."
            />
          )}
        </div>
        <p className="text-[11px] text-slate-500 max-w-sm">
          PDF, DOCX, XLSX or images, up to 20 MB each. Uploading connects in the integration phase.
        </p>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Files / No Attachments State */}
      <div className="mt-5">
        {data.attachments.length === 0 ? (
          <div className="border border-slate-100 rounded-lg p-5 text-center bg-slate-50/30">
            <p className="text-xs font-semibold text-slate-700 mb-1">No attachments yet</p>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
              Attach drawings, BOQ, datasheets, images, or technical documents for vendors to quote
              against.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              Uploaded Documents ({data.attachments.length})
            </p>
            {data.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between border border-slate-100 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-md">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {att.size} • {att.uploadedAt}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
