import React, { useState, useEffect, useRef } from 'react';
import { AIClientProspect, MonitoredCompany, ProspectChatMessage, VerifiedBusinessContact } from '../types';
import { INITIAL_MONITORED_COMPANIES } from '../mock/initialData';
import {
  TrendingUp,
  Building2,
  Phone,
  MessageCircle,
  Plus,
  Search,
  Filter,
  Bot,
  Radar,
  Sparkles,
  Send,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface AgenticGrowthProps {
  prospects: AIClientProspect[];
  onSaveProspect?: (prospect: AIClientProspect) => void;
  onDeleteProspect?: (id: string) => void;
  onConvertToQuotation?: (prospect: AIClientProspect) => void;
}

const hasVerifiedContacts = (profile: Partial<VerifiedBusinessContact>) => {
  const isBangladeshiMobile = (value?: string) => {
    const digits = (value || '').replace(/\D/g, '');
    return /^(?:880)?1[3-9]\d{8}$/.test(digits) || /^0?1[3-9]\d{8}$/.test(digits);
  };
  const requiredFields = [
    profile.contactPerson,
    profile.mobileNumber,
    profile.whatsappNumber,
    profile.email,
    profile.executiveName,
    profile.executiveTitle,
    profile.executiveMobileNumber,
    profile.executiveWhatsappNumber,
    profile.executiveEmail,
  ];
  const sourceHosts = (profile.sourceUrls || []).flatMap((source) => {
    try {
      const url = new URL(source);
      return url.protocol === 'https:' ? [url.hostname.toLowerCase()] : [];
    } catch {
      return [];
    }
  });

  const mobileNumbersValid = [
    profile.mobileNumber,
    profile.whatsappNumber,
    profile.executiveMobileNumber,
    profile.executiveWhatsappNumber,
  ].every(isBangladeshiMobile);

  return profile.contactVerified === true && requiredFields.every((field) => Boolean(field?.trim())) && mobileNumbersValid && new Set(sourceHosts).size >= 2;
};

export const AgenticGrowth: React.FC<AgenticGrowthProps> = ({
  prospects,
  onSaveProspect,
  onDeleteProspect,
  onConvertToQuotation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'radar' | 'chat'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Monitored Companies (saved to localStorage)
  const [monitoredCompanies, setMonitoredCompanies] = useState<MonitoredCompany[]>(() => {
    const saved = localStorage.getItem('grand_monitored_companies');
    if (saved) {
      try {
        const storedCompanies = JSON.parse(saved);
        const sampleIds = new Set(['mc-1', 'mc-2', 'mc-3']);
        return Array.isArray(storedCompanies)
          ? storedCompanies.filter((company) => !sampleIds.has(company.id) && company.status !== 'Signal Detected' && hasVerifiedContacts(company))
          : INITIAL_MONITORED_COMPANIES;
      } catch (_) {}
    }
    return INITIAL_MONITORED_COMPANIES;
  });

  useEffect(() => {
    localStorage.setItem('grand_monitored_companies', JSON.stringify(monitoredCompanies));
  }, [monitoredCompanies]);

  // Chat State (saved to localStorage)
  const [chatMessages, setChatMessages] = useState<ProspectChatMessage[]>(() => {
    const saved = localStorage.getItem('grand_prospect_chat');
    if (saved) {
      try {
        const storedMessages = JSON.parse(saved);
        return Array.isArray(storedMessages)
          ? storedMessages.filter((message) => !(message.sender === 'ai' && message.suggestedLead))
          : [];
      } catch (_) {}
    }
    return [
      {
        id: 'msg-1',
        sender: 'ai',
        text: 'এই Radar শুধু আপনার watchlist-এ দেওয়া তথ্য ব্যবহার করে। Live web search বা market data সংযুক্ত নেই, তাই contact বা নতুন কাজের signal যাচাই ছাড়া তৈরি হবে না।',
        timestamp: 'Just now',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('grand_prospect_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // New Lead Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<AIClientProspect | null>(null);

  // Form State for Lead
  const [formData, setFormData] = useState<Partial<AIClientProspect>>({
    companyName: '',
    industry: '',
    contactPerson: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    executiveName: '',
    executiveTitle: '',
    executiveMobileNumber: '',
    executiveWhatsappNumber: '',
    executiveEmail: '',
    sourceUrls: [],
    contactVerified: false,
    location: 'Chattogram',
    estimatedBudget: 100000,
    recommendedService: '',
    triggerEvent: '',
    priority: 'High',
    status: 'New Lead',
  });

  // New Monitored Company Modal State
  const [isMonitorModalOpen, setIsMonitorModalOpen] = useState(false);
  const [monitorForm, setMonitorForm] = useState<Partial<MonitoredCompany>>({
    companyName: '',
    industry: '',
    focusArea: '',
    contactPerson: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    executiveName: '',
    executiveTitle: '',
    executiveMobileNumber: '',
    executiveWhatsappNumber: '',
    executiveEmail: '',
    sourceUrls: [],
    contactVerified: false,
  });

  const [scanNotice, setScanNotice] = useState<string | null>(null);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeSubTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSubTab, isTyping]);

  // Open Lead Modal
  const handleOpenLeadModal = (lead?: AIClientProspect) => {
    if (lead) {
      setEditingLead(lead);
      setFormData(lead);
    } else {
      setEditingLead(null);
      setFormData({
        companyName: '',
        industry: '',
        contactPerson: '',
        mobileNumber: '',
        whatsappNumber: '',
        email: '',
        executiveName: '',
        executiveTitle: '',
        executiveMobileNumber: '',
        executiveWhatsappNumber: '',
        executiveEmail: '',
        sourceUrls: [],
        contactVerified: false,
        location: 'Chattogram',
        estimatedBudget: 100000,
        recommendedService: 'Outdoor Billboard & Event Branding',
        triggerEvent: '',
        priority: 'High',
        status: 'New Lead',
      });
    }
    setIsLeadModalOpen(true);
  };

  const handleSaveLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.triggerEvent?.trim() || !hasVerifiedContacts(formData)) {
      alert('Lead save করতে company, opportunity details, all contact fields, two HTTPS sources, and verification confirmation are required.');
      return;
    }

    const leadToSave: AIClientProspect = {
      id: editingLead ? editingLead.id : `p-${Date.now()}`,
      companyName: formData.companyName,
      industry: formData.industry || 'Corporate & Commercial',
      contactPerson: formData.contactPerson,
      mobileNumber: formData.mobileNumber,
      whatsappNumber: formData.whatsappNumber,
      email: formData.email || '',
      executiveName: formData.executiveName,
      executiveTitle: formData.executiveTitle,
      executiveMobileNumber: formData.executiveMobileNumber,
      executiveWhatsappNumber: formData.executiveWhatsappNumber,
      executiveEmail: formData.executiveEmail,
      sourceUrls: formData.sourceUrls,
      location: formData.location || 'Chattogram',
      estimatedBudget: Math.max(0, Number(formData.estimatedBudget) || 0),
      recommendedService: formData.recommendedService || '',
      triggerEvent: formData.triggerEvent,
      priority: (formData.priority as any) || 'High',
      source: editingLead?.source || 'Manual',
      contactVerified: true,
      status: (formData.status as any) || 'New Lead',
      createdAt: editingLead?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (onSaveProspect) {
      onSaveProspect(leadToSave);
    }
    setIsLeadModalOpen(false);
  };

  // Add Monitored Company
  const handleSaveMonitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitorForm.companyName || !monitorForm.focusArea || !hasVerifiedContacts(monitorForm)) {
      alert('Company profile needs all contact fields, two HTTPS source links, and verification confirmation.');
      return;
    }

    const newCompany: MonitoredCompany = {
      id: `mc-${Date.now()}`,
      companyName: monitorForm.companyName,
      industry: monitorForm.industry || 'General Industry',
      focusArea: monitorForm.focusArea,
      ...monitorForm,
      contactVerified: true,
      status: 'Paused',
      lastChecked: 'Background monitoring not configured',
      signalNotes: '',
    };

    setMonitoredCompanies((previous) => [newCompany, ...previous.filter((company) => company.companyName.toLowerCase() !== newCompany.companyName.toLowerCase())]);
    setIsMonitorModalOpen(false);
    setScanNotice(`"${newCompany.companyName}" verified profile saved. Live monitoring is not configured.`);
    setTimeout(() => setScanNotice(null), 3000);
  };

  // Chat never invents contacts or market events when no search provider is configured.
  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ProspectChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setTimeout(() => {
      const isListRequest = /list|watchlist|লিস্ট|কোম্পানি.*কোন/.test(query.toLowerCase());
      const listText = monitoredCompanies.map((company, index) => `${index + 1}. ${company.companyName} (${company.status})`).join('\n');
      const reply: ProspectChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: isListRequest
          ? monitoredCompanies.length ? `Verified company profiles:\n\n${listText}` : 'No verified company profiles have been added yet.'
          : 'Live search and scheduled monitoring are not configured. I will not invent a contact, opportunity, or notification. Add a source-backed company profile, then connect a server-side search provider to enable monitoring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((previous) => [...previous, reply]);
      setIsTyping(false);
    }, 900);
  };

  // Add suggested lead to pipeline
  const handleAddSuggestedLead = (lead: Partial<AIClientProspect>) => {
    if (!lead || !lead.companyName || !hasVerifiedContacts(lead) || !lead.triggerEvent?.trim()) return;

    const fullLead: AIClientProspect = {
      id: lead.id || `p-${Date.now()}`,
      companyName: lead.companyName,
      industry: lead.industry || 'Corporate',
      contactPerson: lead.contactPerson || '',
      mobileNumber: lead.mobileNumber || '',
      whatsappNumber: lead.whatsappNumber || '',
      email: lead.email || '',
      executiveName: lead.executiveName || '',
      executiveTitle: lead.executiveTitle || '',
      executiveMobileNumber: lead.executiveMobileNumber || '',
      executiveWhatsappNumber: lead.executiveWhatsappNumber || '',
      executiveEmail: lead.executiveEmail || '',
      sourceUrls: lead.sourceUrls || [],
      contactVerified: true,
      location: lead.location || '',
      estimatedBudget: Number(lead.estimatedBudget) || 0,
      recommendedService: lead.recommendedService || '',
      triggerEvent: lead.triggerEvent || '',
      priority: lead.priority || 'Medium',
      source: 'AI Radar',
      status: 'New Lead',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (onSaveProspect) {
      onSaveProspect(fullLead);
      setScanNotice(`"${fullLead.companyName}" candidate যোগ হয়েছে। Outreach-এর আগে তথ্য যাচাই করুন।`);
      setTimeout(() => setScanNotice(null), 3500);
    }
  };

  // Do not represent profile records as fresh leads without an external signal source.
  const handleRunFullMarketScan = () => {
    setScanNotice('Live monitoring is paused: connect a server-side search provider and scheduler first.');
    setTimeout(() => setScanNotice(null), 4000);
  };

  const safeProspects = (prospects || []).filter((prospect) => hasVerifiedContacts(prospect) && prospect.companyName.trim() && prospect.triggerEvent?.trim());

  const filteredProspects = safeProspects.filter((p) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (p.companyName || '').toLowerCase().includes(q) ||
      (p.contactPerson || '').toLowerCase().includes(q) ||
      (p.mobileNumber || '').toLowerCase().includes(q) ||
      (p.industry || '').toLowerCase().includes(q) ||
      (p.recommendedService || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">AI Client Prospecting & Radar</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            কোম্পানি মনিটরিং, স্বয়ংক্রিয় লিড ডিটেকশন এবং কন্টাক্ট পারসনের মোবাইল নাম্বার সহ কর্পোরেট ক্লায়েন্ট ড্রাইভ।
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRunFullMarketScan}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition text-xs sm:text-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
                <span>Check Monitoring Setup</span>
          </button>

          <button
            onClick={() => handleOpenLeadModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0B192C] hover:bg-slate-800 border border-slate-700 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Global Scan Notice Banner */}
      {scanNotice && (
        <div className="p-3 bg-amber-950/70 border border-amber-500/40 rounded-xl text-amber-200 text-xs sm:text-sm flex items-center gap-2 shadow animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
          <span>{scanNotice}</span>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeSubTab === 'pipeline'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
                <span>Verified Leads Pipeline ({safeProspects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeSubTab === 'chat'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-400" />
          <span>AI Company Monitor Chat (এআই চ্যাট)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>

        <button
          onClick={() => setActiveSubTab('radar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeSubTab === 'radar'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>Monitored Companies ({monitoredCompanies.length})</span>
        </button>
      </div>

      {/* ===================== TAB 1: ALL LEADS PIPELINE ===================== */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company, contact person, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#07101C] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-amber-400" /> Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#07101C] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Status</option>
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#07101C] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Prospects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProspects.map((lead) => (
              <div
                key={lead.id}
                className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          lead.status === 'Won'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : lead.status === 'Proposal Sent'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : lead.status === 'Contacted'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {lead.status}
                      </span>
                      {lead.priority && (
                        <span className="ml-1.5 text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          {lead.priority} Priority
                        </span>
                      )}
                      {lead.source !== 'Manual' && !lead.contactVerified && (
                        <span className="ml-1.5 text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          Unverified candidate
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenLeadModal(lead)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Lead"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteProspect && (
                        <button
                          onClick={() => onDeleteProspect(lead.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-black text-base text-white mt-2.5 leading-snug">{lead.companyName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-amber-400" /> {lead.industry}
                  </p>
                </div>

                {/* Contact Person & Mobile Number (Highlight) */}
                <div className="p-3.5 bg-[#07101C] rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Contact Person</span>
                      <strong className="text-xs sm:text-sm text-white font-bold truncate block">{lead.contactPerson}</strong>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-amber-300 font-mono">Mobile: {lead.mobileNumber}</span>
                      <a href={`tel:${lead.mobileNumber}`} className="text-emerald-400 font-bold">Call</a>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-emerald-300 font-mono">WhatsApp: {lead.whatsappNumber}</span>
                      <a href={`https://wa.me/${lead.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-400 font-bold">Message</a>
                    </div>
                    <a href={`mailto:${lead.email}`} className="block text-slate-300 break-all">{lead.email}</a>
                  </div>
                  <div className="border-t border-slate-800/60 pt-2 text-[10px] text-slate-400 space-y-1">
                    <p>{lead.executiveTitle}: {lead.executiveName}</p>
                    <p>Mobile: {lead.executiveMobileNumber} · WhatsApp: {lead.executiveWhatsappNumber}</p>
                    <a href={`mailto:${lead.executiveEmail}`} className="block break-all">{lead.executiveEmail}</a>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {lead.sourceUrls?.map((source) => (
                        <a key={source} href={source} target="_blank" rel="noreferrer" className="text-amber-300 underline">Verified source</a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scope & Budget Details */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Est. Budget:</span>
                    <span className="font-black text-amber-400 text-sm">
                      {lead.estimatedBudget > 0 ? `৳ ${lead.estimatedBudget.toLocaleString()}/-` : 'Not provided'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Recommended Service:</span>
                    <span className="text-xs text-slate-200 font-semibold">{lead.recommendedService || 'Not entered'}</span>
                  </div>

                  {lead.triggerEvent && (
                    <div className="pt-1.5 text-[11px] text-slate-400 italic flex items-start gap-1">
                      <Zap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{lead.triggerEvent}</span>
                    </div>
                  )}
                </div>

                {/* Action: Convert to Quotation */}
                <div className="pt-2 border-t border-slate-800">
                  {onConvertToQuotation && (
                    <button
                      onClick={() => onConvertToQuotation(lead)}
                      className="w-full flex items-center justify-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Generate Quotation (কোটেশন তৈরি করুন)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredProspects.length === 0 && (
              <div className="col-span-full py-16 text-center bg-[#0B192C] rounded-2xl border border-dashed border-slate-800">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">কোনো লিড পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  আপনার অনুসন্ধানের সাথে মিলছে এমন কোনো লিড নেই। নতুন লিড যোগ করতে বা AI দিয়ে মনিটর করতে পারেন।
                </p>
                <button
                  onClick={() => handleOpenLeadModal()}
                  className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  + Add New Lead
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: AI COMPANY MONITOR CHAT ===================== */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Box */}
          <div className="lg:col-span-2 bg-[#0B192C] rounded-2xl border border-slate-800 flex flex-col h-[650px] shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-[#07101C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Grand AI Company Radar & Lead Assistant
                  </h3>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Watchlist only; no live market source
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setChatMessages([
                    {
                      id: `msg-${Date.now()}`,
                      sender: 'ai',
                      text: 'এই Radar শুধু watchlist-এর তথ্য ব্যবহার করে; live market search সংযুক্ত নেই।',
                      timestamp: 'Just now',
                    },
                  ])
                }
                className="text-xs text-slate-500 hover:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-[#07101C] text-slate-200 border border-slate-800 rounded-tl-none space-y-3'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* If AI Suggested a Lead */}
                    {msg.suggestedLead && (
                      <div className="mt-3 p-3.5 bg-[#0B192C] border border-amber-500/30 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-amber-400 text-xs sm:text-sm">
                            🎯 {msg.suggestedLead.companyName}
                          </span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                            Watchlist candidate
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-300">
                          <p>
                            👤 <strong>কন্টাক্ট পারসন:</strong> {msg.suggestedLead.contactPerson || 'Not verified'}
                          </p>
                          {msg.suggestedLead.mobileNumber ? (
                            <p className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                              <Phone className="w-3 h-3 text-amber-400" />
                              <span>মোবাইল: {msg.suggestedLead.mobileNumber}</span>
                            </p>
                          ) : <p>মোবাইল: Not verified</p>}
                          <p>
                            💼 <strong>প্রস্তাবিত কাজ:</strong> {msg.suggestedLead.recommendedService}
                          </p>
                          {Number(msg.suggestedLead.estimatedBudget) > 0 && (
                            <p className="text-amber-400 font-bold">
                              💰 আনুমানিক বাজেট: ৳ {msg.suggestedLead.estimatedBudget?.toLocaleString()}/-
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                          <button
                            onClick={() => handleAddSuggestedLead(msg.suggestedLead!)}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Add this Lead to Pipeline (পাইপলাইনে যুক্ত করুন)</span>
                          </button>

                          {msg.suggestedLead.mobileNumber && (
                            <a
                              href={`tel:${msg.suggestedLead.mobileNumber}`}
                              className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold transition"
                              title="Call Contact Person"
                            >
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-[#07101C] p-3 rounded-2xl w-48 border border-slate-800">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>AI বিশ্লেষণ করছে...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompts Pills */}
            <div className="px-4 py-2 bg-[#07101C] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[10px] text-slate-500 shrink-0 font-medium">Quick Prompts:</span>
              <button
                onClick={() => handleSendMessage('BSRM কে মনিটর করো, চট্টগ্রামে তাদের নতুন কাজ আসলে জানাবে')}
                className="shrink-0 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-[11px] border border-slate-700 transition"
              >
                BSRM মনিটর করো
              </button>
              <button
                onClick={() => handleSendMessage('Walton ও Aarong-কে মনিটরে রাখো, বিলবোর্ড ও ইভেন্ট লিড দরকার')}
                className="shrink-0 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-[11px] border border-slate-700 transition"
              >
                Walton & Aarong মনিটরিং
              </button>
              <button
                onClick={() => handleSendMessage('Unilever Bangladesh-কে মনিটরে রাখো')}
                className="shrink-0 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-[11px] border border-slate-700 transition"
              >
                Unilever ক্যাম্পেইন
              </button>
              <button
                onClick={() => handleSendMessage('কোন কোন কোম্পানি এখন মনিটর করা হচ্ছে?')}
                className="shrink-0 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-[11px] border border-slate-700 transition"
              >
                মনিটর লিস্ট দেখাও
              </button>
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#07101C] border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="কোন কোম্পানি মনিটর করতে চান বা কাজের বিবরণ লিখুন (যেমন: BSRM কে মনিটর করো)..."
                className="flex-1 bg-[#0B192C] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold p-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Sidebar: Active Monitored Watchlist */}
          <div className="bg-[#0B192C] rounded-2xl border border-slate-800 p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Radar className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Active Watchlist ({monitoredCompanies.length})</h3>
                </div>
                <button
                  onClick={() => setIsMonitorModalOpen(true)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg transition"
                >
                  + Add Company
                </button>
              </div>

              <div className="mt-3 space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {monitoredCompanies.map((c) => (
                  <div key={c.id} className="p-3 bg-[#07101C] rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-black text-white">{c.companyName}</strong>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          c.status === 'Signal Detected'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">{c.focusArea}</p>

                    {(c.contactPerson || c.mobileNumber) && (
                      <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80 space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-400">
                          <User className="w-3 h-3 text-amber-400" />
                          <span>{c.contactPerson}</span>
                        </div>
                        {c.mobileNumber && (
                          <div className="flex items-center gap-1 font-mono text-amber-300 text-[10px]">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{c.mobileNumber}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-500">{c.lastChecked}</span>
                      <button
                        onClick={() =>
                          handleSendMessage(`${c.companyName} থেকে এখনই নতুন লিড বের করো`)
                        }
                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        Scan Signal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 space-y-1">
              <strong>💡 টিপস:</strong>
              <p className="text-slate-400">
                Watchlist-এর company খুঁজে candidate তৈরি করা যায়। Contact ও market signal নিজে যাচাই করুন; live search সক্রিয় নয়।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: MONITORED COMPANIES DIRECT RADAR ===================== */}
      {activeSubTab === 'radar' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radar className="w-4 h-4 text-amber-400" />
                <span>Live Corporate Watchlist</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                এখানে শুধু আপনার যোগ করা company থাকে; external signal বা live contact lookup নেই।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunFullMarketScan}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Monitoring Setup Required</span>
              </button>
              <button
                onClick={() => setIsMonitorModalOpen(true)}
                className="bg-[#07101C] hover:bg-slate-800 text-white border border-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Company to Monitor</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitoredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-[#0B192C] rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          company.status === 'Signal Detected'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : company.status === 'Monitoring'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {company.status}
                      </span>
                      <h3 className="font-black text-base text-white mt-2">{company.companyName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{company.industry}</p>
                    </div>

                    <button
                      onClick={() =>
                        setMonitoredCompanies(monitoredCompanies.filter((c) => c.id !== company.id))
                      }
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 p-3 bg-[#07101C] rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Monitoring Scope</span>
                    <p className="text-slate-200 font-medium leading-relaxed">{company.focusArea}</p>

                    <div className="pt-2 border-t border-slate-800/60 mt-2 space-y-1 text-slate-300">
                      <div><strong>Contact:</strong> {company.contactPerson}</div>
                      <div>Mobile: {company.mobileNumber} · WhatsApp: {company.whatsappNumber}</div>
                      <div>Email: {company.email}</div>
                      <div className="border-t border-slate-800 pt-1 mt-1"><strong>{company.executiveTitle}:</strong> {company.executiveName}</div>
                      <div>Mobile: {company.executiveMobileNumber} · WhatsApp: {company.executiveWhatsappNumber}</div>
                      <div>Email: {company.executiveEmail}</div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {company.sourceUrls?.map((source) => (
                          <a key={source} href={source} target="_blank" rel="noreferrer" className="text-amber-300 underline">Source</a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Last scanned: {company.lastChecked}</span>
                  <span className="text-[10px] text-slate-500">Background monitoring paused</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD / EDIT LEAD ===================== */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B192C] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-[#07101C] flex justify-between items-center">
              <h3 className="font-bold text-white text-base">
                {editingLead ? 'Edit Prospect / Lead' : 'Add New Prospect Lead'}
              </h3>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeadSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. BSRM, Walton, Aarong"
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Steel, Electronics, FMCG"
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Crucial: Contact Person Name & Mobile Number */}
              <div className="p-3.5 bg-[#07101C] rounded-xl border border-amber-500/30 space-y-3">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                  Contact Person & Phone Information (বাধ্যতামূলক)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Contact Person Name * ⭐
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Enter verified contact name"
                      className="w-full bg-[#0B192C] border border-amber-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Mobile Number * ⭐
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="e.g. 01XXXXXXXXX"
                      className="w-full bg-[#0B192C] border border-amber-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. client@company.com"
                      className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Location / City</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Chattogram, Dhaka"
                      className="w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#07101C] rounded-xl border border-slate-700 space-y-3">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">WhatsApp and CEO / Managing Director</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-slate-300">Contact WhatsApp *<input required type="text" inputMode="tel" value={formData.whatsappNumber || ''} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} className="mt-1 w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                  <label className="text-xs text-slate-300">CEO / MD Name *<input required type="text" value={formData.executiveName || ''} onChange={(e) => setFormData({ ...formData, executiveName: e.target.value })} className="mt-1 w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                  <label className="text-xs text-slate-300">CEO / MD Title *<input required type="text" value={formData.executiveTitle || ''} onChange={(e) => setFormData({ ...formData, executiveTitle: e.target.value })} placeholder="CEO or Managing Director" className="mt-1 w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                  <label className="text-xs text-slate-300">CEO / MD Mobile *<input required type="text" inputMode="tel" value={formData.executiveMobileNumber || ''} onChange={(e) => setFormData({ ...formData, executiveMobileNumber: e.target.value })} className="mt-1 w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                  <label className="text-xs text-slate-300">CEO / MD WhatsApp *<input required type="text" inputMode="tel" value={formData.executiveWhatsappNumber || ''} onChange={(e) => setFormData({ ...formData, executiveWhatsappNumber: e.target.value })} className="mt-1 w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                  <label className="text-xs text-slate-300">CEO / MD Email *<input required type="email" value={formData.executiveEmail || ''} onChange={(e) => setFormData({ ...formData, executiveEmail: e.target.value })} className="mt-1 w-full bg-[#0B192C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recommended Agency Service *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recommendedService}
                  onChange={(e) => setFormData({ ...formData, recommendedService: e.target.value })}
                  placeholder="e.g. Event Setup, 3D Neon Signboard, Highway Billboard, POSM"
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Est. Budget (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Won">Won</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Verified Opportunity / Context *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.triggerEvent}
                  onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
                  placeholder="e.g. New showroom opening in GEC circle next month..."
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Source URLs * (at least two HTTPS links)</label>
                <textarea rows={3} required value={(formData.sourceUrls || []).join('\n')} onChange={(e) => setFormData({ ...formData, sourceUrls: e.target.value.split(/\r?\n/).map((source) => source.trim()).filter(Boolean) })} placeholder="Official company page\nOfficial announcement or contact page" className="w-full bg-[#07101C] border border-slate-700 rounded-xl p-3 text-xs text-white" />
                <label className="flex items-start gap-2 text-xs text-slate-300">
                  <input type="checkbox" required checked={Boolean(formData.contactVerified)} onChange={(e) => setFormData({ ...formData, contactVerified: e.target.checked })} className="mt-0.5 accent-amber-500" />
                  I checked the contact details and opportunity against these sources.
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow hover:opacity-95"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD COMPANY TO MONITOR ===================== */}
      {isMonitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B192C] border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-[#07101C] flex justify-between items-center">
              <h3 className="font-bold text-white text-base">Add Company to AI Watchlist</h3>
              <button
                onClick={() => setIsMonitorModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMonitorSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={monitorForm.companyName}
                  onChange={(e) => setMonitorForm({ ...monitorForm, companyName: e.target.value })}
                  placeholder="e.g. Meghna Group, Berger Paints"
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Industry</label>
                <input
                  type="text"
                  value={monitorForm.industry}
                  onChange={(e) => setMonitorForm({ ...monitorForm, industry: e.target.value })}
                  placeholder="e.g. Paint & Chemical, Consumer Goods"
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Opportunity types / keywords *
                </label>
                <textarea
                  rows={2}
                  required
                  value={monitorForm.focusArea}
                  onChange={(e) => setMonitorForm({ ...monitorForm, focusArea: e.target.value })}
                  placeholder="e.g. নতুন আউটলেট ওপেনিং, ডিলার সামিট ইভেন্ট স্টেজ, আউটডোর বিলবোর্ড"
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={monitorForm.contactPerson}
                    onChange={(e) => setMonitorForm({ ...monitorForm, contactPerson: e.target.value })}
                    placeholder="e.g. Marketing Head"
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={monitorForm.mobileNumber}
                    onChange={(e) => setMonitorForm({ ...monitorForm, mobileNumber: e.target.value })}
                    placeholder="e.g. 01XXXXXXXXX"
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs text-slate-300">Contact WhatsApp *<input required type="text" inputMode="tel" value={monitorForm.whatsappNumber || ''} onChange={(e) => setMonitorForm({ ...monitorForm, whatsappNumber: e.target.value })} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                <label className="text-xs text-slate-300">Contact Email *<input required type="email" value={monitorForm.email || ''} onChange={(e) => setMonitorForm({ ...monitorForm, email: e.target.value })} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                <label className="text-xs text-slate-300">CEO / MD Name *<input required type="text" value={monitorForm.executiveName || ''} onChange={(e) => setMonitorForm({ ...monitorForm, executiveName: e.target.value })} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                <label className="text-xs text-slate-300">CEO / MD Title *<input required type="text" value={monitorForm.executiveTitle || ''} onChange={(e) => setMonitorForm({ ...monitorForm, executiveTitle: e.target.value })} placeholder="CEO or Managing Director" className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                <label className="text-xs text-slate-300">CEO / MD Mobile *<input required type="text" inputMode="tel" value={monitorForm.executiveMobileNumber || ''} onChange={(e) => setMonitorForm({ ...monitorForm, executiveMobileNumber: e.target.value })} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                <label className="text-xs text-slate-300">CEO / MD WhatsApp *<input required type="text" inputMode="tel" value={monitorForm.executiveWhatsappNumber || ''} onChange={(e) => setMonitorForm({ ...monitorForm, executiveWhatsappNumber: e.target.value })} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
                <label className="text-xs text-slate-300 sm:col-span-2">CEO / MD Email *<input required type="email" value={monitorForm.executiveEmail || ''} onChange={(e) => setMonitorForm({ ...monitorForm, executiveEmail: e.target.value })} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" /></label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Source URLs * (at least two HTTPS links)</label>
                <textarea rows={3} required value={(monitorForm.sourceUrls || []).join('\n')} onChange={(e) => setMonitorForm({ ...monitorForm, sourceUrls: e.target.value.split(/\r?\n/).map((source) => source.trim()).filter(Boolean) })} placeholder="Official company page\nOfficial leadership/contact page" className="w-full bg-[#07101C] border border-slate-700 rounded-xl p-3 text-xs text-white" />
                <label className="flex items-start gap-2 text-xs text-slate-300">
                  <input type="checkbox" required checked={Boolean(monitorForm.contactVerified)} onChange={(e) => setMonitorForm({ ...monitorForm, contactVerified: e.target.checked })} className="mt-0.5 accent-amber-500" />
                  I checked every contact detail against these sources.
                </label>
                <p className="text-[11px] text-amber-300">Profiles are saved in this browser. Background monitoring needs a server-side search provider and scheduler, which are not configured.</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMonitorModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow hover:bg-amber-400"
                >
                  Save Verified Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
