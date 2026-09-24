import React, { useState } from 'react';
import { GrandLogo } from './GrandLogo';
import { AppNotification, UserSession } from '../types';
import {
  Bell,
  Smartphone,
  Monitor,
  LogOut,
  User,
  Plus,
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Check,
  Clock,
  AlertTriangle,
  ChevronDown,
  Layers,
  Download,
} from 'lucide-react';

interface NavbarProps {
  user: UserSession;
  notifications: AppNotification[];
  isMobileSimulator: boolean;
  onToggleMobileSimulator: () => void;
  onLogout: () => void;
  onMarkNotificationsRead: () => void;
  onQuickAction: (action: 'quotation' | 'invoice' | 'expense' | 'ai_discovery') => void;
  onRequestPushPermission: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  notifications,
  isMobileSimulator,
  onToggleMobileSimulator,
  onLogout,
  onMarkNotificationsRead,
  onQuickAction,
  onRequestPushPermission,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(() => localStorage.getItem('grand_cms_user_mobile') || '+8801819998877');
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [tempMobile, setTempMobile] = useState(mobileNumber);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSaveMobile = () => {
    setMobileNumber(tempMobile);
    localStorage.setItem('grand_cms_user_mobile', tempMobile);
    setIsEditingMobile(false);
  };

  const handleSendToWhatsApp = (n: AppNotification) => {
    const text = encodeURIComponent(`*GRAND CMS Alert*\n\n*${n.title}*\n${n.message}\nTime: ${n.timestamp}`);
    const cleanNum = mobileNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');
  };

  return (
    <header className="bg-[#0B192C] border-b border-[#1E3E62] sticky top-0 z-40 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <GrandLogo size="sm" variant="gold" showTagline={false} />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-black text-white tracking-wider">
                  GRAND <span className="text-blue-300">CMS</span>
                </span>
                <span className="text-[10px] bg-[#1E3E62] text-white font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  EST. 2004
                </span>
              </div>
              <p className="text-[11px] text-blue-200/70 -mt-0.5 italic">
                we value what you have to say!
              </p>
            </div>
          </div>

          {/* Center / Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher: Desktop vs Mobile App Simulator */}
            <button
              onClick={onToggleMobileSimulator}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isMobileSimulator
                  ? 'bg-white text-[#0B192C] border-white shadow-md font-extrabold'
                  : 'bg-[#102A43] text-white border-[#1E3E62] hover:bg-[#1E3E62]'
              }`}
              title="Toggle Mobile App Simulator"
            >
              {isMobileSimulator ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#0B192C]" />
                  <span className="hidden md:inline">Mobile App View</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-blue-300" />
                  <span className="hidden md:inline">Desktop View</span>
                </>
              )}
            </button>

            {/* Download Project ZIP for GitHub */}
            <a
              href="/grand-cms-project.zip"
              download="grand-cms-project.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Download full project ZIP for GitHub"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Project ZIP</span>
            </a>

            {/* Quick Action Button in Navy Blue / White */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQuickMenu(!showQuickMenu);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#0B192C] hover:bg-slate-100 text-xs font-extrabold shadow-md shadow-black/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#0B192C]" />
                <span className="hidden sm:inline">Quick Action</span>
                <ChevronDown className="w-3 h-3 text-[#0B192C] opacity-80" />
              </button>

              {/* Quick Menu Dropdown */}
              {showQuickMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0B192C] border border-[#1E3E62] rounded-2xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-blue-300">
                    Create New
                  </div>
                  <button
                    onClick={() => {
                      onQuickAction('quotation');
                      setShowQuickMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#1E3E62] text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-300" />
                    <span>Create Quotation</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('invoice');
                      setShowQuickMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#1E3E62] text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-blue-300" />
                    <span>Generate Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('expense');
                      setShowQuickMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#1E3E62] text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-rose-300" />
                    <span>Record Bill / Liability</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('ai_discovery');
                      setShowQuickMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#1E3E62] text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-blue-300" />
                    <span>AI Lead Discovery</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowQuickMenu(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-xl bg-[#102A43] border border-[#1E3E62] hover:bg-[#1E3E62] text-white relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[#0B192C] text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B192C] border border-[#1E3E62] rounded-2xl shadow-2xl overflow-hidden z-50 text-xs">
                  {/* Mobile Number & WhatsApp Alert Setup Bar */}
                  <div className="p-3 bg-[#102A43] border-b border-[#1E3E62] text-[11px] text-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mobile: <strong className="text-white">{mobileNumber}</strong></span>
                    </div>
                    {isEditingMobile ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempMobile}
                          onChange={(e) => setTempMobile(e.target.value)}
                          className="w-28 px-2 py-0.5 rounded bg-[#071322] border border-blue-400 text-white text-[11px]"
                          placeholder="+8801..."
                        />
                        <button
                          onClick={handleSaveMobile}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingMobile(true)}
                        className="text-blue-300 hover:underline font-semibold cursor-pointer"
                      >
                        Change Number
                      </button>
                    )}
                  </div>

                  <div className="p-3.5 bg-[#071322] border-b border-[#1E3E62] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-white text-[#0B192C] text-[10px] font-black">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onMarkNotificationsRead}
                        className="text-[11px] text-blue-300 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={onRequestPushPermission}
                        className="text-[11px] text-blue-200/70 hover:text-white cursor-pointer"
                        title="Enable Browser Push Notifications"
                      >
                        Enable Push
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#1E3E62]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-blue-200/50">
                        No notifications currently.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-[#1E3E62]/50 transition-colors ${
                            !n.isRead ? 'bg-[#102A43]' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-white text-xs">{n.title}</h4>
                            <span className="text-[10px] text-blue-200/60 shrink-0">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-blue-100 text-[11px] mt-1 leading-snug">
                            {n.message}
                          </p>
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              onClick={() => handleSendToWhatsApp(n)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1 transition-all cursor-pointer"
                              title="Forward to Mobile / WhatsApp"
                            >
                              <Smartphone className="w-3 h-3" />
                              Send to WhatsApp
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setShowQuickMenu(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#102A43] border border-[#1E3E62] hover:bg-[#1E3E62] text-xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-white text-[#0B192C] flex items-center justify-center font-black text-xs shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <span className="font-bold text-white block leading-tight">{user.name}</span>
                  <span className="text-[10px] text-blue-300 font-semibold">{user.role}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-blue-200 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-[#0B192C] border border-[#1E3E62] rounded-2xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-[#1E3E62]">
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-blue-200/70">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-[#1E3E62] text-white border border-blue-400/30">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3.5 py-2 text-rose-300 hover:bg-rose-500/20 flex items-center gap-2 transition-colors cursor-pointer mt-1 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
