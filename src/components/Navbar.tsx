import React, { useState, useEffect } from 'react';
import { Bell, Search, ShieldCheck, Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppNotification } from '../types';
import { SupabaseService } from '../services/supabase';

interface NavbarProps {
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  activeTabTitle: string;
  onNavigateToDatabase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications,
  onMarkNotificationsRead,
  activeTabTitle,
  onNavigateToDatabase,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'checking' | 'offline' | 'needs-key'>('checking');
  const unreadCount = notifications.filter((n) => !n.read).length;

  const checkDb = async () => {
    if (!SupabaseService.isConfigured()) {
      setDbStatus('needs-key');
      return;
    }
    setDbStatus('checking');
    try {
      const res = await SupabaseService.testConnection();
      setDbStatus(res.success ? 'connected' : 'offline');
    } catch {
      setDbStatus('offline');
    }
  };

  useEffect(() => {
    checkDb();
    const handleConfigChange = () => checkDb();
    window.addEventListener('grand-supabase-config-changed', handleConfigChange);
    return () => window.removeEventListener('grand-supabase-config-changed', handleConfigChange);
  }, []);

  return (
    <header className="h-16 bg-[#0B192C] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
          {activeTabTitle}
        </h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-semibold text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Official Agency ERP</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase Status Pill */}
        <button
          onClick={onNavigateToDatabase}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            dbStatus === 'connected'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/60'
              : dbStatus === 'checking'
              ? 'bg-blue-950/40 border-blue-500/50 text-blue-300'
              : dbStatus === 'needs-key'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-950/60'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
          title="Supabase PostgreSQL database status - Click to configure or view SQL schema"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">
            {dbStatus === 'connected'
              ? 'Supabase: Live'
              : dbStatus === 'checking'
              ? 'Connecting...'
              : dbStatus === 'needs-key'
              ? 'Link Supabase'
              : 'Offline Cache'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected'
                ? 'bg-emerald-400 animate-pulse'
                : dbStatus === 'checking'
                ? 'bg-blue-400 animate-ping'
                : 'bg-amber-400'
            }`}
          />
        </button>

        {/* Search */}
        <div className="hidden lg:flex items-center bg-[#07101C] rounded-xl px-3 py-1.5 w-56 border border-slate-800">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search quotations..."
            className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (unreadCount > 0) onMarkNotificationsRead();
            }}
            className="relative p-2 rounded-xl bg-[#07101C] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0B192C] rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 text-slate-200">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-xs text-white">Notifications</h4>
                <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  {notifications.length} total
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-800/60 transition-colors">
                      <p className="font-bold text-xs text-amber-400">{n.title}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">{n.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">{n.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
