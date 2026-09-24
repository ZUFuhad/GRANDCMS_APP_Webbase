import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  Users2,
  CalendarClock,
  WalletCards,
  Sparkles,
  Palette,
  CloudUpload,
  Layers,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'quotations'
  | 'invoices'
  | 'clients_suppliers'
  | 'projects'
  | 'expenses'
  | 'agentic_growth'
  | 'ai_design'
  | 'deployment';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  quotationCount: number;
  dueAmount: number;
  liabilityAmount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  quotationCount,
  dueAmount,
  liabilityAmount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'quotations' as NavTab,
      label: 'Quotation System',
      icon: FileSpreadsheet,
      badge: quotationCount > 0 ? `${quotationCount}` : null,
      badgeColor: 'bg-[#1E3E62] text-white border-blue-400/30',
    },
    {
      id: 'invoices' as NavTab,
      label: 'Billing & Invoices',
      icon: Receipt,
      badge: dueAmount > 0 ? `Due: ${(dueAmount / 1000).toFixed(0)}k` : null,
      badgeColor: 'bg-rose-900/60 text-rose-200 border-rose-500/40',
    },
    {
      id: 'clients_suppliers' as NavTab,
      label: 'Clients & Suppliers',
      icon: Users2,
      badge: null,
    },
    {
      id: 'projects' as NavTab,
      label: 'Projects & Scheduling',
      icon: CalendarClock,
      badge: 'Live',
      badgeColor: 'bg-white text-[#0B192C] font-black',
    },
    {
      id: 'expenses' as NavTab,
      label: 'Financial Liabilities',
      icon: WalletCards,
      badge: liabilityAmount > 0 ? `Pay: ${(liabilityAmount / 1000).toFixed(0)}k` : null,
      badgeColor: 'bg-[#1E3E62] text-blue-200 border-[#2A4D78]',
    },
    {
      id: 'agentic_growth' as NavTab,
      label: 'Agentic AI Discovery',
      icon: Sparkles,
      badge: 'AI Lead',
      badgeColor: 'bg-[#1E3E62] text-white border-blue-400/30',
    },
    {
      id: 'ai_design' as NavTab,
      label: 'AI Design Generator',
      icon: Palette,
      badge: '3D/Specs',
      badgeColor: 'bg-[#1E3E62] text-white border-blue-400/30',
    },
    {
      id: 'deployment' as NavTab,
      label: 'Setup Hobay (Deploy)',
      icon: CloudUpload,
      badge: 'Hub',
      badgeColor: 'bg-[#1E3E62] text-white border-blue-400/30',
    },
  ];

  return (
    <aside className="w-64 bg-[#0B192C] border-r border-[#1E3E62] text-blue-100 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-blue-300/80">
          Core Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-white text-[#0B192C] shadow-md shadow-black/20 font-black'
                  : 'text-blue-100 hover:bg-[#102A43] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#0B192C]' : 'text-blue-300 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold border ${
                    isActive
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : item.badgeColor || 'bg-[#1E3E62] text-white border-[#2A4D78]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Agency Credential & Quick Info Box */}
      <div className="p-4 border-t border-[#1E3E62]">
        <div className="bg-[#071322] p-3.5 rounded-2xl border border-[#1E3E62] text-xs">
          <div className="flex items-center gap-2 text-white font-bold mb-1">
            <Layers className="w-4 h-4 text-blue-300" />
            <span>Grand Service Hub</span>
          </div>
          <p className="text-[11px] text-blue-200/70 leading-tight">
            20 CDA Market, Kazir Dewri, Ctg
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#1E3E62] flex items-center justify-between text-[10px] text-blue-200/70 font-mono">
            <span className="text-white font-semibold">D1 / Workers ready</span>
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
          </div>
        </div>
      </div>
    </aside>
  );
};
