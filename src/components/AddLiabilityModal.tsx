import React, { useState } from 'react';
import { FinancialLiability, Supplier } from '../types';
import { X, CheckCircle, AlertCircle, Building, DollarSign, Calendar, ShieldAlert } from 'lucide-react';

interface AddLiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (liability: FinancialLiability) => void;
  suppliers: Supplier[];
}

export const AddLiabilityModal: React.FC<AddLiabilityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers = [],
}) => {
  const defaultDueDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [creditor, setCreditor] = useState('');
  const [categoryType, setCategoryType] = useState('Supplier / Vendor Credit');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const remaining = Math.max(0, totalAmount - (Number(paidAmount) || 0));

  const handleSupplierSelect = (supplierName: string) => {
    setCreditor(supplierName);
    if (!title) {
      setTitle(`${supplierName} Materials Due`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter liability title / description.');
      return;
    }
    if (!creditor.trim()) {
      setErrorMsg('Please specify creditor / lender / party name.');
      return;
    }
    if (totalAmount <= 0) {
      setErrorMsg('Please enter a valid total liability amount.');
      return;
    }

    const calculatedStatus: FinancialLiability['status'] =
      remaining === 0 ? 'Cleared' : paidAmount > 0 ? 'Partial' : 'Pending';

    const newLiability: FinancialLiability = {
      id: `liab-${Date.now()}`,
      title: `${categoryType ? `[${categoryType}] ` : ''}${title.trim()}`,
      creditor: creditor.trim(),
      totalAmount,
      paidAmount,
      dueDate,
      status: calculatedStatus,
      notes: notes.trim() || `Recorded on ${new Date().toISOString().split('T')[0]}`,
    };

    onSave(newLiability);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B192C] border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Add Financial Liability</h2>
              <p className="text-xs text-slate-400">
                Track bank loans, supplier payables, founder advances, and repayment schedules.
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
          {/* Liability Classification */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Liability Category / Type *
            </label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="Bank Loan / SME Finance">Bank Loan / SME Finance (ব্যাংক লোন)</option>
              <option value="Supplier / Vendor Credit">Supplier / Vendor Credit (সাপ্লায়ার বাকি বিল)</option>
              <option value="Director / Founder Loan">Director / Founder Personal Loan (প্রতিষ্ঠাতা বিনিয়োগ ঋণ)</option>
              <option value="Office Security Deposit">Office Space Security / Advance Deposit (অফিস জামানত)</option>
              <option value="Machinery / Equipment Lease">Machinery / Equipment Lease (প্রিন্টার/মেশিন কিস্তি)</option>
              <option value="Short-Term Borrowing">Short-Term Borrowing (স্বল্পমেয়াদী ঋণ)</option>
              <option value="Other Liability">Other Agency Liability (অন্যান্য দায়)</option>
            </select>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Liability Title / Purpose *
            </label>
            <input
              type="text"
              placeholder="e.g. Eastern Bank Working Capital Loan or Al-Madina Timber Credit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Creditor / Lender */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Creditor / Lender / Party Name *
              </label>
              {suppliers.length > 0 && (
                <select
                  onChange={(e) => handleSupplierSelect(e.target.value)}
                  className="text-[10px] bg-[#07101C] border border-slate-700 text-red-400 rounded px-1.5 py-0.5"
                >
                  <option value="">Choose Existing Supplier</option>
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
              placeholder="e.g. Eastern Bank Ltd / Zahir Uddin Fuhad / Al-Madina Timber"
              value={creditor}
              onChange={(e) => setCreditor(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#07101C] border border-red-500/30">
            <div>
              <label className="block text-[11px] font-black text-red-400 uppercase tracking-wider mb-1">
                Total Liability Principal (BDT ৳) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-black text-red-400">৳</span>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 bg-[#0B192C] border border-red-500/50 rounded-xl text-sm font-black text-white focus:outline-none focus:border-red-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Amount Already Repaid (৳)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-black text-emerald-400">৳</span>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  placeholder="0"
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400">Remaining Outstanding Balance:</span>
              <span className="font-black text-base text-red-400">
                ৳ {remaining.toLocaleString()}/-
              </span>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Repayment Target / Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Notes & Agreement */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Notes & Repayment Agreement Terms
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Monthly installment of ৳ 20,000 via cheque; or settlement upon completion of Apex project."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save & Record Liability</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
