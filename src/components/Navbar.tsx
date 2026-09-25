import React, { useState } from 'react';
import { Bell, Search, ShieldCheck } from 'lucide-react';
import { AppNotification } from '../types';

interface NavbarProps {
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  activeTabTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications,
  onMarkNotificationsRead,
  activeTabTitle,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

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

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-[#07101C] rounded-xl px-3 py-1.5 w-64 border border-slate-800">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search clients, quotations..."
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
