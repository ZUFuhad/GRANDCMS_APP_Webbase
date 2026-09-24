import React, { useState } from 'react';
import { AIClientProspect, Client } from '../types';
import {
  Sparkles,
  Building,
  Target,
  Send,
  Copy,
  Check,
  Plus,
  Compass,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Mail,
  Loader2,
} from 'lucide-react';

interface AgenticGrowthProps {
  prospects: AIClientProspect[];
  onAddProspectToClients: (prospect: AIClientProspect) => void;
  onDraftQuotationFromProspect: (prospect: AIClientProspect) => void;
}

export const AgenticGrowth: React.FC<AgenticGrowthProps> = ({
  prospects: initialProspects,
  onAddProspectToClients,
  onDraftQuotationFromProspect,
}) => {
  const [prospects, setProspects] = useState<AIClientProspect[]>(initialProspects);
  const [industry, setIndustry] = useState('FMCG & Beverage Companies');
  const [region, setRegion] = useState('Chattogram Metro (Agrabad, GEC, Kazir Dewri)');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleLaunchDiscovery = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, region, count: 3 }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.prospects)) {
        const enriched = data.prospects.map((p: any, idx: number) => ({
          ...p,
          id: `ai-prospect-${Date.now()}-${idx}`,
          status: 'Discovered',
        }));
        setProspects([...enriched, ...prospects]);
      } else {
        alert('Discovery completed with default recommendations.');
      }
    } catch (err) {
      console.error('Error running AI Discovery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner in Corporate Deep Black with Blue Accent */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Autonomous B2B Expansion Agent
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Agentic Growth & AI Client Discovery
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Deploys an autonomous strategic agent powered by Gemini to research corporate prospects in Bangladesh,
              diagnose their signage/event needs, and craft pitches highlighting Grand's 22-year craftsmanship.
            </p>
          </div>

          <button
            onClick={handleLaunchDiscovery}
            disabled={loading}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Autonomous Discovery in Progress...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                Launch AI Client Discovery
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Parameters Control in White, Blue & Black */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-blue-600" />
          Autonomous Prospecting Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Target B2B Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="FMCG & Beverage Companies">FMCG & Beverage (Pran, Akij, Transcom, Meghna)</option>
              <option value="Private Commercial Banks">Private Commercial Banks (BRAC, City Bank, Eastern Bank)</option>
              <option value="Real Estate & Infrastructure">Real Estate Conglomerates (CPDL, Sanmar, Equity, BSRM)</option>
              <option value="Garments & Textile Conglomerates">Garments & RMG Groups (KDS, Pacific Jeans, Clifton)</option>
              <option value="Healthcare & Diagnostic Chains">Healthcare & Diagnostic Hospitals (CSCR, Epic, Parkview)</option>
              <option value="Trade Fair & Expo Organizers">Trade Fair & Festival Organizers (CCC&I Expo, Polo Ground)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Territory Focus</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="Chattogram Metro (Agrabad, GEC, Kazir Dewri)">
                Chattogram Metro (Agrabad, GEC, Kazir Dewri, CDA Market)
              </option>
              <option value="Dhaka Corporate HQ & Gulshan/Banani">Dhaka Corporate HQ & Gulshan/Banani</option>
              <option value="Sylhet & Regional Commercial Hubs">Sylhet & Regional Commercial Hubs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discovered Prospects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Qualified Corporate Opportunities ({prospects.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Click 'Convert to Client' to transfer into the CRM & prepare quotation.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {prospects.map((prospect) => (
            <div
              key={prospect.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between text-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-950 text-base leading-tight">
                      {prospect.companyName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {prospect.industry} &bull; {prospect.location}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                    Budget: {prospect.estimatedBudget}
                  </span>
                </div>

                {/* Potential Services */}
                <div className="flex flex-wrap gap-1.5 my-2.5">
                  {prospect.potentialServices.map((svc, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded text-[10.5px] bg-slate-100 text-slate-800 border border-slate-200 font-semibold"
                    >
                      {svc}
                    </span>
                  ))}
                </div>

                {/* Pain Point & Strategic Pitch */}
                <div className="space-y-2 text-xs my-3.5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                    <span className="font-bold text-slate-950 block text-[11px] mb-0.5">
                      Client Friction / Need:
                    </span>
                    <p className="text-[11.5px] leading-relaxed text-slate-600 font-medium">
                      {prospect.painPoint}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-slate-800">
                    <span className="font-bold text-blue-700 block text-[11px] mb-0.5">
                      Grand's Strategic Pitch (EST. 2004 Advantage):
                    </span>
                    <p className="text-[11.5px] leading-relaxed text-slate-700 font-medium">
                      {prospect.strategicPitch}
                    </p>
                  </div>
                </div>

                {/* Cold Copy Box */}
                <div className="space-y-2 pt-2.5 border-t border-slate-100">
                  {/* WhatsApp Copy */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11.5px] truncate mr-2">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{prospect.whatsappMessage}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(prospect.whatsappMessage, `${prospect.id}-wa`)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `${prospect.id}-wa` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy WA
                        </>
                      )}
                    </button>
                  </div>

                  {/* Email Copy */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11.5px] truncate mr-2">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{prospect.suggestedColdEmail}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(prospect.suggestedColdEmail, `${prospect.id}-email`)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `${prospect.id}-email` ? (
                        <>
                          <Check className="w-3 h-3 text-blue-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
                <button
                  onClick={() => onAddProspectToClients(prospect)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  Add to Clients
                </button>

                <button
                  onClick={() => onDraftQuotationFromProspect(prospect)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                >
                  Draft Quotation
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
