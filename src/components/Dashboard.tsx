import React from 'react';
import { Quotation, Invoice, Expense, Client, ProjectSchedule } from '../types';
import { FileText, Receipt, Users, WalletCards, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardProps {
  quotations: Quotation[];
  invoices: Invoice[];
  expenses: Expense[];
  clients: Client[];
  projects: ProjectSchedule[];
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  quotations,
  invoices,
  expenses,
  clients,
  projects,
  setActiveTab,
}) => {
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.advance, 0);
  const totalDue = invoices.reduce((acc, inv) => acc + inv.due, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  const stats = [
    {
      title: 'Total Billed (Invoices)',
      value: `৳ ${totalBilled.toLocaleString()}/-`,
      icon: Receipt,
      bg: 'bg-[#0B192C] text-blue-400 border-slate-800',
    },
    {
      title: 'Total Collected',
      value: `৳ ${totalCollected.toLocaleString()}/-`,
      icon: CheckCircle2,
      bg: 'bg-[#0B192C] text-emerald-400 border-slate-800',
    },
    {
      title: 'Total Due Balance',
      value: `৳ ${totalDue.toLocaleString()}/-`,
      icon: AlertCircle,
      bg: 'bg-[#0B192C] text-amber-400 border-slate-800',
    },
    {
      title: 'Operating Expenses',
      value: `৳ ${totalExpenses.toLocaleString()}/-`,
      icon: WalletCards,
      bg: 'bg-[#0B192C] text-purple-400 border-slate-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#07101C] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-800">
        <div>
          <span className="bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[11px] tracking-wide uppercase">
            Grand ERP Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            Welcome back, Zahir Uddin Fuhad!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Grand Communication & Marketing — Managing brand activations, corporate booths & events.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('quotations')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${stat.bg} shadow-lg flex items-center justify-between`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.title}</p>
                <h3 className="text-lg sm:text-xl font-black mt-1 text-white">{stat.value}</h3>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xs">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="bg-[#0B192C] rounded-2xl p-6 shadow-xl border border-slate-800 text-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Recent Quotations</span>
            </h3>
            <button
              onClick={() => setActiveTab('quotations')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {quotations.slice(0, 4).map((q) => (
              <div key={q.id} className="p-3.5 rounded-xl bg-[#07101C] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{q.quotationNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mt-1">{q.clientName}</p>
                  <p className="text-[11px] text-slate-500">{q.subject} • {q.date}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-xs text-amber-400">৳ {q.total.toLocaleString()}/-</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-[#0B192C] rounded-2xl p-6 shadow-xl border border-slate-800 text-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Upcoming Project Schedules</span>
            </h3>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-[#07101C] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <h4 className="font-bold text-xs text-white">{p.projectName}</h4>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">Client: {p.clientName}</p>
                  <p className="text-[11px] text-slate-500">Venue: {p.venue} • Event: {p.eventDate}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
