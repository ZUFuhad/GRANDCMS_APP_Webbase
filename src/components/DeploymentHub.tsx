import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import {
  CloudUpload,
  Database,
  Globe,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Code2,
  Layers,
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
} from 'lucide-react';

const SUPABASE_SQL = `-- ==========================================================
-- GRAND CMS - Supabase (PostgreSQL) Database Schema & Seed Data
-- Agency: GRAND Communication & Marketing (EST. 2004)
-- Address: 20 No Shop CDA Market, Kazir Dewri, Chattogram
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
  quotation_id TEXT,
  invoice_id TEXT,
  event_date TEXT NOT NULL,
  print_clearance_deadline TEXT NOT NULL,
  installation_deadline TEXT NOT NULL,
  status TEXT DEFAULT 'Planning',
  priority TEXT DEFAULT 'Medium',
  location TEXT,
  assigned_team_json JSONB DEFAULT '[]'::jsonb,
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

-- Disable Row Level Security (RLS) for smooth anon access
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_liabilities DISABLE ROW LEVEL SECURITY;

-- Initial Seed Data
INSERT INTO clients (id, name, company_name, email, phone, address, city, contact_person, designation, total_billed, total_paid, current_due, status)
VALUES 
('cli-whiz', 'Whiz Communication', 'Whiz Communication Ltd.', 'events@whizcomm.com.bd', '+880 1711 987654', 'Finlay Square, 6th Floor, GEC Circle', 'Chattogram', 'Tanvir Hossain', 'Head of Brand Operations', 178200, 80000, 98200, 'active'),
('cli-apex', 'Apex Footwear Chittagong', 'Apex Holdings Ltd.', 'ctg.retail@apexfootwear.com', '+880 1819 445566', 'Agrabad Commercial Area', 'Chattogram', 'Zakir Ahmed', 'Regional Retail Coordinator', 245000, 200000, 45000, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, company_name, category, phone, email, address, total_purchased, total_paid, payable_liability, credit_term_days, status)
VALUES
('sup-chittagong-media', 'Bengal PVC & Flex House', 'Bengal Media Imports Ltd.', 'PVC & Media', '+880 1819 998877', 'bengalmedia.ctg@gmail.com', 'Khatungonj, Chattogram', 195000, 145000, 50000, 30, 'active'),
('sup-royal-wood', 'Royal Garjan Timber & Carpentry', 'Royal Wood & Hardware Mart', 'Wood & Timber', '+880 1817 223344', 'royalwood.dewri@gmail.com', 'Dewanhat, Chattogram', 88000, 65000, 23000, 15, 'active')
ON CONFLICT (id) DO NOTHING;`;

