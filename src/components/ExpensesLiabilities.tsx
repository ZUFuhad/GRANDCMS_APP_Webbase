import React, { useState } from 'react';
import { Expense, FinancialLiability, Supplier } from '../types';
import {
  WalletCards,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CreditCard,
  CheckCircle2,
  Trash2,
  TrendingDown,
  DollarSign,
  Clock,
  X,
} from 'lucide-react';

interface ExpensesLiabilitiesProps {
  expenses: Expense[];
  liabilities: FinancialLiability[];
  suppliers: Supplier[];
  onSaveExpense: (expense: Expense) => void;
  onPayLiability: (liabilityId: string, amount: number) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesLiabilities: React.FC<ExpensesLiabilitiesProps> = ({
  expenses,
  liabilities,
  suppliers,
  onSaveExpense,
  onPayLiability,
  onDeleteExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'liabilities' | 'expenses'>('liabilities');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [payingLiability, setPayingLiability] = useState<FinancialLiability | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // New Expense Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Printing Media');
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  );
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Cheque' | 'Bank Transfer'>('Bank Transfer');
  const [receiptNumber, setReceiptNumber] = useState('');

  const handleSupplierSelect = (supId: string) => {
    setSupplierId(supId);
    const sup = suppliers.find((s) => s.id === supId);
    if (sup) {
      setSupplierName(sup.name);
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title,
      category,
      supplierId: supplierId || undefined,
      supplierName: supplierName || 'General Supplier',
      amount,
      isPaid,
      dueDate: isPaid ? undefined : dueDate,
      paymentMethod,
      receiptNumber: receiptNumber || `RCP-${Date.now().toString().slice(-5)}`,
      recordedBy: 'Mohin Uddin',
    };

    onSaveExpense(newExpense);
    setShowExpenseModal(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setAmount(0);
    setSupplierId('');
    setSupplierName('');
    setIsPaid(false);
  };

  const handleConfirmLiabilityPayment = () => {
    if (!payingLiability || paymentAmount <= 0) return;
    onPayLiability(payingLiability.id, paymentAmount);
    setPayingLiability(null);
  };

  const totalOutstandingLiability = liabilities.reduce(
    (sum, item) => sum + (item.remainingLiability || 0),
    0,
  );
  const totalExpensesLogged = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-[#0B192C]" />
            Expenses & Financial Liability
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Dedicated vendor credit tracking, raw material expenses, and financial liability control.
          </p>
        </div>

        <button
          onClick={() => setShowExpenseModal(true)}
          className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-black text-xs rounded-xl shadow-md shadow-[#0B192C]/20 flex items-center gap-2 transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Record New Expense / Bill
        </button>
      </div>

      {/* Summary Metrics in Navy Blue & White */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Total Outstanding Liabilities
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#0B192C] font-mono">
            ৳ {totalOutstandingLiability.toLocaleString()}/-
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Unpaid vendor credit & workshop commitments
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Total Expenses Recorded
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
            ৳ {totalExpensesLogged.toLocaleString()}/-
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Materials, labor, logistics & studio operations
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Active Creditors
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
            {liabilities.filter((l) => l.status !== 'Cleared').length} Vendors
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Bengal PVC, Royal Timber, and fabrication suppliers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('liabilities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'liabilities'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-blue-300" />
          Financial Liabilities Ledger ({liabilities.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-[#1E3E62] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-blue-300" />
          All Logged Expenses ({expenses.length})
        </button>
      </div>

      {/* --- TAB 1: FINANCIAL LIABILITIES LEDGER --- */}
      {activeTab === 'liabilities' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B192C] text-white font-bold">
                  <th className="py-3 px-3.5">Supplier / Creditor</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Due Date</th>
                  <th className="py-3 px-3.5 text-right">Total Liability (৳)</th>
                  <th className="py-3 px-3.5 text-right">Paid So Far (৳)</th>
                  <th className="py-3 px-3.5 text-right">Remaining Liability (৳)</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {liabilities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                      No outstanding financial liabilities found! Excellent cashflow posture.
                    </td>
                  </tr>
                ) : (
                  liabilities.map((liab) => (
                    <tr key={liab.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-950">
                        {liab.supplierName}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500">{liab.category}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-600">
                        {liab.dueDate || 'Upon delivery'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-700">
                        {liab.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-500 font-semibold">
                        {liab.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-[#0B192C] text-sm">
                        {liab.remainingLiability.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            liab.status === 'Cleared'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : liab.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-[#0B192C] border border-blue-200'
                          }`}
                        >
                          {liab.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        {liab.remainingLiability > 0 && (
                          <button
                            onClick={() => {
                              setPayingLiability(liab);
                              setPaymentAmount(liab.remainingLiability);
                            }}
                            className="px-3 py-1.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold flex items-center gap-1 ml-auto shadow-xs cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay Vendor
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: ALL LOGGED EXPENSES --- */}
      {activeTab === 'expenses' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B192C] text-white font-bold">
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Expense Title / Item</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Vendor / Recipient</th>
                  <th className="py-3 px-3.5 text-right">Amount (৳)</th>
                  <th className="py-3 px-3.5 text-center">Payment Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 text-slate-500 font-mono">{exp.date}</td>
                    <td className="py-3 px-3.5 font-bold text-slate-950">{exp.title}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-semibold text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">{exp.supplierName || 'Cash direct'}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-950">
                      ৳ {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          exp.isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-[#0B192C] border border-blue-200'
                        }`}
                      >
                        {exp.isPaid ? 'Paid' : `Credit (Due: ${exp.dueDate})`}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.title}"?`)) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- RECORD EXPENSE MODAL --- */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveExpense}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">Record Bill / Expense</h3>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 340gsm Black Media PVC Rolls (500 sqf)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Printing Media">Printing Media (PVC Flex & Backlit)</option>
                    <option value="Raw Materials">Raw Materials (Timber Wood & Metal)</option>
                    <option value="Fabrication Labor">Fabrication Labor (Workshop)</option>
                    <option value="Transport & Crane">Transport & Crane Logistics</option>
                    <option value="City Corp Fees">City Corp Fees & Permits</option>
                    <option value="Office Rent">Office Rent (Kazir Dewri)</option>
                    <option value="Equipment">Equipment & Tools</option>
                    <option value="Misc">Misc Operational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => handleSupplierSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="">-- Choose Vendor --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount (৳) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 45000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-950 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Is Paid vs Liability */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold">Payment Status:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                    />
                    <span className="text-slate-800 font-medium">Already Paid in Cash/Bank</span>
                  </label>
                </div>

                {!isPaid && (
                  <div>
                    <label className="block text-blue-600 font-bold text-[11px] mb-1">
                      Payable Due Date (Adds to Financial Liabilities):
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 cursor-pointer"
              >
                Record Expense & Update Liability
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- PAY LIABILITY MODAL --- */}
      {payingLiability && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Settle Vendor Liability
                </span>
                <h3 className="font-bold text-slate-950 text-base">
                  {payingLiability.supplierName}
                </h3>
              </div>
              <button
                onClick={() => setPayingLiability(null)}
                className="text-slate-400 hover:text-slate-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Commitment:</span>
                <span className="font-mono text-slate-950 font-bold">
                  ৳ {payingLiability.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-blue-600 font-bold pt-1 border-t border-slate-200">
                <span>Remaining Payable:</span>
                <span className="font-mono text-sm font-black">
                  ৳ {payingLiability.remainingLiability.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Amount to Pay Now (৳)
                </label>
                <input
                  type="number"
                  max={payingLiability.remainingLiability}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-950 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPayingLiability(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLiabilityPayment}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 cursor-pointer"
              >
                Confirm Payment & Clear Liability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
