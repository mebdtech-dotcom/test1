import React, { useEffect, useState } from "react";
import { RFQFormData, RFQItem } from "../types";
import { INDUSTRIES, CATEGORIES_BY_INDUSTRY, UNITS } from "../data";
import { AnnotationMarker } from "./AnnotationMarker";
import { Plus, Trash2, FileSpreadsheet, AlertCircle, Check, HelpCircle } from "lucide-react";

const REQUEST_TYPE_LABELS: Record<keyof RFQFormData["requestTypes"], string> = {
  supply: "Product Supply",
  service: "Service / Contract Work",
  fabricate: "Custom Fabrication",
  consult: "Engineering & Consulting",
};

interface RequirementDetailsProps {
  data: RFQFormData;
  onChange: (fields: Partial<RFQFormData>) => void;
  showAnnotations: boolean;
}

export const RequirementDetails: React.FC<RequirementDetailsProps> = ({
  data,
  onChange,
  showAnnotations,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteError, setPasteError] = useState("");

  const updateItems = (newItems: RFQItem[]) => {
    const firstItem = newItems[0] || { itemName: "", size: "", quantity: "", unit: "Unit" };
    onChange({
      items: newItems,
      itemName: firstItem.itemName,
      size: firstItem.size || "",
      quantity: firstItem.quantity,
      unit: firstItem.unit,
    });
  };

  const handleItemFieldChange = (index: number, field: keyof RFQItem, value: string) => {
    const updated = [...(data.items || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      updateItems(updated);
    }
  };

  const handleAddRow = () => {
    const updated = [
      ...(data.items || []),
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemName: "",
        size: "",
        quantity: "",
        unit: "Unit",
      },
    ];
    updateItems(updated);
  };

  const handleDeleteRow = (index: number) => {
    const updated = (data.items || []).filter((_, i) => i !== index);
    updateItems(updated);
  };

  const handleImportPaste = (append: boolean) => {
    if (!pasteText.trim()) {
      setPasteError("Please paste some tabular data first.");
      return;
    }

    const lines = pasteText.split(/\r?\n/);
    const parsedItems: RFQItem[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;

      let cols = line.split("\t");
      if (cols.length < 2) {
        cols = line.split(",");
      }
      if (cols.length < 2) {
        cols = line.split(";");
      }

      let itemName = "";
      let size = "";
      let quantityRaw = "";
      let unitRaw = "";

      if (cols.length >= 4) {
        itemName = cols[0]?.trim() || "";
        size = cols[1]?.trim() || "";
        quantityRaw = cols[2]?.trim() || "";
        unitRaw = cols[3]?.trim() || "";
      } else if (cols.length === 3) {
        itemName = cols[0]?.trim() || "";
        size = "";
        quantityRaw = cols[1]?.trim() || "";
        unitRaw = cols[2]?.trim() || "";
      } else {
        itemName = cols[0]?.trim() || "";
        quantityRaw = cols[1]?.trim() || "";
        unitRaw = cols[2]?.trim() || "";
      }

      let matchedUnit = "Unit";
      if (unitRaw) {
        const found = UNITS.find((u) => u.toLowerCase() === unitRaw.toLowerCase());
        if (found) {
          matchedUnit = found;
        } else {
          const lower = unitRaw.toLowerCase();
          if (lower === "tons" || lower === "ton" || lower === "t") matchedUnit = "Ton";
          else if (lower === "kgs" || lower === "kg" || lower === "kilogram") matchedUnit = "Kg";
          else if (lower === "pcs" || lower === "pc" || lower === "pieces") matchedUnit = "Pcs";
          else if (lower === "meters" || lower === "meter" || lower === "m" || lower === "mtr")
            matchedUnit = "Mtr";
          else if (lower === "liters" || lower === "ltr" || lower === "l" || lower === "litre")
            matchedUnit = "Ltr";
          else if (lower === "boxes" || lower === "box") matchedUnit = "Box";
          else if (lower === "rolls" || lower === "roll") matchedUnit = "Roll";
          else if (lower === "sets" || lower === "set") matchedUnit = "Set";
          else if (lower === "drums" || lower === "drum") matchedUnit = "Drum";
          else if (lower === "sft" || lower === "sqft") matchedUnit = "Sft";
          else if (lower === "cft" || lower === "cuft") matchedUnit = "Cft";
        }
      }

      if (itemName || quantityRaw) {
        parsedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemName,
          size,
          quantity: quantityRaw.replace(/[^0-9.]/g, ""),
          unit: matchedUnit,
        });
      }
    });

    if (parsedItems.length === 0) {
      setPasteError(
        "Could not parse columns. Copy 4 columns (Item Name, Size, Qty, Unit) or 3 columns from Excel.",
      );
      return;
    }

    const currentItems = data.items || [];
    const merged = append ? [...currentItems, ...parsedItems] : parsedItems;

    updateItems(merged);
    setPasteText("");
    setShowPasteBox(false);
    setPasteError("");
  };

  useEffect(() => {
    if (data.industry && CATEGORIES_BY_INDUSTRY[data.industry]) {
      setCategories(CATEGORIES_BY_INDUSTRY[data.industry]);
    } else {
      setCategories([]);
    }
  }, [data.industry]);

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    onChange({
      industry: selected,
      category: "", // Reset category on industry change
    });
  };

  const handleRequestTypeToggle = (type: keyof RFQFormData["requestTypes"]) => {
    onChange({
      requestTypes: {
        ...data.requestTypes,
        [type]: !data.requestTypes[type],
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative">
      <h2 className="text-sm font-semibold text-indigo-900 tracking-wide mb-5 uppercase">
        Requirement details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Industry Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Industry</label>
          <select
            value={data.industry}
            onChange={handleIndustryChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">
            Helps narrow the category list (not stored on the RFQ).
          </p>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            required
          >
            <option value="">Select a category</option>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Please select industry first
              </option>
            )}
          </select>
        </div>
      </div>

      {/* Request Type */}
      <div className="mt-5 relative">
        <div className="flex items-center gap-1.5 mb-2">
          <label className="block text-xs font-semibold text-slate-700">
            Request type <span className="text-red-500">*</span>
          </label>
          {showAnnotations && (
            <AnnotationMarker
              id="req-type"
              title="Request Type Annotation"
              description="Pick all that apply (Product Supply / Service / Contract Work / Custom Fabrication / Engineering & Consulting). Essential for vendor capabilities matching."
            />
          )}
        </div>
        <p className="text-[10px] text-slate-500 mb-3">
          Pick all that apply (Product Supply / Service / Contract Work / Custom Fabrication /
          Engineering & Consulting).
        </p>

        <div className="flex flex-wrap gap-4 sm:gap-6">
          {(["supply", "service", "fabricate", "consult"] as const).map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={data.requestTypes[type]}
                onChange={() => handleRequestTypeToggle(type)}
                className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />
              <span>{REQUEST_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Item details dynamic rows */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Item Requirements List
              {showAnnotations && (
                <AnnotationMarker
                  id="items-list-annotation"
                  title="Multi-item Requirements List"
                  description="Procurement engine accepts multiple material lines with specific sizes, quantities, and automatic Sl. no."
                />
              )}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Provide names, sizes, quantities, and standard units for each requested line.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="self-start sm:self-auto flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-100/80 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Paste from Excel (4 Col)
          </button>
        </div>

        {/* Excel Paste Container */}
        {showPasteBox && (
          <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Excel / Spreadsheet Paste Tool
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowPasteBox(false);
                  setPasteError("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Close
              </button>
            </div>

            <p className="text-[10px] text-slate-600 leading-normal">
              Copy a 4-column table from Excel or Google Sheets containing <b>Item Name</b>,{" "}
              <b>Size</b>, <b>Quantity</b>, and <b>Unit</b>. Then paste it below. Columns are
              matched by tabs, commas, or semicolons.
            </p>

            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="e.g.&#10;MS plate&#9;12mm thick&#9;45&#9;Ton&#10;MS plate&#9;16mm thick&#9;20&#9;Ton&#10;H-Beam&#9;200x200mm&#9;15&#9;Pcs"
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
            ></textarea>

            {pasteError && (
              <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {pasteError}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleImportPaste(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3" />
                Append to list
              </button>
              <button
                type="button"
                onClick={() => handleImportPaste(false)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-emerald-500" />
                Replace current list
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Items Table */}
        <div className="space-y-3">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <div className="col-span-1 text-center">Sl. No.</div>
            <div className="col-span-4">
              Item Name <span className="text-red-500">*</span>
            </div>
            <div className="col-span-3">Size</div>
            <div className="col-span-2">
              Qty <span className="text-red-500">*</span>
            </div>
            <div className="col-span-1 text-center">Unit</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Rows List */}
          <div className="space-y-3 md:space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-none">
            {(data.items || []).map((item, index) => (
              <div
                key={item.id || index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center bg-slate-50/50 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-100 md:border-none"
              >
                {/* Serial Number */}
                <div className="col-span-1 flex items-center justify-between md:justify-center">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 md:py-1 min-w-[24px] text-center font-mono">
                    {index + 1}
                  </span>
                  <span className="md:hidden text-[10px] font-bold text-indigo-900/60 uppercase tracking-wide">
                    Line Item Details
                  </span>
                </div>

                {/* Item Name */}
                <div className="col-span-4">
                  <label className="block md:hidden text-[9px] text-slate-400 font-bold uppercase mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => handleItemFieldChange(index, "itemName", e.target.value)}
                    placeholder="e.g. MS plate"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 md:py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                {/* Size */}
                <div className="col-span-3">
                  <label className="block md:hidden text-[9px] text-slate-400 font-bold uppercase mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={item.size || ""}
                    onChange={(e) => handleItemFieldChange(index, "size", e.target.value)}
                    placeholder="e.g. 12mm thick"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 md:py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <label className="block md:hidden text-[9px] text-slate-400 font-bold uppercase mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemFieldChange(index, "quantity", e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 md:py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                {/* Unit */}
                <div className="col-span-1">
                  <label className="block md:hidden text-[9px] text-slate-400 font-bold uppercase mb-1">
                    Unit
                  </label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemFieldChange(index, "unit", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 md:py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex justify-end md:justify-center">
                  <button
                    type="button"
                    disabled={(data.items || []).length <= 1}
                    onClick={() => handleDeleteRow(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Add New Item Line
          </button>
        </div>
      </div>
    </div>
  );
};
