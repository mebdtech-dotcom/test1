import React from "react";
import { Menu, Plus, Sparkles, Bell, ChevronRight, HelpCircle } from "lucide-react";

interface HeaderProps {
  onLoadDemo: () => void;
  onReset: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadDemo, onReset, hasData }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
      {/* Upper Brand/Global Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left section: Logo & Hamburger */}
        <div className="flex items-center gap-4">
          <button
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            id="nav-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 select-none">
            {/* Hexagon custom brand logo resembling the top-left in screenshot */}
            <div
              className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center text-white font-bold text-xs relative overflow-hidden shadow-sm"
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
            >
              <span className="relative z-10 text-[10px] tracking-wider">iV</span>
            </div>
            <span className="font-semibold text-slate-800 tracking-tight text-base flex items-center gap-1.5">
              iVendorz
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal font-mono">
                v1.2
              </span>
            </span>
          </div>
        </div>

        {/* Right Section: Actions & Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick Pre-fill / Reset for awesome prototyping experience */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <button
              onClick={onLoadDemo}
              className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              title="Populate fields with demo procurement data"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Fill Demo RFQ
            </button>
            {hasData && (
              <button
                onClick={onReset}
                className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            id="btn-create"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>

          <button
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
          </button>

          <button
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
            id="notification-bell"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
              2
            </span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-2 cursor-pointer group">
            <div
              className="w-8 h-8 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs border border-slate-700 shadow-sm"
              id="user-avatar"
            >
              YA
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors hidden md:block">
              Yasin A.
            </span>
          </div>
        </div>
      </div>

      {/* Sub Header: Breadcrumbs & App Context */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <a href="#rfqs" className="hover:text-indigo-600 transition-colors">
              RFQs
            </a>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800">New RFQ</span>
          </div>

          <div className="sm:hidden flex gap-2">
            <button
              onClick={onLoadDemo}
              className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Demo
            </button>
            <button
              onClick={onReset}
              className="text-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
