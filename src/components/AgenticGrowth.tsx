import React, { useState, useEffect, useRef } from 'react';
import { AIClientProspect, MonitoredCompany, ProspectChatMessage } from '../types';
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
        return JSON.parse(saved);
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
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        id: 'msg-1',
        sender: 'ai',
        text: 'আসসালামু আলাইকুম! আমি Grand CMS এআই লিড ও কোম্পানি মনিটরিং অ্যাসিস্ট্যান্ট।\n\nআপনি আমাকে যেকোনো কোম্পানি সম্পর্কে বলতে পারেন (যেমন: "BSRM কোম্পানিকে মনিটর করো, তাদের চট্টগ্রামে নতুন শো-রুম বা আউটডোর বিলবোর্ডের কাজ আসলে আমাকে লিড দিবে")। আমি সাথে সাথে কোম্পানিটিকে রাডারে যুক্ত করে নিয়মিত মনিটর করবো এবং কাজের সুযোগ আসলে কন্টাক্ট পারসনের নাম ও মোবাইল নাম্বার সহ হট লিড তৈরি করে দিবো!',
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
    email: '',
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
        email: '',
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
    if (!formData.companyName || !formData.contactPerson || !formData.mobileNumber) {
      alert('কোম্পানির নাম, কন্টাক্ট পারসনের নাম ও মোবাইল নাম্বার প্রদান করা আবশ্যক!');
      return;
    }

    const leadToSave: AIClientProspect = {
      id: editingLead ? editingLead.id : `p-${Date.now()}`,
      companyName: formData.companyName,
      industry: formData.industry || 'Corporate & Commercial',
      contactPerson: formData.contactPerson,
      mobileNumber: formData.mobileNumber,
      email: formData.email || '',
      location: formData.location || 'Chattogram',
      estimatedBudget: Number(formData.estimatedBudget) || 50000,
      recommendedService: formData.recommendedService || 'Brand Promotion & Display Setup',
      triggerEvent: formData.triggerEvent || 'Direct Market Outreach',
      priority: (formData.priority as any) || 'High',
      source: editingLead?.source || 'Manual',
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
    if (!monitorForm.companyName || !monitorForm.focusArea) {
      alert('কোম্পানির নাম ও কি বিষয়ে মনিটর করতে চান তা লিখুন!');
      return;
    }

    const newCompany: MonitoredCompany = {
      id: `mc-${Date.now()}`,
      companyName: monitorForm.companyName,
      industry: monitorForm.industry || 'General Industry',
      focusArea: monitorForm.focusArea,
      contactPerson: monitorForm.contactPerson || 'Brand / Procurement Manager',
      mobileNumber: monitorForm.mobileNumber || '01819-000000',
      status: 'Monitoring',
      lastChecked: 'Just added',
      signalNotes: 'Actively monitoring marketing budgets, events, and tender opportunities.',
    };

    setMonitoredCompanies([newCompany, ...monitoredCompanies]);
    setIsMonitorModalOpen(false);
    setScanNotice(`"${newCompany.companyName}" কে সফলভাবে মনিটরিং তালিকায় যুক্ত করা হয়েছে!`);
    setTimeout(() => setScanNotice(null), 3000);
  };

  // Intelligent Chat Processor
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
    setInputMessage('');
    setIsTyping(true);

    // AI Analysis Simulation
    setTimeout(() => {
      const lower = query.toLowerCase();

      // Extract Company Name logic
      let detectedCompany = '';
      let detectedIndustry = 'Corporate & Industrial';
      let detectedFocus = 'Showroom branding, events, and billboard expansion';
      let suggestedPerson = 'Tanvir Rahman (Brand & Marketing Lead)';
      let suggestedMobile = '01819-554210';
      let suggestedBudget = 250000;
      let suggestedService = 'Showroom 3D Neon Signboard & Event Stage Setup';

      if (lower.includes('bsrm') || lower.includes('স্টিল')) {
        detectedCompany = 'BSRM Steels Ltd.';
        detectedIndustry = 'Steel & Heavy Manufacturing';
        detectedFocus = 'New factory inauguration, regional dealer meet, highway billboards';
        suggestedPerson = 'Engr. Sharif Ahmed (DGM Brand)';
        suggestedMobile = '01819-335128';
        suggestedBudget = 350000;
        suggestedService = 'Dealer Meet Stage Fabrication & Highway Billboards';
      } else if (lower.includes('walton') || lower.includes('ওয়ালটন')) {
        detectedCompany = 'Walton Hi-Tech Regional Hub';
        detectedIndustry = 'Electronics & Home Appliances';
        detectedFocus = 'Showroom renovation, POSM stands, festive outdoor campaign';
        suggestedPerson = 'Tanvir Hossain (Regional Incharge)';
        suggestedMobile = '01914-772391';
        suggestedBudget = 220000;
        suggestedService = 'Acrylic 3D Neon Signboard & Promotional Display Booth';
      } else if (lower.includes('aarong') || lower.includes('আড়ং')) {
        detectedCompany = 'Aarong Chattogram';
        detectedIndustry = 'Lifestyle & Fashion Retail';
        detectedFocus = 'Seasonal collection window display, mall kiosks, festive branding';
        suggestedPerson = 'Nasrin Sultana (Marketing Exec)';
        suggestedMobile = '01712-449102';
        suggestedBudget = 180000;
        suggestedService = 'Seasonal Window Display & Acrylic Exhibition Kiosk';
      } else if (lower.includes('unilever') || lower.includes('ইউনিলিভার')) {
        detectedCompany = 'Unilever Bangladesh Supply Hub';
        detectedIndustry = 'FMCG & Consumer Goods';
        detectedFocus = 'Trade marketing, retailer branding, experiential activation';
        suggestedPerson = 'Fahim Morshed (Trade Marketing Manager)';
        suggestedMobile = '01713-908124';
        suggestedBudget = 400000;
        suggestedService = 'Retailer POSM Unit & Regional Activation Setup';
      } else if (lower.includes('pran') || lower.includes('প্রাণ')) {
        detectedCompany = 'PRAN-RFL Group Regional Depot';
        detectedIndustry = 'Food & Beverage / Plastics';
        detectedFocus = 'Dealer points outdoor signboards, event sponsorship banners';
        suggestedPerson = 'Mizanur Rahman (Territory Manager)';
        suggestedMobile = '01811-447890';
        suggestedBudget = 280000;
        suggestedService = 'Outdoor Glow Signboards & Event Branding Setup';
      } else if (lower.includes('akij') || lower.includes('আকিজ')) {
        detectedCompany = 'Akij Ceramics Regional Depot';
        detectedIndustry = 'Ceramics & Building Materials';
        detectedFocus = 'Dealer conference booth setup & outdoor billboards';
        suggestedPerson = 'Moniruzzaman (Regional Sales Head)';
        suggestedMobile = '01711-884920';
        suggestedBudget = 190000;
        suggestedService = 'Conference Stage Fabrication & Outdoor Billboards';
      } else {
        // Try extracting words
        const cleaned = query
          .replace(/(মনিটর করো|monitor|করো|কে|এর|company|কোম্পানি|লিড|দাও|চাই|রাখো)/gi, '')
          .trim();
        detectedCompany = cleaned.length > 2 ? cleaned.split(/[\s,]+/)[0] + ' Corporate' : 'Target Corporate Client';
        detectedFocus = query;
      }

      // Check if user is asking for list
      if (lower.includes('কোন কোন') || lower.includes('লিস্ট') || lower.includes('list') || lower.includes('কারা আছে')) {
        const listText = monitoredCompanies.map((c, i) => `${i + 1}. **${c.companyName}** (${c.status}) - ${c.focusArea}`).join('\n');
        const reply: ProspectChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `বর্তমানে আপনি নিম্নলিখিত কোম্পানিগুলোকে মনিটরিং তালিকায় রেখেছেন:\n\n${listText}\n\nনতুন কোনো কোম্পানি মনিটর করতে চাইলে কোম্পানির নাম লিখে জানান!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, reply]);
        setIsTyping(false);
        return;
      }

      // If monitoring a company, add to MonitoredCompanies list
      const alreadyMonitored = monitoredCompanies.find((c) =>
        c.companyName.toLowerCase().includes(detectedCompany.toLowerCase())
      );

      let newMonitored: MonitoredCompany;
      if (!alreadyMonitored) {
        newMonitored = {
          id: `mc-${Date.now()}`,
          companyName: detectedCompany,
          industry: detectedIndustry,
          focusArea: detectedFocus,
          contactPerson: suggestedPerson,
          mobileNumber: suggestedMobile,
          status: 'Signal Detected',
          lastChecked: 'Just now',
          signalNotes: `User instructed surveillance: ${query}`,
        };
        setMonitoredCompanies((prev) => [newMonitored, ...prev]);
      } else {
        newMonitored = alreadyMonitored;
      }

      // Prepare Lead Proposal
      const generatedLead: AIClientProspect = {
        id: `p-${Date.now()}`,
        companyName: detectedCompany,
        industry: detectedIndustry,
        contactPerson: suggestedPerson,
        mobileNumber: suggestedMobile,
        email: `contact@${detectedCompany.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        location: 'Chattogram, Bangladesh',
        estimatedBudget: suggestedBudget,
        recommendedService: suggestedService,
        triggerEvent: `নতুন প্রজেক্ট সিগন্যাল: ${detectedFocus}`,
        priority: 'High',
        source: 'AI Radar',
        status: 'New Lead',
        createdAt: new Date().toISOString().split('T')[0],
      };

      const aiReply: ProspectChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: `✅ **${detectedCompany}** কোম্পানিকে সফলভাবে আপনার **AI Radar & Watchlist**-এ যুক্ত ও স্ক্যান করা হয়েছে!\n\nআমরা তাদের সাম্প্রতিক বিজ্ঞাপন ও ব্র্যান্ডিং সিগন্যাল ডিটেক্ট করেছি। সরাসরি যোগাযোগ করার জন্য কন্টাক্ট পারসন ও মোবাইল নাম্বার সহ একটি নতুন লিড প্রস্তুত করা হয়েছে:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedLead: generatedLead,
        monitoredCompany: newMonitored,
      };

      setChatMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 900);
  };

  // Add suggested lead to pipeline
  const handleAddSuggestedLead = (lead: Partial<AIClientProspect>) => {
    if (!lead || !lead.companyName || !lead.contactPerson || !lead.mobileNumber) return;

    const fullLead: AIClientProspect = {
      id: lead.id || `p-${Date.now()}`,
      companyName: lead.companyName,
      industry: lead.industry || 'Corporate',
      contactPerson: lead.contactPerson,
      mobileNumber: lead.mobileNumber,
      email: lead.email || '',
      location: lead.location || 'Chattogram',
      estimatedBudget: lead.estimatedBudget || 100000,
      recommendedService: lead.recommendedService || 'Brand Setup & Display',
      triggerEvent: lead.triggerEvent || 'Identified via AI Radar',
      priority: lead.priority || 'High',
      source: 'AI Radar',
      status: 'New Lead',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (onSaveProspect) {
      onSaveProspect(fullLead);
      setScanNotice(`"${fullLead.companyName}" লিড পাইপলাইনে সফলভাবে যুক্ত হয়েছে!`);
      setTimeout(() => setScanNotice(null), 3500);
    }
  };

  // Trigger full market scan
  const handleRunFullMarketScan = () => {
    setScanNotice('AI বাজার ও মনিটর করা কোম্পানিগুলোর সাম্প্রতিক ব্র্যান্ডিং কাজের সিগন্যাল স্ক্যান করছে...');
    setTimeout(() => {
      // Find a company not in prospects or generate fresh lead
      const freshLeads: AIClientProspect[] = [
        {
          id: `p-${Date.now()}-1`,
          companyName: 'BSRM Steels Ltd. (Agrabad)',
          industry: 'Manufacturing & Steel',
          contactPerson: 'Sharif Ahmed (Brand Lead)',
          mobileNumber: '01819-335128',
          email: 'sharif.ahmed@bsrm.com',
          location: 'Agrabad C/A, Chattogram',
          estimatedBudget: 350000,
          recommendedService: 'New Regional Center Neon Fascia & Billboard',
          triggerEvent: 'Expanding 2 new distribution hubs in Chattogram division',
          priority: 'High',
          source: 'AI Radar',
          status: 'New Lead',
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: `p-${Date.now()}-2`,
          companyName: 'Aarong Lifestyle Chattogram',
          industry: 'Fashion & Retail',
          contactPerson: 'Nasrin Sultana (Marketing Exec)',
          mobileNumber: '01712-449102',
          email: 'nasrin.ctg@aarong.com',
          location: 'Sholoshohor, Chattogram',
          estimatedBudget: 175000,
          recommendedService: 'Autumn Festive Display & Mall Kiosk Setup',
          triggerEvent: 'Autumn season campaign window fabrication roll-out',
          priority: 'Medium',
          source: 'AI Radar',
          status: 'New Lead',
          createdAt: new Date().toISOString().split('T')[0],
        },
      ];

      if (onSaveProspect) {
        freshLeads.forEach((l) => onSaveProspect(l));
      }
      setScanNotice('✅ স্ক্যান সম্পন্ন! মনিটর করা কোম্পানিগুলো থেকে ২টি নতুন লিড পাইপলাইনে যোগ করা হয়েছে!');
      setTimeout(() => setScanNotice(null), 4000);
    }, 1500);
  };

  // Filtered Prospects
  const filteredProspects = prospects.filter((p) => {
    const matchesSearch =
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recommendedService.toLowerCase().includes(searchQuery.toLowerCase());

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
            <span>AI Radar Scan Now</span>
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
          <span>All Leads Pipeline ({prospects.length})</span>
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

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lead.mobileNumber}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${lead.mobileNumber}`}
                        className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-md text-[10px] font-bold flex items-center gap-1 transition"
                        title="Direct Phone Call"
                      >
                        <Phone className="w-2.5 h-2.5" /> Call
                      </a>
                      <a
                        href={`https://wa.me/88${lead.mobileNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-md text-[10px] font-bold flex items-center gap-1 transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-2.5 h-2.5" /> WA
                      </a>
                    </div>
                  </div>
                </div>

                {/* Scope & Budget Details */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Est. Budget:</span>
                    <span className="font-black text-amber-400 text-sm">৳ {lead.estimatedBudget.toLocaleString()}/-</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Recommended Service:</span>
                    <span className="text-xs text-slate-200 font-semibold">{lead.recommendedService}</span>
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
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Market Surveillance Active
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setChatMessages([
                    {
                      id: `msg-${Date.now()}`,
                      sender: 'ai',
                      text: 'চ্যাট ক্লিয়ার করা হয়েছে। নতুন কোম্পানি মনিটরিং করতে নাম ও কাজের বিবরণ লিখে মেসেজ পাঠান!',
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
                            Hot Lead
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-300">
                          <p>
                            👤 <strong>কন্টাক্ট পারসন:</strong> {msg.suggestedLead.contactPerson}
                          </p>
                          <p className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>মোবাইল: {msg.suggestedLead.mobileNumber}</span>
                          </p>
                          <p>
                            💼 <strong>প্রস্তাবিত কাজ:</strong> {msg.suggestedLead.recommendedService}
                          </p>
                          <p className="text-amber-400 font-bold">
                            💰 আনুমানিক বাজেট: ৳ {msg.suggestedLead.estimatedBudget?.toLocaleString()}/-
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                          <button
                            onClick={() => handleAddSuggestedLead(msg.suggestedLead!)}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Add this Lead to Pipeline (পাইপলাইনে যুক্ত করুন)</span>
                          </button>

                          <a
                            href={`tel:${msg.suggestedLead.mobileNumber}`}
                            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold transition"
                            title="Call Contact Person"
                          >
                            Call
                          </a>
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

                    {c.contactPerson && (
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
                চ্যাটে আপনি যেকোনো কোম্পানির নাম লিখলেই এআই সেটিকে মনিটরিং তালিকায় যুক্ত করবে এবং লিড আসলে স্বয়ংক্রিয়ভাবে নোটিফাই করবে।
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
                যে সকল কোম্পানির কাজের সুযোগ আসলে এআই আপনাকে অগ্রাধিকার ভিত্তিতে লিড সরবরাহ করবে।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunFullMarketScan}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Scan All Companies</span>
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
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
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

                    {company.contactPerson && (
                      <div className="pt-2 border-t border-slate-800/60 mt-2 space-y-1 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span><strong>Contact:</strong> {company.contactPerson}</span>
                        </div>
                        {company.mobileNumber && (
                          <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{company.mobileNumber}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Last scanned: {company.lastChecked}</span>
                  <button
                    onClick={() => {
                      setActiveSubTab('chat');
                      handleSendMessage(`${company.companyName} থেকে নতুন কোনো লিড বা কাজের সুযোগ আছে কি?`);
                    }}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold text-xs"
                  >
                    <span>Check Signals</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
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
                      placeholder="e.g. Sharif Ahmed (Brand Lead)"
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
                      placeholder="e.g. 01819-335128"
                      className="w-full bg-[#0B192C] border border-amber-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Email (Optional)</label>
                    <input
                      type="email"
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
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Est. Budget (৳) *</label>
                  <input
                    type="number"
                    required
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
                  Trigger Event / Context
                </label>
                <textarea
                  rows={2}
                  value={formData.triggerEvent}
                  onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
                  placeholder="e.g. New showroom opening in GEC circle next month..."
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
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
          <div className="bg-[#0B192C] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-[#07101C] flex justify-between items-center">
              <h3 className="font-bold text-white text-base">Add Company to AI Watchlist</h3>
              <button
                onClick={() => setIsMonitorModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMonitorSubmit} className="p-5 space-y-4">
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
                  What should AI monitor for? (কাজের ধরন) *
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
                    value={monitorForm.mobileNumber}
                    onChange={(e) => setMonitorForm({ ...monitorForm, mobileNumber: e.target.value })}
                    placeholder="e.g. 01819-xxxxxx"
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
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
                  Start Monitoring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
