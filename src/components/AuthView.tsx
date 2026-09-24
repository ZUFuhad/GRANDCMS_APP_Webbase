import React, { useState } from 'react';
import { GrandLogo } from './GrandLogo';
import { UserSession } from '../types';
import { Lock, Mail, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface AuthViewProps {
  onLogin: (session: UserSession) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('grandecmm@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<UserSession['role']>('Super Admin');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    // Demo admin authentication
    const userSession: UserSession = {
      id: `usr-${Date.now()}`,
      name: role === 'Super Admin' ? 'Mohin Uddin Mazumder' : 'Executive Officer',
      email,
      role,
      token: `gcm-token-${Date.now()}`,
    };

    onLogin(userSession);
  };

  const handleQuickDemo = (demoRole: UserSession['role']) => {
    const userSession: UserSession = {
      id: `usr-${Date.now()}`,
      name: demoRole === 'Super Admin' ? 'Mohin Uddin Mazumder' : 'Khurshid Alam',
      email: demoRole === 'Super Admin' ? 'grandecmm@gmail.com' : 'ops@grandcomm.com',
      role: demoRole,
      token: `gcm-token-${Date.now()}`,
    };
    onLogin(userSession);
  };

  return (
    <div className="min-h-screen bg-[#0B192C] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Blue Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Grand Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <GrandLogo size="lg" variant="gold" showTagline={true} />
          <div className="mt-3">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-white bg-[#0B192C] px-3.5 py-1 rounded-full border border-blue-900 shadow-xs">
              Agency Management Portal
            </span>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Kazir Dewri, CDA Market, Chattogram &bull; Phone: 01819 312820
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Admin Email / Account
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="grandecmm@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Access Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
            >
              <option value="Super Admin">Super Admin (Full Financial & System Access)</option>
              <option value="Operations Executive">Operations Executive (Quotations & Projects)</option>
              <option value="Workshop Lead">Workshop Lead (Fabrication & Scheduling)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-black text-xs rounded-xl shadow-lg shadow-[#0B192C]/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 mt-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            Enter Grand CMS Portal
          </button>
        </form>

        {/* 1-Click Fast Demo Login */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-500 block mb-2.5 font-bold uppercase tracking-wider">
            Quick 1-Click Demo Login
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={() => handleQuickDemo('Super Admin')}
              className="flex-1 py-2 px-3 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-300" />
              Super Admin
            </button>
            <button
              onClick={() => handleQuickDemo('Operations Executive')}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Executive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
