import React, { useState } from 'react';
import { StorageService } from '../services/storage';
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
} from 'lucide-react';

export const DeploymentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'github' | 'cloudflare' | 'netlify'>('github');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const d1Sql = StorageService.generateCloudflareD1Sql();

  const handleDownloadSql = () => {
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

  const netlifySteps = `# Method A: Netlify Continuous Deployment (Recommended)
1. Go to https://app.netlify.com
2. Click "Add new site" -> "Import an existing project"
3. Connect your GitHub repository: grand-cms
4. Netlify will auto-detect netlify.toml:
   - Build command: npm run build
   - Publish directory: dist
5. Set Environment Variable in Netlify UI:
   - GEMINI_API_KEY: your-google-genai-api-key
6. Click "Deploy site" -> Your custom URL will be live at https://grandcmsbd.netlify.app

# Method B: Direct Netlify CLI Deploy
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist`;

  return (
    <div className="space-y-6">
      {/* Header in Corporate Deep Black */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-2.5">
              <CloudUpload className="w-3.5 h-3.5 text-blue-400" />
              DevOps & Deployment Pipeline (Setup Hobay)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Production Setup: GitHub &bull; Cloudflare D1 &bull; Netlify
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              All infrastructure files are prepared in the project root: <code className="text-blue-400 font-mono">schema.sql</code>,{' '}
              <code className="text-blue-400 font-mono">wrangler.toml</code>, and <code className="text-blue-400 font-mono">netlify.toml</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadSql}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download D1 SQL Dump
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'github'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4" />
          1. Code Upload (GitHub)
        </button>

        <button
          onClick={() => setActiveTab('cloudflare')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cloudflare'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          2. Database (Cloudflare D1)
        </button>

        <button
          onClick={() => setActiveTab('netlify')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'netlify'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          3. Publish App (Netlify)
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

      {/* --- TAB 2: CLOUDFLARE D1 --- */}
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