export const DeploymentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vercel' | 'cloudflare-pages' | 'netlify' | 'supabase' | 'github' | 'cloudflare'>('vercel');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Supabase states
  const initialConfig = SupabaseService.getConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialConfig.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const config = SupabaseService.getConfig();
    setSupabaseUrl(config.url);
    setSupabaseAnonKey(config.anonKey);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveSupabase = () => {
    SupabaseService.setCredentials(supabaseUrl, supabaseAnonKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    SupabaseService.setCredentials(supabaseUrl, supabaseAnonKey);
    const result = await SupabaseService.testConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const d1Sql = StorageService.generateCloudflareD1Sql();

  const handleDownloadD1Sql = () => {
    const blob = new Blob([d1Sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grand_cms_cloudflare_d1_schema_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSupabaseSql = () => {
    const blob = new Blob([SUPABASE_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grand_cms_supabase_schema_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDistZip = () => {
    const a = document.createElement('a');
    a.href = '/grand-cms-dist.zip';
    a.download = 'grand-cms-dist.zip';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadProjectZip = () => {
    const a = document.createElement('a');
    a.href = '/grand-cms-project.zip';
    a.download = 'grand-cms-project.zip';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSql = handleDownloadD1Sql;

  const gitCommands = `# 1. Initialize git repository
git init

# 2. Add all source files, configurations, and Netlify/Cloudflare assets
git add .

# 3. Commit with detailed Grand CMS architecture
git commit -m "feat: complete Grand CMS enterprise ERP for Grand Communication & Marketing"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/grand-cms.git

# 6. Push to GitHub
git push -u origin main`;

  const cloudflareCommands = `# 1. Login to Cloudflare via Wrangler CLI
npx wrangler login

# 2. Create the Cloudflare D1 SQL Database
npx wrangler d1 create grand-cms-db

# 3. Paste the generated database_id into wrangler.toml

# 4. Initialize schema and seed data into Cloudflare D1
npx wrangler d1 execute grand-cms-db --file=./schema.sql

# 5. (Optional) Run locally with D1 binding
npx wrangler dev`;

  const vercelSteps = `# ==========================================================
# Method A: Vercel Web Dashboard (1-Click & Recommended)
# ==========================================================
1. Open https://vercel.com and Sign In with your GitHub account.
2. Click the "Add New..." button -> Select "Project".
3. Under "Import Git Repository", find your repo ("grand-cms") and click "Import".
4. Vercel automatically detects Vite:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: dist
5. Click "Deploy".
6. In about 30 seconds, your site will be live with a free *.vercel.app link & SSL!

# ==========================================================
# Method B: Vercel CLI (Deploy in 1 Command from Terminal)
# ==========================================================
npm install -g vercel
vercel login
vercel --prod`;

  const cloudflarePagesSteps = `# ==========================================================
# Option A: Direct Drag & Drop (NO GIT NEEDED! 🚀)
# ==========================================================
1. Click the "Download Ready dist.zip" button above.
2. Extract the grand-cms-dist.zip file to get the "dist" folder.
3. Open https://dash.cloudflare.com/
4. Navigate to "Workers & Pages" -> "Create application" -> "Pages" tab.
5. Click "Upload assets".
6. Enter Project name: "grand-cms" and click "Create project".
7. Drag and drop the "dist" folder directly into the browser box.
8. Click "Deploy site" — Your site is live at https://grand-cms.pages.dev!

# ==========================================================
# Option B: Connect to GitHub (Continuous Deployment)
# ==========================================================
1. In Cloudflare Pages, choose "Connect to Git" -> select your repository.
2. Framework preset: Select "Vite"
3. Build command: npm run build
4. Build output directory: dist
5. Click "Save and Deploy".`;

  const netlifySteps = `# ==========================================================
# Fix for "Project has not yet been deployed" on Netlify:
# ==========================================================

Fix 1: Trigger Deploy Manually in Netlify
1. Go to your Netlify dashboard (shown in your screenshot).
2. Click the "Deploys" tab in the top navigation bar.
3. Click the "Trigger deploy" button on the right -> select "Deploy site".
4. Netlify will run the build command and publish the site!

Fix 2: Confirm Build Settings in Netlify
1. Go to "Site configuration" (left sidebar) -> "Build & deploy" -> "Continuous deployment".
2. Ensure:
   - Base directory: (leave empty)
   - Build command: npm run build
   - Publish directory: dist
3. Save, then go back to "Deploys" -> "Trigger deploy".

Fix 3: Netlify Drop (100% Guaranteed Drag & Drop - No Build Errors)
1. Click "Download Ready dist.zip" above and extract it.
2. Visit https://app.netlify.com/drop
3. Drag & drop the "dist" folder into the box.
4. Your site will immediately go live with zero build errors!`;

  return (
    <div className="space-y-6">
      {/* Header in Corporate Deep Black */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-2.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Free Cloud Hosting & Live Deployment Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Publish Grand CMS Online (100% Free Forever)
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Choose from the top free hosting platforms below. Vercel is the easiest 1-click option, or use Cloudflare Pages & Netlify Drop without even touching Git!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadDistZip}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Ready dist.zip (Drag & Drop)
            </button>
            <button
              onClick={handleDownloadProjectZip}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              Source Code (.zip)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('vercel')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vercel'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          1. Vercel (Recommended ⭐)
        </button>

        <button
          onClick={() => setActiveTab('cloudflare-pages')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cloudflare-pages'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          2. Cloudflare Pages (Unlimited)
        </button>

        <button
          onClick={() => setActiveTab('netlify')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'netlify'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          3. Netlify (Fix & Drop)
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50'
          }`}
        >
          <Database className="w-4 h-4" />
          4. Database (Supabase)
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'github'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4" />
          5. GitHub
        </button>

        <button
          onClick={() => setActiveTab('cloudflare')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cloudflare'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          6. Cloudflare D1
        </button>
      </div>

      {/* --- TAB 1: GITHUB --- */}
      {activeTab === 'github' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                Upload Grand CMS Codebase to GitHub
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target URL:{' '}
                <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                  https://github.com/
                </a>
              </p>
            </div>

            <button
              onClick={() => handleCopy(gitCommands, 'git')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode === 'git' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode === 'git' ? 'Copied' : 'Copy Commands'}
            </button>
          </div>

          {/* Download ZIP Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950">
                  Direct Download: grand-cms-project.zip (১-ক্লিকে ডাউনলোড)
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                  সম্পূর্ণ প্রজেক্টের ক্লিন কোডবেস জিপ রেডি করা আছে। জিপটি ডাউনলোড করে সরাসরি গিটহাবে আপলোড করতে পারেন।
                </p>
              </div>
            </div>
            <a
              href="/grand-cms-project.zip"
              download="grand-cms-project.zip"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download ZIP (113 KB)
            </a>
          </div>

          <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
            {gitCommands}
          </pre>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-950 block mb-1">Branch</span>
              <p className="text-slate-600 font-medium">main (standard production branch)</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-950 block mb-1">Included Configs</span>
              <p className="text-slate-600 font-medium">netlify.toml, wrangler.toml, schema.sql</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-950 block mb-1">Mobile Support</span>
              <p className="text-slate-600 font-medium">PWA & Responsive Viewport enabled</p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SUPABASE POSTGRESQL --- */}
      {activeTab === 'supabase' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Primary Database
                </span>
                <span className="text-xs text-slate-400 font-mono">PostgreSQL Cloud</span>
              </div>
              <h2 className="text-lg font-black text-slate-950 mt-1 flex items-center gap-2">
                Supabase PostgreSQL Database Connection
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Project URL:{' '}
                <a
                  href="https://supabase.com/dashboard/project/dbddplawdicokffewuwz"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-mono font-semibold hover:underline"
                >
                  https://dbddplawdicokffewuwz.supabase.co
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(SUPABASE_SQL, 'supabase-sql')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copiedCode === 'supabase-sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'supabase-sql' ? 'Copied SQL Script!' : 'Copy SQL Schema'}
              </button>

              <button
                onClick={handleDownloadSupabaseSql}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download supabase_schema.sql
              </button>
            </div>
          </div>

          {/* Supabase Connection Setup Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              API Connection & Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL:
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://dbddplawdicokffewuwz.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Supabase anon / public Key:</span>
                  <a
                    href="https://supabase.com/dashboard/project/dbddplawdicokffewuwz/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-600 font-normal hover:underline flex items-center gap-1"
                  >
                    Get anon key from Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJh..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveSupabase}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isSaved ? 'Saved Locally!' : 'Save Credentials'}
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing Connection...' : 'Test Live Connection'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Supabase ডাটাবেজ রেডি করার ৩টি সহজ ধাপ:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                    ১
                  </span>
                  <h4 className="font-bold text-slate-950 mb-1">SQL Editor খুলুন</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Supabase ড্যাশবোর্ডে গিয়ে বামের মেনু থেকে <span className="font-bold text-emerald-700">"SQL Editor"</span>-এ ক্লিক করুন এবং <span className="font-bold">"New query"</span> চাপুন।
                  </p>
                </div>
                <a
                  href="https://supabase.com/dashboard/project/dbddplawdicokffewuwz/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Open SQL Editor <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                    ২
                  </span>
                  <h4 className="font-bold text-slate-950 mb-1">SQL কোড রান করুন</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    উপরের <span className="font-bold text-emerald-700">"Copy SQL Schema"</span> বাটনে চাপ দিয়ে পুরো কোডটি কপি করে SQL Editor-এ পেস্ট করুন এবং <span className="font-bold">"Run"</span> করুন।
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(SUPABASE_SQL, 'supabase-sql-btn')}
                  className="mt-3 text-emerald-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer text-left"
                >
                  {copiedCode === 'supabase-sql-btn' ? 'Copied to Clipboard!' : 'Click to Copy SQL'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                    ৩
                  </span>
                  <h4 className="font-bold text-slate-950 mb-1">Anon Key টি এখানে দিন</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Supabase Project Settings &gt; API থেকে <span className="font-bold text-emerald-700">anon public key</span> টি কপি করে উপরের ইনপুটে দিয়ে "Test Connection" চাপুন।
                  </p>
                </div>
                <a
                  href="https://supabase.com/dashboard/project/dbddplawdicokffewuwz/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* SQL Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Supabase PostgreSQL Schema Preview (supabase_schema.sql):
              </span>
              <button
                onClick={() => handleCopy(SUPABASE_SQL, 'supabase-sql-preview')}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'supabase-sql-preview' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'supabase-sql-preview' ? 'Copied' : 'Copy All SQL'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs font-mono text-emerald-400 max-h-60 overflow-y-auto leading-relaxed shadow-inner">
              {SUPABASE_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* --- TAB 3: CLOUDFLARE D1 --- */}
      {activeTab === 'cloudflare' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Cloudflare D1 Relational SQL Database
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target URL:{' '}
                <a href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                  https://cloudflare.com/
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(cloudflareCommands, 'cf-cmd')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode === 'cf-cmd' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'cf-cmd' ? 'Copied' : 'Copy Wrangler Steps'}
              </button>

              <button
                onClick={handleDownloadSql}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download schema.sql
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs font-mono text-blue-400 overflow-x-auto leading-relaxed shadow-inner">
            {cloudflareCommands}
          </pre>

          {/* Real-time Dynamic SQL State Inspector */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Cloudflare D1 SQL Schema & State Export:
              </span>
              <button
                onClick={() => handleCopy(d1Sql, 'd1-sql')}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'd1-sql' ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'd1-sql' ? 'Copied Full SQL' : 'Copy Full SQL'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs font-mono text-slate-200 max-h-56 overflow-y-auto shadow-inner">
              {d1Sql}
            </pre>
          </div>
        </div>
      )}

      {/* --- TAB 3: NETLIFY --- */}
      {activeTab === 'netlify' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Publish & Host on Netlify
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target URL:{' '}
                <a href="https://app.netlify.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                  https://netlify.app/
                </a>{' '}
                &bull; Custom Domain:{' '}
                <span className="font-semibold text-slate-900">https://grandcmsbd.netlify.app/</span>
              </p>
            </div>

            <button
              onClick={() => handleCopy(netlifySteps, 'netlify')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode === 'netlify' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode === 'netlify' ? 'Copied' : 'Copy Steps'}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs font-mono text-cyan-400 overflow-x-auto leading-relaxed shadow-inner">
            {netlifySteps}
          </pre>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-950">Configured File: netlify.toml</p>
              <p className="text-slate-600 mt-0.5 font-medium">
                The applet includes a ready-to-deploy <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded border border-blue-200">netlify.toml</code> in the root directory
                configuring single-page application URL rewriting to <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded border border-blue-200">/index.html</code> (status 200) and Node 20 runtime.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
