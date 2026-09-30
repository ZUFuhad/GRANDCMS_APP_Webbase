import React, { useState } from 'react';
import { Quotation, PaymentRecord } from '../types';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { X, DollarSign, Calendar, CreditCard, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdvancePaymentModalProps {
  quotation: Quotation;
  isOpen: boolean;
  onClose: () => void;
  onSaveAdvance: (
    updatedQuotation: Quotation,
    newPayment: PaymentRecord,
    andConvertToInvoice?: boolean
  ) => void;
}

export const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({
  quotation,
  isOpen,
  onClose,
  onSaveAdvance,
}) => {
  if (!isOpen) return null;

  const currentAdvance = quotation.advance || 0;
  const currentDue = quotation.due !== undefined ? quotation.due : Math.max(0, quotation.total - currentAdvance);

  // Suggested 70% as per Grand standard terms:
  const suggested70 = Math.round(quotation.total * 0.7);
  const suggested50 = Math.round(quotation.total * 0.5);

  const [amount, setAmount] = useState<number>(currentDue > 0 ? Math.min(suggested70, currentDue) : 0);
  const [workOrderNo, setWorkOrderNo] = useState(quotation.workOrderNumber || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'Cash' | 'Cheque' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [notes, setNotes] = useState('Advance received upon work order confirmation.');
  const [autoConvertInvoice, setAutoConvertInvoice] = useState(false);

  const formatMoney = (val: number) => {
    return `${(val || 0).toLocaleString('en-IN')}/-`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid advance amount greater than 0.');
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay-adv-${Date.now()}`,
      amount: Number(amount),
      date,
      method,
      reference,
      receivedBy,
      notes,
    };

    const newAdvanceTotal = currentAdvance + Number(amount);
    const newDueTotal = Math.max(0, quotation.total - newAdvanceTotal);

    const updatedQuotation: Quotation = {
      ...quotation,
      advance: newAdvanceTotal,
      due: newDueTotal,
      workOrderNumber: workOrderNo || quotation.workOrderNumber,
      workOrderDate: date,
      status: 'Approved',
      payments: [...(quotation.payments || []), newPayment],
    };

    onSaveAdvance(updatedQuotation, newPayment, autoConvertInvoice);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/90 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6">
      <div className="w-full max-w-xl bg-[#0B192C] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-[#07101C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Receive Advance & Work Order</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ref: <span className="text-amber-400 font-bold">{quotation.quotationNumber}</span> • Client: <span className="text-white font-semibold">{quotation.clientName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Quotation Snapshot */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-[#091424] border-b border-slate-800 text-center text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Quotation Total</span>
            <span className="font-extrabold text-white text-sm">৳ {formatMoney(quotation.total)}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Already Received</span>
            <span className="font-extrabold text-emerald-400 text-sm">৳ {formatMoney(currentAdvance)}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Due Balance</span>
            <span className="font-extrabold text-amber-400 text-sm">৳ {formatMoney(currentDue)}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Amount input & Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-200">
                Advance Amount (৳) <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setAmount(suggested50)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] border border-slate-700 cursor-pointer"
                >
                  50% (৳ {suggested50.toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(suggested70)}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] border border-amber-500/40 cursor-pointer"
                  title="70% is standard Grand Payment Terms"
                >
                  70% (Grand Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(currentDue)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] border border-slate-700 cursor-pointer"
                >
                  Full Due
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-bold text-slate-400">৳</span>
              <input
                type="number"
                min="1"
                max={quotation.total}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter advance amount"
                className="w-full pl-8 pr-3 py-2.5 bg-[#07101C] border border-amber-500/50 rounded-xl text-base font-black text-amber-400 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              New Remaining Balance will be: <strong className="text-white">৳ {formatMoney(Math.max(0, quotation.total - (currentAdvance + Number(amount || 0))))}</strong>
            </p>
          </div>

          {/* Work Order No & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Work Order / PO Number (optional)
              </label>
              <input
                type="text"
                value={workOrderNo}
                onChange={(e) => setWorkOrderNo(e.target.value)}
                placeholder="e.g. WO-2026-901"
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Payment Method & Trx Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Bank Transfer">Bank Transfer (BEFTN/RTGS)</option>
                <option value="bKash">bKash Merchant / Personal</option>
                <option value="Nagad">Nagad</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Cash">Cash in Hand</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Transaction ID / Cheque No / Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TrxID / Bank Cheque No"
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Received By & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Received By</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Notes / Remarks</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Work confirmed, advance received"
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Auto Convert to Invoice Checkbox */}
          <div className="bg-[#07101C] p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoConvert"
              checked={autoConvertInvoice}
              onChange={(e) => setAutoConvertInvoice(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <label htmlFor="autoConvert" className="text-xs text-slate-300 cursor-pointer">
              <strong>Also convert & generate Tax Invoice immediately</strong>
              <span className="block text-[11px] text-slate-500">
                (The generated invoice will automatically inherit this advance payment & updated due balance)
              </span>
            </label>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Save Advance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
