import React, { useState, useEffect } from 'react';
import { Invoice, Client, PaymentRecord } from '../types';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { numberToWordsBDT } from '../utils/numberToWords';
import { X, Receipt, CheckCircle, DollarSign, Building2, User, CreditCard } from 'lucide-react';

interface CreateCashReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReceipt: (receiptData: {
    receiptNumber: string;
    date: string;
    clientName: string;
    clientCompany?: string;
    amount: number;
    amountInWords: string;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Cheque' | 'Nagad';
    reference: string;
    purpose: string;
    receivedBy: string;
    linkedInvoiceId?: string;
  }) => boolean | void;
  invoices: Invoice[];
  clients: Client[];
}

export const CreateCashReceiptModal: React.FC<CreateCashReceiptModalProps> = ({
  isOpen,
  onClose,
  onSaveReceipt,
  invoices,
  clients,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const autoReceiptNo = `GCMS/MR/2026/${String(Math.floor(Math.random() * 899) + 101)}`;

  const [receiptNumber, setReceiptNumber] = useState(autoReceiptNo);
  const [date, setDate] = useState(today);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountInWords, setAmountInWords] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'bKash' | 'Cheque' | 'Nagad'>('Cash');
  const [reference, setReference] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [purpose, setPurpose] = useState('Payment against service delivery');
  const [receivedBy, setReceivedBy] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [errorMsg, setErrorMsg] = useState('');
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId);

  // Auto-update amount in words whenever amount changes
  useEffect(() => {
    if (amount > 0) {
      setAmountInWords(numberToWordsBDT(amount));
    } else {
      setAmountInWords('');
    }
  }, [amount]);

  // When invoice is selected
  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (!invId) {
      setAmount(0);
      setClientName('');
      setClientCompany('');
      setPurpose('Payment against service delivery');
      setErrorMsg('');
      return;
    }

    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setClientName(inv.clientName);
      setClientCompany(inv.clientCompany || '');
      setAmount(Math.max(0, Number(inv.due) || 0));
      setPurpose(`Payment against Invoice ${inv.invoiceNumber} (${inv.subject})`);
      setErrorMsg('');
    }
  };

  const handleSelectClient = (cId: string) => {
    if (!cId) return;
    const c = clients.find((client) => client.id === cId);
    if (c) {
      setClientName(c.name);
      setClientCompany(c.companyName || c.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('Please specify Client / Payer Name.');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Please enter a valid received amount.');
      return;
    }
    if (selectedInvoice && amount > Math.max(0, Number(selectedInvoice.due) || 0)) {
      setErrorMsg('Received amount cannot exceed this invoice’s remaining due.');
      return;
    }

    const fullReference = bankBranch
      ? `${reference ? reference + ' - ' : ''}${bankBranch}`
      : reference || (paymentMethod === 'Cash' ? 'Cash in Hand' : 'Direct Payment');

    const saved = onSaveReceipt({
      receiptNumber: receiptNumber.trim() || autoReceiptNo,
      date,
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim() || undefined,
      amount,
      amountInWords: amountInWords.trim() || numberToWordsBDT(amount),
      paymentMethod,
      reference: fullReference,
      purpose: purpose.trim() || 'Payment for execution services',
      receivedBy,
      linkedInvoiceId: selectedInvoiceId || undefined,
    });
    if (saved === false) {
      setErrorMsg('This invoice no longer has the selected due. Refresh and try again.');
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B192C] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Add Cash / Money Receipt</h2>
              <p className="text-xs text-slate-400">
                Issue an official Grand Communication Money Receipt voucher with auto number-to-words.
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
          {/* Top Bar: Receipt No & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#07101C] border border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Money Receipt Number
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Receipt Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Link to Invoice (Optional) */}
          {invoices.length > 0 && (
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Apply Receipt to Previous / Outstanding Due
              </label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleSelectInvoice(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="">-- Direct Receipt (No specific invoice) --</option>
                {invoices.filter((inv) => Number(inv.due) > 0).map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} | {inv.clientName} | Remaining due: ৳{inv.due.toLocaleString()}
                  </option>
                ))}
              </select>
              {selectedInvoice && (
                <p className="text-[10px] text-emerald-300">
                  Receipt payment will reduce this invoice’s due and increase collected totals.
                </p>
              )}
              {!selectedInvoice && (
                <p className="text-[10px] text-slate-400">
                  Direct receipts print without changing invoice due or collected totals. Select an outstanding invoice to record a previous-due payment.
                </p>
              )}
            </div>
          )}

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Received With Thanks From (Client / Payer) *
                </label>
                {clients.length > 0 && (
                  <select
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="text-[10px] bg-[#07101C] border border-slate-700 text-amber-400 rounded px-1 py-0.5"
                  >
                    <option value="">Choose Client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. Apex Footwear Ltd."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Holdings"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-4 rounded-2xl bg-[#07101C] border border-emerald-500/30 space-y-3">
            <div>
              <label className="block text-xs font-black text-emerald-400 uppercase tracking-wider mb-1">
                Amount Received (BDT ৳) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-base font-black text-emerald-400">৳</span>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice?.due}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-[#0B192C] border border-emerald-500/50 rounded-xl text-base font-black text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Amount in Words (Auto-Generated)
              </label>
              <input
                type="text"
                value={amountInWords}
                onChange={(e) => setAmountInWords(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-semibold text-amber-300 italic focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Cash">Cash (নগদ)</option>
                <option value="Bank Transfer">Bank Transfer (অনলাইন ব্যাংক)</option>
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
                <option value="Cheque">Bank Cheque (চেক)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {paymentMethod === 'Cheque'
                  ? 'Cheque Number'
                  : paymentMethod === 'Cash'
                  ? 'Cash Voucher / Note'
                  : 'Transaction ID / Ref'}
              </label>
              <input
                type="text"
                placeholder={
                  paymentMethod === 'Cheque'
                    ? 'e.g. CQ-992109'
                    : paymentMethod === 'Cash'
                    ? 'Cash received at office'
                    : 'e.g. TXN-8120392'
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {paymentMethod === 'Cheque' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bank Name & Branch
              </label>
              <input
                type="text"
                placeholder="e.g. Islami Bank Bangladesh, Agrabad Branch"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* On Account of */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              On Account of / Payment Purpose *
            </label>
            <input
              type="text"
              placeholder="e.g. 70% Advance for Retail Storefront Borfi & Standee branding"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Receiver */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Received By (Authorized Signatory)
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Issue & Print Official Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
