import React, { useState } from 'react';
import { Expense, ProjectSchedule, Supplier } from '../types';
import { X, Receipt, CheckCircle, Plus, Wallet, Building2, Tag } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  suppliers: Supplier[];
  projects: ProjectSchedule[];
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers = [],
  projects = [],
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [expenseType, setExpenseType] = useState<'Office' | 'Project'>('Office');
  const [category, setCategory] = useState<Expense['category']>('Office Rent');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [projectId, setProjectId] = useState<string>('');
  const [voucherNo, setVoucherNo] = useState(`EXP-VCH-${Date.now().toString().slice(-4)}`);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-sync category when expense type changes
  const handleTypeChange = (type: 'Office' | 'Project') => {
    setExpenseType(type);
    if (type === 'Office') {
      setCategory('Office Rent');
      setProjectId('');
    } else {
      setCategory('Production');
    }
  };

  const handleSupplierSelect = (supplierName: string) => {
    setPaidTo(supplierName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please specify expense description / title.');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!paidTo.trim()) {
      setErrorMsg('Please enter payee / paid to party.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date,
      category,
      expenseType,
      description: description.trim(),
      amount,
      paidTo: paidTo.trim(),
      paymentMethod: `${paymentMethod}${voucherNo ? ` (Ref: ${voucherNo})` : ''}`,
      projectId: projectId || undefined,
    };

    onSave(newExpense);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B192C] border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Record New Expense</h2>
              <p className="text-xs text-slate-400">
                Add an operational overhead or project execution cost with live database sync.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Expense Classification
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('Office')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  expenseType === 'Office'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-[#07101C] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Office / Agency Overhead</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('Project')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  expenseType === 'Project'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-[#07101C] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Project / Site Execution</span>
              </button>
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {expenseType === 'Office' ? (
                  <>
                    <option value="Office Rent">Office Space Rent (অফিস ভাড়া)</option>
                    <option value="Salary">Salary & Remuneration (বেতন/মজুরি)</option>
                    <option value="Utilities">Utilities (Electricity / Net / Water)</option>
                    <option value="Transport">Conveyance & Transport</option>
                    <option value="Marketing">Marketing & Promotion</option>
                    <option value="Misc">Refreshment & Entertainment</option>
                    <option value="Misc">General Office Maintenance</option>
                    <option value="Misc">Other Office Misc</option>
                  </>
                ) : (
                  <>
                    <option value="Production">Fabrication & Raw Materials (উৎপাদন)</option>
                    <option value="Production">Digital Printing & Proofing (প্রিন্টিং)</option>
                    <option value="Transport">Delivery, Logistics & Pickup Van</option>
                    <option value="Salary">Technician / Installer Daily Wages</option>
                    <option value="Misc">Site Refreshment & Contingency</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Project Link (If Project Expense) */}
          {expenseType === 'Project' && projects.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                Link to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- No Specific Project (General Production) --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.clientName}) [{p.status}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Expense Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Expense Title / Description *
            </label>
            <input
              type="text"
              placeholder={
                expenseType === 'Office'
                  ? 'e.g. Gausia Super Market Office Rent for October 2026'
                  : 'e.g. Timber & Wooden Framing Materials for Apex Retail Booth'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Amount Box */}
          <div className="p-3.5 rounded-2xl bg-[#07101C] border border-amber-500/40">
            <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-1">
              Expense Amount (BDT ৳) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-black text-amber-400">৳</span>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 bg-[#0B192C] border border-amber-500/50 rounded-xl text-base font-black text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Paid To & Quick Select Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Paid To / Payee *
                </label>
                {suppliers.length > 0 && (
                  <select
                    onChange={(e) => handleSupplierSelect(e.target.value)}
                    className="text-[10px] bg-[#07101C] border border-slate-700 text-amber-400 rounded px-1.5 py-0.5"
                  >
                    <option value="">Quick Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. Gausia Market Authority / Rahim Woods"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Cash">Cash (নগদ)</option>
                <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Cheque">Bank Cheque (চেক)</option>
              </select>
            </div>
          </div>

          {/* Voucher Ref */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Voucher / Cheque / Txn Ref No (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. VCH-2026-091 or TXN-81928"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save & Sync Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
