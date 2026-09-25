import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Calendar,
  WalletCards,
  TrendingUp,
  Sparkles,
  LogOut,
  Upload,
} from 'lucide-react';
import { GrandLogo } from './GrandLogo';
import { LogoUploadModal } from './LogoUploadModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'invoices', label: 'Invoices & Receipts', icon: Receipt },
    { id: 'clients', label: 'Clients & Suppliers', icon: Users },
    { id: 'projects', label: 'Project Scheduling', icon: Calendar },
    { id: 'expenses', label: 'Expenses & Liabilities', icon: WalletCards },
    { id: 'agentic', label: 'AI Prospecting', icon: TrendingUp },
    { id: 'generator', label: 'AI Design Gen', icon: Sparkles },
  ];

  return (
    <aside
      style={{ width: '16rem', minWidth: '16rem' }}
      className="w-64 bg-[#0B192C] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col items-center justify-center text-center bg-[#07101C]">
        <GrandLogo size="md" variant="gold" onClick={() => setIsLogoModalOpen(true)} />
        <h2 className="text-xs font-bold text-amber-400 mt-2 tracking-wider">
          GRAND COMMUNICATION & MARKETING
        </h2>
        <button
          onClick={() => setIsLogoModalOpen(true)}
          className="mt-2 text-[10px] font-medium text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer"
          title="Change or upload grand-logo.png"
        >
          <Upload className="w-3 h-3 text-amber-400" />
          <span>Change / Upload Logo</span>
        </button>
      </div>

      <LogoUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer User & Logout */}
      <div className="p-4 border-t border-slate-800 bg-[#07101C]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-xs">
              ZF
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">Zahir Uddin Fuhad</h4>
              <p className="text-[10px] text-amber-400 font-medium">CEO & Founder</p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-semibold transition-all border border-red-900/50 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Secure Logout</span>
        </button>
      </div>
    </aside>
  );
};
