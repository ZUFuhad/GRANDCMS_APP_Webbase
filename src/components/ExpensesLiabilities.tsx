import React, { useState } from 'react';
import { Expense, FinancialLiability, ProjectSchedule, Supplier } from '../types';
import {
  WalletCards,
  Plus,
  Trash2,
  Search,
  Building2,
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Filter,
} from 'lucide-react';
import { AddExpenseModal } from './AddExpenseModal';
import { AddLiabilityModal } from './AddLiabilityModal';
import { SettleLiabilityModal } from './SettleLiabilityModal';

interface ExpensesLiabilitiesProps {
  expenses: Expense[];
  liabilities: FinancialLiability[];
  suppliers?: Supplier[];
  projects?: ProjectSchedule[];
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onSaveLiability: (liability: FinancialLiability) => void;
  onDeleteLiability: (id: string) => void;
}

export const ExpensesLiabilities: React.FC<ExpensesLiabilitiesProps> = ({
  expenses = [],
  liabilities = [],
  suppliers = [],
  projects = [],
  onSaveExpense,
  onDeleteExpense,
  onSaveLiability,
  onDeleteLiability,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'liabilities'>('all');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');
  const [liabilitySearch, setLiabilitySearch] = useState('');
  const [liabilityStatusFilter, setLiabilityStatusFilter] = useState('all');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddLiabilityOpen, setIsAddLiabilityOpen] = useState(false);
  const [settlingLiability, setSettlingLiability] = useState<FinancialLiability | null>(null);

  // Financial Stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const officeExpenses = expenses
    .filter((e) => e.expenseType === 'Office' || e.category === 'Office Rent' || e.category === 'Salary' || e.category === 'Utilities')
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const projectExpenses = totalExpenses - officeExpenses;

  const totalLiabilities = liabilities.reduce((sum, l) => sum + (Number(l.totalAmount) || 0), 0);
  const totalLiabilitiesPaid = liabilities.reduce((sum, l) => sum + (Number(l.paidAmount) || 0), 0);
  const totalOutstandingLiability = Math.max(0, totalLiabilities - totalLiabilitiesPaid);

  // Filtered Expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.paidTo.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.category.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesCategory =
      expenseCategoryFilter === 'all' ||
      exp.category.toLowerCase() === expenseCategoryFilter.toLowerCase() ||
      (expenseCategoryFilter === 'Office' && exp.expenseType === 'Office') ||
      (expenseCategoryFilter === 'Project' && exp.expenseType === 'Project');
    return matchesSearch && matchesCategory;
  });

  // Filtered Liabilities
  const filteredLiabilities = liabilities.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(liabilitySearch.toLowerCase()) ||
      l.creditor.toLowerCase().includes(liabilitySearch.toLowerCase());
    const matchesStatus =
      liabilityStatusFilter === 'all' || l.status.toLowerCase() === liabilityStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleSettleLiabilityConfirm = (
    updatedLiability: FinancialLiability,
    repaymentAmount: number,
    paymentMethod: string,
    notes: string
  ) => {
    onSaveLiability(updatedLiability);

    // Also automatically create an Expense record for the repayment to reflect cash outflow
    const repaymentExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: 'Misc',
      expenseType: 'Office',
      description: `Liability Repayment: ${updatedLiability.title} (${notes})`,
      amount: repaymentAmount,
      paidTo: updatedLiability.creditor,
      paymentMethod: paymentMethod,
    };
    onSaveExpense(repaymentExpense);
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Expenses & Financial Liabilities</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
              Cash Flow & Payables
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Track operational overheads, production materials, bank loans, and supplier credit balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Expense</span>
          </button>

          <button
            onClick={() => setIsAddLiabilityOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>+ Add Financial Liability</span>
          </button>
        </div>
      </div>

      {/* Financial Health Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Total Expenses</p>
            <ArrowDownCircle className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-xl font-black text-white mt-1">৳ {totalExpenses.toLocaleString()}/-</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Office: ৳{officeExpenses.toLocaleString()} • Project: ৳{projectExpenses.toLocaleString()}
          </p>
        </div>

        {/* Total Liabilities */}
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Total Liabilities</p>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-xl font-black text-white mt-1">৳ {totalLiabilities.toLocaleString()}/-</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{liabilities.length} recorded debt / credit accounts</p>
        </div>

        {/* Repaid Liabilities */}
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Repaid / Cleared</p>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white mt-1">৳ {totalLiabilitiesPaid.toLocaleString()}/-</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Principal installments cleared</p>
        </div>

        {/* Net Outstanding Balance */}
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-red-900/40 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Net Outstanding Due</p>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-xl font-black text-rose-400 mt-1">৳ {totalOutstandingLiability.toLocaleString()}/-</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Payable to banks & suppliers</p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white bg-[#07101C]'
          }`}
        >
          All Overview
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'expenses'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white bg-[#07101C]'
          }`}
        >
          <WalletCards className="w-3.5 h-3.5" />
          <span>Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('liabilities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'liabilities'
              ? 'bg-red-500 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-white bg-[#07101C]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Liabilities ({liabilities.length})</span>
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= SECTION 1: EXPENSES ================= */}
        {(activeTab === 'all' || activeTab === 'expenses') && (
          <div className={`space-y-4 ${activeTab === 'expenses' ? 'lg:col-span-2' : ''}`}>
            <div className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <WalletCards className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">
                    Operational & Project Expenses (৳ {totalExpenses.toLocaleString()}/-)
                  </h3>
                </div>

                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Expense</span>
                </button>
              </div>

              {/* Expense Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Office">Office Overheads</option>
                  <option value="Project">Project Execution</option>
                  <option value="Office Rent">Office Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Production">Production & Materials</option>
                  <option value="Transport">Transport</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>

              {/* Expenses List */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredExpenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-xs">No expense records found.</p>
                    <button
                      onClick={() => setIsAddExpenseOpen(true)}
                      className="mt-2 text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Click here to add your first expense
                    </button>
                  </div>
                ) : (
                  filteredExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 bg-[#07101C] rounded-xl border border-slate-800/80 flex justify-between items-center hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            {exp.category}
                          </span>
                          {exp.expenseType && (
                            <span className="text-[9px] font-semibold text-slate-400">
                              ({exp.expenseType})
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-semibold">{exp.date}</span>
                        </div>
                        <p className="font-bold text-xs text-white">{exp.description}</p>
                        <p className="text-[11px] text-slate-400">
                          Paid to: <strong className="text-slate-300">{exp.paidTo}</strong> • {exp.paymentMethod}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-black text-sm text-amber-400">
                            ৳ {(Number(exp.amount) || 0).toLocaleString()}/-
                          </span>
                        </div>

                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 cursor-pointer transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: FINANCIAL LIABILITIES ================= */}
        {(activeTab === 'all' || activeTab === 'liabilities') && (
          <div className={`space-y-4 ${activeTab === 'liabilities' ? 'lg:col-span-2' : ''}`}>
            <div className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-sm text-white">
                    Financial Liabilities & Payables (Due: ৳ {totalOutstandingLiability.toLocaleString()}/-)
                  </h3>
                </div>

                <button
                  onClick={() => setIsAddLiabilityOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/40 text-xs font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Liability</span>
                </button>
              </div>

              {/* Liability Search & Status Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search liabilities, creditors..."
                    value={liabilitySearch}
                    onChange={(e) => setLiabilitySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {['all', 'Pending', 'Partial', 'Cleared'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setLiabilityStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                        liabilityStatusFilter === st
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-[#07101C] text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liabilities List */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredLiabilities.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-xs">No liability accounts found.</p>
                    <button
                      onClick={() => setIsAddLiabilityOpen(true)}
                      className="mt-2 text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Click here to record a liability
                    </button>
                  </div>
                ) : (
                  filteredLiabilities.map((liab) => {
                    const remainingDue = Math.max(0, (liab.totalAmount || 0) - (liab.paidAmount || 0));

                    return (
                      <div
                        key={liab.id}
                        className="p-3.5 bg-[#07101C] rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                liab.status === 'Cleared' || remainingDue === 0
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  : liab.status === 'Partial'
                                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                                  : 'bg-red-950 text-red-300 border-red-800'
                              }`}
                            >
                              {remainingDue === 0 ? 'Cleared' : liab.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Due Date: {liab.dueDate}
                            </span>
                          </div>

                          <p className="font-bold text-xs text-white">{liab.title}</p>
                          <p className="text-[11px] text-slate-400">
                            Creditor: <strong className="text-slate-300">{liab.creditor}</strong>
                            {liab.notes && <span className="text-slate-500"> • {liab.notes}</span>}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                          <div className="text-left sm:text-right">
                            <span className="font-black text-sm text-red-400 block">
                              Due: ৳ {remainingDue.toLocaleString()}/-
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Total: ৳ {liab.totalAmount.toLocaleString()} • Paid: ৳ {liab.paidAmount.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {remainingDue > 0 && (
                              <button
                                onClick={() => setSettlingLiability(liab)}
                                className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Record Repayment Installment"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Settle</span>
                              </button>
                            )}

                            <button
                              onClick={() => onDeleteLiability(liab.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 cursor-pointer transition-colors"
                              title="Delete Liability"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Add New Expense */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onSave={onSaveExpense}
          suppliers={suppliers}
          projects={projects}
        />
      )}

      {/* Modal 2: Add Financial Liability */}
      {isAddLiabilityOpen && (
        <AddLiabilityModal
          isOpen={isAddLiabilityOpen}
          onClose={() => setIsAddLiabilityOpen(false)}
          onSave={onSaveLiability}
          suppliers={suppliers}
        />
      )}

      {/* Modal 3: Settle / Repay Liability */}
      {settlingLiability && (
        <SettleLiabilityModal
          liability={settlingLiability}
          isOpen={Boolean(settlingLiability)}
          onClose={() => setSettlingLiability(null)}
          onSettle={handleSettleLiabilityConfirm}
        />
      )}
    </div>
  );
};
