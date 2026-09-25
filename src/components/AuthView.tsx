import React, { useState } from 'react';
import { GrandLogo } from './GrandLogo';
import { Lock, User } from 'lucide-react';

interface AuthViewProps {
  onLogin: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Zahir Uddin Fuhad');
  const [pin, setPin] = useState('2004');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            Access Grand ERP Portal
          </button>
        </form>

        <p className="text-[10px] text-slate-400">
          EST. 2004 • Kazir Dewri, Chattogram
        </p>
      </div>
    </div>
  );
};
