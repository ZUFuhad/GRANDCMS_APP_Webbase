import React from 'react';
import { Smartphone, Wifi, Battery, Signal, ArrowLeft } from 'lucide-react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  Users2,
  CalendarClock,
  Sparkles,
} from 'lucide-react';

interface MobileSimulatorFrameProps {
  children: React.ReactNode;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onExitMobileSimulator: () => void;
}

export const MobileSimulatorFrame: React.FC<MobileSimulatorFrameProps> = ({
  children,
  currentTab,
  onSelectTab,
  onExitMobileSimulator,
}) => {
  return (
    <div className="min-h-screen bg-[#071322] flex flex-col items-center justify-center p-2 sm:p-6 select-none">
      {/* Top Banner explaining Mobile Simulator mode */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm sm:max-w-md px-2 text-xs text-blue-200">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <Smartphone className="w-4 h-4 text-blue-300" />
          <span>Grand CMS Mobile App Mode</span>
        </div>
        <button
          onClick={onExitMobileSimulator}
          className="text-xs text-white hover:bg-[#1E3E62] bg-[#102A43] px-2.5 py-1 rounded-lg border border-[#1E3E62] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Desktop
        </button>
      </div>

      {/* Phone Hardware Mockup Shell in Navy Blue */}
      <div className="w-full max-w-[420px] h-[860px] bg-[#0B192C] border-[10px] border-[#102A43] rounded-[50px] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Dynamic Island / Speaker Notch */}
        <div className="bg-[#0B192C] pt-3 pb-1 px-7 flex items-center justify-between text-[11px] text-blue-100 font-semibold shrink-0 z-30">
          <span>9:41</span>
          <div className="w-24 h-4 bg-[#071322] rounded-full flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#1E3E62]"></span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-200">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Scrollable Mobile Content Canvas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 bg-[#f4f7fb] text-slate-900">
          {children}
        </div>

        {/* Bottom Mobile Tab Bar */}
        <div className="bg-[#0B192C] border-t border-[#1E3E62] px-3 py-2.5 flex items-center justify-around shrink-0 z-30">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'dashboard' ? 'text-white font-black' : 'text-blue-200/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab('quotations')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'quotations' ? 'text-white font-black' : 'text-blue-200/70 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Quotes</span>
          </button>

          <button
            onClick={() => onSelectTab('invoices')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'invoices' ? 'text-white font-black' : 'text-blue-200/70 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => onSelectTab('projects')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'projects' ? 'text-white font-black' : 'text-blue-200/70 hover:text-white'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Projects</span>
          </button>

          <button
            onClick={() => onSelectTab('agentic_growth')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'agentic_growth' ? 'text-white font-black' : 'text-blue-200/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Lead</span>
          </button>
        </div>

        {/* Home Bar Indicator */}
        <div className="bg-[#0B192C] pb-2 pt-1 flex justify-center shrink-0">
          <div className="w-32 h-1 bg-[#1E3E62] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
