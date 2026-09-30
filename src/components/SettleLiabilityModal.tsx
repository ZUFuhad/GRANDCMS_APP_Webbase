import React, { useState } from 'react';
import { FinancialLiability } from '../types';
import { X, CheckCircle, DollarSign, Wallet } from 'lucide-react';

interface SettleLiabilityModalProps {
  liability: FinancialLiability;
  isOpen: boolean;
  onClose: () => void;
  onSettle: (updatedLiability: FinancialLiability, repaymentAmount: number, paymentMethod: string, notes: string) => void;
}

export const SettleLiabilityModal: React.FC<SettleLiabilityModalProps> = ({
  liability,
  isOpen,
  onClose,
  onSettle,
}) => {
  const currentRemaining = Math.max(0, liability.totalAmount - liability.paidAmount);

  const [paymentAmount, setPaymentAmount] = useState<number>(currentRemaining);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(`Installment payment for ${liability.title}`);

  const newTotalPaid = (liability.paidAmount || 0) + (Number(paymentAmount) || 0);
  const newRemaining = Math.max(0, liability.totalAmount - newTotalPaid);
  const newStatus: FinancialLiability['status'] =
    newRemaining === 0 ? 'Cleared' : newTotalPaid > 0 ? 'Partial' : 'Pending';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const updated: FinancialLiability = {
      ...liability,
      paidAmount: newTotalPaid,
      status: newStatus,
      notes: `${liability.notes ? liability.notes + ' | ' : ''}Repayment: ৳${paymentAmount} on ${paymentDate} via ${paymentMethod}`,
    };

    onSettle(updated, paymentAmount, paymentMethod, notes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B192C] border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Record Liability Repayment</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{liability.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#07101C] rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Creditor:</span>
              <strong className="text-white">{liability.creditor}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Liability:</span>
              <span className="font-bold text-slate-200">৳{liability.totalAmount.toLocaleString()}/-</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Already Repaid:</span>
              <span className="font-bold text-emerald-400">৳{liability.paidAmount.toLocaleString()}/-</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1.5 text-amber-400 font-black">
              <span>Current Due Balance:</span>
              <span>৳{currentRemaining.toLocaleString()}/-</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Repayment Amount (BDT ৳) *
            </label>
            <input
              type="number"
              min="1"
              max={currentRemaining}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full p-2.5 bg-[#07101C] border border-emerald-500/50 rounded-xl text-sm font-black text-emerald-300 focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Notes / Voucher Reference</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
            >
              Confirm Repayment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
