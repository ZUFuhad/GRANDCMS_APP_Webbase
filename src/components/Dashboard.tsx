import React from 'react';
import {
  Quotation,
  Invoice,
  Client,
  Supplier,
  ProjectSchedule,
  FinancialLiability,
} from '../types';
import {
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DashboardProps {
  quotations: Quotation[];
  invoices: Invoice[];
  clients: Client[];
  suppliers: Supplier[];
  projects: ProjectSchedule[];
  liabilities: FinancialLiability[];
  onNavigate: (tab: NavTab) => void;
  onPreviewDocument: (doc: Quotation | Invoice, type: 'Quotation' | 'Invoice') => void;
  onNewQuotation: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  quotations,
  invoices,
  clients,
  suppliers,
  projects,
  liabilities,
  onNavigate,
  onPreviewDocument,
  onNewQuotation,
}) => {
  // Aggregate Metrics
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = invoices.reduce(
    (sum, inv) =>
      sum + (inv.payments?.reduce((pSum, p) => pSum + p.amount, 0) || inv.advance || 0),
    0,
  );
  const totalClientDue = invoices.reduce((sum, inv) => sum + inv.due, 0);
  const totalSupplierLiability = liabilities
    .filter((l) => l.status !== 'Cleared')
    .reduce((sum, l) => sum + l.remainingLiability, 0);

  const activeProjectsCount = projects.filter(
    (p) => p.status !== 'Completed' && p.status !== 'Delayed',
  ).length;

  const netWorkingCapital = totalClientDue - totalSupplierLiability;

  const formatBDT = (amount: number) => {
    return '৳ ' + amount.toLocaleString('en-IN') + '/-';
  };

  return (
    <div className="space-y-6">
      {/* --- HERO BANNER: Navy Blue with Crisp White Details --- */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E2442] to-[#1E3E62] border border-[#1E3E62] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold border border-white/25 mb-3 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              GRAND Agency ERP &bull; Navy Blue & White Theme
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Agency Overview
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed font-normal">
              Real-time monitoring of corporate quotations, client receivables, workshop fabrication,
              and supplier liabilities for <span className="text-white font-bold underline decoration-blue-300">GRAND Communication & Marketing</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNewQuotation}
              className="px-5 py-2.5 bg-white hover:bg-blue-50 text-[#0B192C] font-black text-xs rounded-xl shadow-lg shadow-black/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0B192C]" />
              New Quotation
            </button>

            <button
              onClick={() => onNavigate('agentic_growth')}
              className="px-4 py-2.5 bg-[#102A43] hover:bg-[#1E3E62] text-white font-bold text-xs rounded-xl shadow-md border border-[#1E3E62] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              AI Lead Discovery
            </button>
          </div>
        </div>
      </div>

      {/* --- KPI CARDS ROW: Crisp White Cards with High-Contrast Navy Blue Accents --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invoiced */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#1E3E62] transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Invoiced
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#0B192C] border border-blue-200">
              <Receipt className="w-4 h-4 text-[#0B192C]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B192C] font-mono tracking-tight">
            {formatBDT(totalBilled)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-600">
            <span className="text-[#0B192C] font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              {invoices.length} Invoices
            </span>
            <span>&bull; Collected: {formatBDT(totalCollected)}</span>
          </div>
        </div>

        {/* Card 2: Client Dues / Receivables */}
        <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#1E3E62] transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">
              Receivables Due
            </span>
            <div className="p-2 rounded-xl bg-[#0B192C] text-white shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B192C] font-mono tracking-tight">
            {formatBDT(totalClientDue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-600">
            <span className="text-[#0B192C] font-bold">
              Pending Collections
            </span>
            <span>from {clients.filter((c) => c.currentDue > 0).length} Clients</span>
          </div>
        </div>

        {/* Card 3: Financial Liabilities (Supplier Payables) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#1E3E62] transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Vendor Liabilities
            </span>
            <div className="p-2 rounded-xl bg-[#1E3E62] text-white shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatBDT(totalSupplierLiability)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-600">
            <span className="text-[#0B192C] font-bold">Payable to:</span>
            <span>
              {suppliers.filter((s) => s.payableLiability > 0).length} Material Vendors
            </span>
          </div>
        </div>

        {/* Card 4: Net Working Capital in Navy Blue & White */}
        <div className="bg-gradient-to-br from-[#0B192C] via-[#0E2442] to-[#1E3E62] border border-[#1E3E62] text-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-blue-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Net Agency Capital
            </span>
            <div className="p-2 rounded-xl bg-white/20 text-white border border-white/30">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {formatBDT(netWorkingCapital)}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-blue-100">
            <span className="font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-white" />
              Healthy Ratio:
            </span>
            <span>Assets exceed Liabilities</span>
          </div>
        </div>
      </div>

      {/* --- MIDDLE GRID: Projects Pipeline & Cashflow Ratio --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Production Projects Pipeline (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-950">Live Project Execution Pipeline</h2>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              View Full Timeline &rarr;
            </button>
          </div>

          <div className="space-y-3.5">
            {projects.slice(0, 3).map((proj) => {
              const statusBadgeClass =
                proj.status === 'Fabrication'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : proj.status === 'Design & Clearance'
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : proj.status === 'Installation'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div
                  key={proj.id}
                  className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-950">
                          {proj.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadgeClass}`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Client: <strong className="text-slate-800">{proj.clientName}</strong> &bull; Location: {proj.location}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Event Day</span>
                      <span className="text-xs font-bold text-blue-600 font-mono">
                        {proj.eventDate}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 my-2">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Fabrication Progress</span>
                      <span className="font-bold text-slate-950">{proj.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${proj.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>
                      <strong className="text-slate-900">Clearance Deadline (12-Day Rule):</strong> {proj.printClearanceDeadline}
                    </span>
                    <span className="text-slate-500 font-medium">Team: {proj.assignedTeam[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Cashflow & Liability Ratio (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-950">Cashflow & Ratio</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Q1 2026
              </span>
            </div>

            {/* Visual Mini Chart Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <div className="text-xs text-slate-600 mb-3 font-bold uppercase tracking-wider">
                Receivables vs Supplier Liabilities
              </div>

              <div className="space-y-3.5">
                {/* Bar 1: Invoiced */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Total Billed</span>
                    <span className="font-mono text-slate-950 font-bold">{formatBDT(totalBilled)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-950 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Bar 2: Due From Clients */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Client Dues (Receivable)</span>
                    <span className="font-mono text-blue-600 font-bold">{formatBDT(totalClientDue)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, (totalClientDue / (totalBilled || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bar 3: Supplier Payables */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Supplier Liabilities</span>
                    <span className="font-mono text-slate-800 font-bold">{formatBDT(totalSupplierLiability)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full"
                      style={{ width: `${Math.min(100, (totalSupplierLiability / (totalBilled || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => onNavigate('quotations')}
                className="p-3.5 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-xs cursor-pointer group"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-slate-950">Quotations</p>
                <p className="text-[11px] text-slate-500">{quotations.length} Active Records</p>
              </button>

              <button
                onClick={() => onNavigate('expenses')}
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 text-left transition-all shadow-xs cursor-pointer group"
              >
                <Wallet className="w-4 h-4 text-slate-950 mb-1.5 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-slate-950">Liabilities</p>
                <p className="text-[11px] text-slate-500">{liabilities.length} Payables</p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Official Phone: 01819 312820</span>
            <span className="text-blue-600 font-bold">Grand Communication</span>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: Recent Quotations & Invoices in White, Blue & Black --- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-950">Recent Quotations & Invoices</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any item to view in the authentic Grand Letterhead layout with print & PDF download.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('quotations')}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              All Quotations
            </button>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold transition-colors cursor-pointer shadow-xs"
            >
              All Invoices
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B192C] text-white font-bold">
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5">Document #</th>
                <th className="py-3 px-3.5">Client</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-right">Total (৳)</th>
                <th className="py-3 px-3.5 text-right">Advance (৳)</th>
                <th className="py-3 px-3.5 text-right">Due (৳)</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Combine quotations and invoices */}
              {quotations.slice(0, 3).map((q) => (
                <tr key={q.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0B192C] border border-blue-200">
                      Quotation
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold text-[#0B192C]">
                    {q.quotationNumber}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    {q.clientName}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500">{q.date}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-950">
                    {q.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                    {q.advance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-[#0B192C]">
                    {q.due.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={() => onPreviewDocument(q, 'Quotation')}
                      className="px-2.5 py-1 rounded-lg bg-[#0B192C] hover:bg-[#1E3E62] text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      title="Preview Authentic Grand Letterhead"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {invoices.slice(0, 3).map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E3E62] text-white">
                      Invoice
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    {inv.clientName}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500">{inv.date}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-950">
                    {inv.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                    {inv.advance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-[#0B192C]">
                    {inv.due.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-[#0B192C] border border-blue-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={() => onPreviewDocument(inv, 'Invoice')}
                      className="px-2.5 py-1 rounded-lg bg-[#0B192C] hover:bg-[#1E3E62] text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      title="Preview Authentic Grand Letterhead"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
