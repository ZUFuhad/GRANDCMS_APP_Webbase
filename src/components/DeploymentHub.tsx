import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabase';
import { loadStorageData, syncAllLocalToSupabase, hydrateStorageData } from '../services/storage';
import {
  Database,
  Globe,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Code2,
  Sparkles,
  ShieldCheck,
  Key,
  RefreshCw,
  AlertCircle,
  Server,
  Zap,
  CheckCircle2,
  FolderArchive,
  ArrowRight,
  CloudUpload,
  Lock,
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const SUPABASE_PROJECT_ID = 'grwtylyqwxoqadwlzqkl';
const SUPABASE_DEFAULT_URL = 'https://grwtylyqwxoqadwlzqkl.supabase.co';
const GITHUB_REPO_URL = 'https://github.com/ZUFuhad/GRANDCMS_APP_Webbase';

const SUPABASE_SQL = `-- ==========================================================
-- GRAND CMS - Supabase (PostgreSQL) Database Schema & Seed Data
-- Agency: GRAND Communication & Marketing (EST. 2004)
-- Address: 20 No Shop CDA Market, Kazir Dewri, Chattogram
-- Target Project ID: grwtylyqwxoqadwlzqkl
-- Dashboard: https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl
-- SQL Editor: https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl/sql
-- ==========================================================

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  contact_person TEXT,
  designation TEXT,
  trade_license TEXT,
  total_billed NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  current_due NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  bank_details TEXT,
  total_purchased NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  payable_liability NUMERIC DEFAULT 0,
  credit_term_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotation_number TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  date TEXT NOT NULL,
  validity_date TEXT,
  subject TEXT NOT NULL,
  items_json JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  agency_commission_percent NUMERIC DEFAULT 10,
  agency_commission_amount NUMERIC DEFAULT 0,
  vat_percent NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  advance NUMERIC DEFAULT 0,
  due NUMERIC NOT NULL,
  nb_text TEXT,
  terms_json JSONB DEFAULT '[]'::jsonb,
  signatory_name TEXT,
  signatory_title TEXT,
  signatory_phone TEXT,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  quotation_id TEXT,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  date TEXT NOT NULL,
  due_date TEXT,
  subject TEXT NOT NULL,
  items_json JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  agency_commission_amount NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  advance NUMERIC DEFAULT 0,
  due NUMERIC NOT NULL,
  payments_json JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Due',
  signatory_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  quotation_id TEXT,
  invoice_id TEXT,
  event_date TEXT NOT NULL,
  print_clearance_deadline TEXT NOT NULL,
  installation_deadline TEXT NOT NULL,
  status TEXT DEFAULT 'Planning',
  priority TEXT DEFAULT 'Medium',
  location TEXT,
  assigned_team_json JSONB DEFAULT '[]'::jsonb,
  checklist_json JSONB DEFAULT '[]'::jsonb,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  project_id TEXT,
  supplier_id TEXT,
  supplier_name TEXT,
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  due_date TEXT,
  payment_method TEXT,
  recorded_by TEXT,
  receipt_number TEXT
);

-- 7. Financial Liabilities Table
CREATE TABLE IF NOT EXISTS financial_liabilities (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_liability NUMERIC NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'Upcoming',
  notes TEXT
);

-- 8. Disable Row Level Security (RLS) so the app can read/write with anon key
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_liabilities DISABLE ROW LEVEL SECURITY;

-- 9. Initial Seed Data (Safe Upsert)
INSERT INTO clients (id, name, company_name, email, phone, address, city, contact_person, designation, total_billed, total_paid, current_due, status)
VALUES 
('cli-whiz', 'Whiz Communication', 'Whiz Communication Ltd.', 'events@whizcomm.com.bd', '+880 1711 987654', 'Finlay Square, 6th Floor, GEC Circle', 'Chattogram', 'Tanvir Hossain', 'Head of Brand Operations', 178200, 80000, 98200, 'active'),
('cli-apex', 'Apex Footwear Chittagong', 'Apex Holdings Ltd.', 'ctg.retail@apexfootwear.com', '+880 1819 445566', 'Agrabad Commercial Area', 'Chattogram', 'Zakir Ahmed', 'Regional Retail Coordinator', 245000, 200000, 45000, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, company_name, category, phone, email, address, total_purchased, total_paid, payable_liability, credit_term_days, status)
VALUES
('sup-chittagong-media', 'Bengal PVC & Flex House', 'Bengal Media Imports Ltd.', 'PVC & Media', '+880 1819 998877', 'bengalmedia.ctg@gmail.com', 'Khatungonj, Chattogram', 195000, 145000, 50000, 30, 'active'),
('sup-royal-wood', 'Royal Garjan Timber & Carpentry', 'Royal Wood & Hardware Mart', 'Wood & Timber', '+880 1817 223344', 'royalwood.dewri@gmail.com', 'Dewanhat, Chattogram', 88000, 65000, 23000, 15, 'active')
ON CONFLICT (id) DO NOTHING;
`;

export const DeploymentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'github' | 'vercel' | 'netlify'>('supabase');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Supabase states
  const initialConfig = SupabaseService.getConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url || SUPABASE_DEFAULT_URL);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialConfig.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    // If credentials already exist, run a silent connection test
    if (initialConfig.anonKey) {
      SupabaseService.testConnection().then((res) => {
        setConnectionStatus({
          tested: true,
          success: res.success,
          message: res.message,
        });
      });
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSaveCredentials = () => {
    SupabaseService.setCredentials(supabaseUrl, supabaseAnonKey);
    const updated = SupabaseService.getConfig();
    setSupabaseUrl(updated.url);
    handleTestConnection();
  };

  const handleResetToOfficial = () => {
    SupabaseService.resetToDefaultCredentials();
    const updated = SupabaseService.getConfig();
    setSupabaseUrl(updated.url);
    setSupabaseAnonKey(updated.anonKey);
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    SupabaseService.setCredentials(supabaseUrl, supabaseAnonKey);
    const updated = SupabaseService.getConfig();
    setSupabaseUrl(updated.url);
    const result = await SupabaseService.testConnection();
    setConnectionStatus({
      tested: true,
      success: result.success,
      message: result.message,
    });
    setIsTesting(false);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      SupabaseService.setCredentials(supabaseUrl, supabaseAnonKey);
      const current = loadStorageData();
      const results = await syncAllLocalToSupabase(current);
      setSyncMessage(
        `Successfully synced ${results.quotations || 0} quotations, ${results.invoices || 0} invoices, ${results.clients || 0} clients, ${results.projects || 0} projects to Supabase!`
      );
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grand_cms_supabase_schema_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B192C] rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Database & GitHub Cloud Hub</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Supabase Linked
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Connect GRAND CMS directly to your Supabase PostgreSQL database project (<code className="text-emerald-400 font-mono">{SUPABASE_PROJECT_ID}</code>) & synchronize with GitHub.
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 bg-[#07101C] px-4 py-2 rounded-xl border border-slate-700/80">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus.tested && connectionStatus.success
                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse'
                : connectionStatus.tested && !connectionStatus.success
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-xs font-bold text-slate-200">
            {connectionStatus.tested && connectionStatus.success
              ? 'Database: Connected Live'
              : connectionStatus.tested && !connectionStatus.success
              ? 'Database: Connection Required'
              : 'Database: Local Cache Active'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'supabase'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'bg-[#0B192C] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Supabase PostgreSQL</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'github'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-[#0B192C] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GithubIcon className="w-4 h-4 text-white" />
          <span>GitHub Repository</span>
        </button>

        <button
          onClick={() => setActiveTab('vercel')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vercel'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-[#0B192C] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Vercel Deploy</span>
        </button>

        <button
          onClick={() => setActiveTab('netlify')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'netlify'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-[#0B192C] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Netlify Deploy</span>
        </button>
      </div>

      {/* --- TAB 1: SUPABASE --- */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Connection Settings Card */}
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>Supabase API Credentials & Live Link</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Project Ref:{' '}
                  <span className="font-mono font-bold text-amber-400">{SUPABASE_PROJECT_ID}</span>{' '}
                  &bull; Direct Dashboard:{' '}
                  <a
                    href="https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Open Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSql}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SQL</span>
                </button>
                <button
                  onClick={() => handleCopy(SUPABASE_SQL, 'top-sql')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  {copiedCode === 'top-sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'top-sql' ? 'Copied SQL!' : 'Copy Schema'}</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://grwtylyqwxoqadwlzqkl.supabase.co"
                  className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Supabase Anon / Publishable Public Key *
                  </label>
                  <a
                    href="https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Find Anon Key in Supabase API <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-[#07101C] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 pr-16 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-2 px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded font-semibold cursor-pointer"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>

                <button
                  onClick={handleSaveCredentials}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Credentials</span>
                </button>

                <button
                  onClick={handleResetToOfficial}
                  className="px-4 py-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-600/50"
                  title="Reset to official Grand CMS Supabase Project (grwtylyqwxoqadwlzqkl)"
                >
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Connect Official Supabase</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  title="Upload all local quotations, invoices, clients, projects into Supabase tables"
                >
                  <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Local Data to Supabase'}</span>
                </button>
              </div>
            </div>

            {/* Connection Test Result Badge */}
            {connectionStatus.tested && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                  connectionStatus.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                {connectionStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{connectionStatus.message}</p>
                  {!connectionStatus.success && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tip: Open your{' '}
                      <a
                        href="https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl/sql"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 underline font-bold"
                      >
                        Supabase SQL Editor
                      </a>
                      , paste the schema below, and click <strong>Run</strong>. Then paste your{' '}
                      <a
                        href="https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl/settings/api"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 underline font-bold"
                      >
                        Anon Key
                      </a>{' '}
                      above.
                    </p>
                  )}
                </div>
              </div>
            )}

            {syncMessage && (
              <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl text-blue-300 text-xs font-semibold">
                {syncMessage}
              </div>
            )}
          </div>

          {/* Step by step guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs mb-2">
                  ১
                </span>
                <h4 className="font-bold text-white text-xs mb-1">SQL Editor এ টেবিল তৈরি করুন</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Supabase Dashboard &gt; SQL Editor এ যান। নিচের SQL স্ক্রিপ্টটি পেস্ট করে "RUN" চাপুন।
                </p>
              </div>
              <a
                href="https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl/sql"
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-emerald-400 text-xs font-bold hover:underline inline-flex items-center gap-1"
              >
                Open SQL Editor <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs mb-2">
                  ২
                </span>
                <h4 className="font-bold text-white text-xs mb-1">Anon Key কপি করুন</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Supabase Settings &gt; API থেকে <strong className="text-emerald-400">anon public key</strong> টি কপি করে আনুন।
                </p>
              </div>
              <a
                href="https://supabase.com/dashboard/project/grwtylyqwxoqadwlzqkl/settings/api"
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-emerald-400 text-xs font-bold hover:underline inline-flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs mb-2">
                  ৩
                </span>
                <h4 className="font-bold text-white text-xs mb-1">Test & Sync</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Key পেস্ট করে <strong>"Test Connection"</strong> দিন এবং <strong>"Sync Local Data"</strong> চাপলেই লাইভ ডাটাবেজ লিংক সম্পন্ন হবে।
                </p>
              </div>
              <button
                onClick={handleTestConnection}
                className="mt-3 text-emerald-400 text-xs font-bold hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
              >
                Test Connection Now <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* SQL Preview Box */}
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Supabase PostgreSQL Schema (supabase_schema.sql):</span>
              </span>
              <button
                onClick={() => handleCopy(SUPABASE_SQL, 'preview-sql')}
                className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'preview-sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'preview-sql' ? 'Copied Full SQL!' : 'Copy All SQL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-[#07101C] rounded-xl border border-slate-800 text-xs font-mono text-emerald-400/90 max-h-72 overflow-y-auto leading-relaxed shadow-inner">
              {SUPABASE_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* --- TAB 2: GITHUB REPO --- */}
      {activeTab === 'github' && (
        <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GithubIcon className="w-5 h-5 text-white" />
                <span>GitHub Repository Link & Commands</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Repository:{' '}
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  {GITHUB_REPO_URL} <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Open in GitHub</span>
            </a>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Git Push & Sync Commands:
            </h4>
            <pre className="p-4 bg-[#07101C] rounded-xl border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed shadow-inner">
{`# 1. Clone or pull latest
git remote add origin https://github.com/ZUFuhad/GRANDCMS_APP_Webbase.git
git fetch origin
git branch -M main

# 2. Stage all modifications (Workflow, Supabase, Quotations, Project Scheduling)
git add .
git commit -m "feat: complete approve-to-project & done-to-invoice workflow + supabase linked"

# 3. Push to main branch
git push -u origin main`}
            </pre>

            <button
              onClick={() =>
                handleCopy(
                  `git remote add origin https://github.com/ZUFuhad/GRANDCMS_APP_Webbase.git\ngit branch -M main\ngit add .\ngit commit -m "feat: complete approve-to-project & done-to-invoice workflow + supabase linked"\ngit push -u origin main`,
                  'git-cmds'
                )
              }
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              {copiedCode === 'git-cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'git-cmds' ? 'Commands Copied!' : 'Copy Git Commands'}</span>
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: VERCEL DEPLOY --- */}
      {activeTab === 'vercel' && (
        <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <span>Deploy to Vercel with Supabase</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target URL:{' '}
                <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-amber-400 font-bold hover:underline">
                  https://vercel.com/new
                </a>
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#07101C] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white">Environment Variables in Vercel:</p>
            <div className="font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400 text-xs">
              VITE_SUPABASE_URL = {supabaseUrl}
              <br />
              VITE_SUPABASE_PUBLISHABLE_KEY = {supabaseAnonKey || 'your-supabase-anon-key'}
            </div>
            <p className="text-slate-400 text-[11px]">
              Import repository <code className="text-amber-400 font-mono">ZUFuhad/GRANDCMS_APP_Webbase</code> into Vercel and add the above two environment variables in Settings &gt; Environment Variables.
            </p>
          </div>
        </div>
      )}

      {/* --- TAB 4: NETLIFY DEPLOY --- */}
      {activeTab === 'netlify' && (
        <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span>Deploy to Netlify</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target URL:{' '}
                <a href="https://app.netlify.com/" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">
                  https://app.netlify.com/
                </a>
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#07101C] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white">Netlify Environment Variables:</p>
            <div className="font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-400 text-xs">
              VITE_SUPABASE_URL = {supabaseUrl}
              <br />
              VITE_SUPABASE_PUBLISHABLE_KEY = {supabaseAnonKey || 'your-supabase-anon-key'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentHub;
