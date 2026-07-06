import React from "react";
import { LayoutDashboard, FileText, CheckSquare, Users } from "lucide-react";

interface BottomNavProps {
  activeTab?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = "rfqs" }) => {
  return (
    <div className="bg-white border-t border-slate-200 py-2 sticky bottom-0 z-40 w-full shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {/* Dashboard */}
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors py-1 px-3 rounded-lg">
          <LayoutDashboard className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium tracking-wide">Dashboard</span>
        </button>

        {/* RFQs (Active) */}
        <button className="flex flex-col items-center gap-1 text-indigo-600 transition-colors py-1 px-4 rounded-lg relative font-semibold">
          <FileText className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] tracking-wide">RFQs</span>
          <span className="absolute top-1 right-3 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
        </button>

        {/* Approvals */}
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors py-1 px-3 rounded-lg">
          <CheckSquare className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium tracking-wide">Approvals</span>
        </button>

        {/* CRM */}
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors py-1 px-3 rounded-lg">
          <Users className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium tracking-wide">CRM</span>
        </button>
      </div>
    </div>
  );
};
