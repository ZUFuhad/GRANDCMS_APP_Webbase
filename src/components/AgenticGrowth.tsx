import React from 'react';
import { AIClientProspect } from '../types';
import { TrendingUp, Sparkles, Building2 } from 'lucide-react';

interface AgenticGrowthProps {
  prospects: AIClientProspect[];
}

export const AgenticGrowth: React.FC<AgenticGrowthProps> = ({ prospects }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">AI Client Prospecting & Growth</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          AI-powered lead discovery for corporate brands in Chattogram & Dhaka.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prospects.map((p) => (
          <div key={p.id} className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3 text-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {p.status}
                </span>
                <h3 className="font-black text-sm text-white mt-2">{p.companyName}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" /> {p.industry}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#07101C] rounded-xl border border-slate-800 text-xs space-y-1">
              <p>👤 <strong>Contact:</strong> {p.contactPerson}</p>
              <p>💼 <strong>Recommended Service:</strong> {p.recommendedService}</p>
              <p className="font-black text-amber-400">Est. Budget: ৳ {p.estimatedBudget.toLocaleString()}/-</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
