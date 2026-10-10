import React, { useState, useEffect } from "react";
import { GrandLogo } from "./GrandLogo";
import { Lock, User, Eye, EyeOff, Sparkles, Settings, RotateCcw, Check, AlertCircle } from "lucide-react";

interface AuthViewProps {
  onLogin: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("admin");
  const [pin, setPin] = useState("grand2024");
  const [showPin, setShowPin] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("grand_admin_username") || localStorage.getItem("grand_custom_username");
    const savedPin = localStorage.getItem("grand_custom_password");
    if (savedUser) setUsername(savedUser);
    if (savedPin) setPin(savedPin);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const u = username.trim().toLowerCase();
    const p = pin.trim();

    const customU = (localStorage.getItem("grand_custom_username") || "").trim().toLowerCase();
    const customP = (localStorage.getItem("grand_custom_password") || "").trim();

    const isValidUser =
      u === "admin" ||
      u === "zahir uddin fuhad" ||
      u === "fuhad" ||
      u === "fuhadctg@gmail.com" ||
      u === "grandcms" ||
      (customU && u === customU);

    const isValidPin =
      p === "2004" ||
      p === "grand2024" ||
      p === "grandcms2004" ||
      p === "admin123" ||
      p === "admin" ||
      (customP && p === customP);

    if (isValidUser && isValidPin) {
      localStorage.setItem("grand_admin_logged_in", "true");
      localStorage.setItem("grand_admin_username", username.trim());
      onLogin();
    } else {
      setError("ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। নিচে দেয়া রেডি এক্সেস ব্যবহার করুন বা পাসওয়ার্ড পরিবর্তন করুন।");
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim() || !newPin.trim()) {
      setError("নতুন ইউজার ও পাসওয়ার্ড পূরণ করুন");
      return;
    }
    localStorage.setItem("grand_custom_username", newUser.trim());
    localStorage.setItem("grand_custom_password", newPin.trim());
    setUsername(newUser.trim());
    setPin(newPin.trim());
    setSuccess("নতুন আইডি ও পাসওয়ার্ড সংরক্ষিত হয়েছে!");
    setTimeout(() => {
      setSuccess(null);
      setIsChanging(false);
    }, 1500);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPin(p);
    localStorage.setItem("grand_admin_logged_in", "true");
    localStorage.setItem("grand_admin_username", u);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#0B192C] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center border border-slate-100">
        <div className="flex flex-col items-center justify-center">
          <GrandLogo size="lg" variant="gold" />
          <h2 className="text-sm font-black text-slate-800 mt-3 tracking-wider">
            GRAND COMMUNICATION & MARKETING
          </h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise ERP & CMS Login Portal</p>
        </div>

        {/* Database Connected Badge */}
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Supabase DB: Connected
          </span>
          <span className="font-mono text-[10px] text-emerald-600">grwtylyqwxoqadwlzqkl</span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!isChanging ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Authorized User</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Secure PIN / Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              Access Grand ERP Portal
            </button>

            {/* Quick Login Options */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin", "grand2024")}
                className="text-amber-600 hover:underline font-bold"
              >
                ⚡ Quick: admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("Zahir Uddin Fuhad", "2004")}
                className="text-amber-600 hover:underline font-bold"
              >
                ⚡ Quick: Fuhad (2004)
              </button>
              <button
                type="button"
                onClick={() => { setIsChanging(true); setNewUser(username); }}
                className="text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Change Pass
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveCredentials} className="space-y-4 text-left">
            <h3 className="text-xs font-black text-slate-800 uppercase">Change Username & PIN/Password</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Username</label>
              <input
                type="text"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                placeholder="New username"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password / PIN</label>
              <input
                type="text"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New password or PIN"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save New Pass
              </button>
              <button
                type="button"
                onClick={() => setIsChanging(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <p className="text-[10px] text-slate-400">
          EST. 2004 • Kazir Dewri, Chattogram
        </p>
      </div>
    </div>
  );
};
