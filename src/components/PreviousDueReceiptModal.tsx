import React, { useState, useEffect } from 'react';
import { Invoice, Client, PaymentRecord } from '../types';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { numberToWordsBDT } from '../utils/numberToWords';
import { OfficialReceiptData } from './OfficialCashReceiptPrintModal';
import {
  X,
  Receipt,
  CheckCircle,
  DollarSign,
  Building2,
  User,
  CreditCard,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface PreviousDueReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  clients: Client[];
  onSaveInvoice: (invoice: Invoice) => void;
  onSaveClient?: (client: Client) => void;
  onReceiptCompleted: (receiptData: OfficialReceiptData) => void;
  preselectedClientId?: string;
  preselectedInvoiceId?: string;
}

export const PreviousDueReceiptModal: React.FC<PreviousDueReceiptModalProps> = ({
  isOpen,
  onClose,
  invoices = [],
  clients = [],
  onSaveInvoice,
  onSaveClient,
  onReceiptCompleted,
  preselectedClientId,
  preselectedInvoiceId,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const autoReceiptNo = `GCMS/MR/2026/${String(Math.floor(Math.random() * 899) + 101)}`;

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(preselectedClientId || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(preselectedInvoiceId || 'auto');
  const [receiptNumber, setReceiptNumber] = useState(autoReceiptNo);
  const [date, setDate] = useState(today);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountInWords, setAmountInWords] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'bKash' | 'Cheque' | 'Nagad'>('Cash');
  const [reference, setReference] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [purpose, setPurpose] = useState('পূর্বের বকেয়া আদায় (Previous Due Collection)');
  const [receivedBy, setReceivedBy] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find Selected Client
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Invoices for this client that have outstanding dues
  const clientInvoicesWithDue = invoices.filter((inv) => {
    const isClientMatch =
      (selectedClient && (inv.clientName === selectedClient.name || inv.clientCompany === selectedClient.companyName)) ||
      (inv.clientName && clientName && inv.clientName.toLowerCase() === clientName.toLowerCase());
    return isClientMatch && (Number(inv.due) > 0);
  });

  // Calculate Client Total Due (sum of invoice dues + legacy due)
  const totalInvoiceDue = clientInvoicesWithDue.reduce((sum, inv) => sum + (Number(inv.due) || 0), 0);
  const clientCurrentDue = selectedClient ? Number(selectedClient.currentDue || 0) : totalInvoiceDue;
  const effectiveTotalDue = Math.max(totalInvoiceDue, clientCurrentDue);

  // Pre-fill on client selection
  useEffect(() => {
    if (selectedClientId) {
      const c = clients.find((client) => client.id === selectedClientId);
      if (c) {
        setClientName(c.name);
        setClientCompany(c.companyName || c.name);

        const dueInvoices = invoices.filter(
          (inv) =>
            (inv.clientName === c.name || inv.clientCompany === c.companyName) &&
            Number(inv.due) > 0
        );
        const invDue = dueInvoices.reduce((s, i) => s + (Number(i.due) || 0), 0);
        const dueVal = Math.max(invDue, Number(c.currentDue) || 0);

        setAmount(dueVal > 0 ? dueVal : 10000);
        setPurpose(`Collection of previous outstanding due for ${c.companyName || c.name}`);
      }
    }
  }, [selectedClientId, clients, invoices]);

  // Handle preselected invoice
  useEffect(() => {
    if (preselectedInvoiceId && preselectedInvoiceId !== 'auto') {
      const inv = invoices.find((i) => i.id === preselectedInvoiceId);
      if (inv) {
        setSelectedInvoiceId(inv.id);
        setClientName(inv.clientName);
        setClientCompany(inv.clientCompany || '');
        setAmount(inv.due > 0 ? inv.due : inv.total);
        setPurpose(`Previous Due Collection against Invoice ${inv.invoiceNumber} (${inv.subject})`);
      }
    }
  }, [preselectedInvoiceId, invoices]);

  // Update Bengali words in real-time
  useEffect(() => {
    if (amount > 0) {
      setAmountInWords(numberToWordsBDT(amount));
    } else {
      setAmountInWords('');
    }
  }, [amount]);

  // Quick Amount Selectors
  const handleQuickAmount = (val: number) => {
    setAmount(val);
  };

  const handleSelectClientChange = (cId: string) => {
    setSelectedClientId(cId);
    setSelectedInvoiceId('auto');
  };

  // Remaining due calculation
  const remainingAfterPayment = Math.max(0, effectiveTotalDue - amount);

  // Form Submit Handler ("Done / রিসিট সম্পন্ন ও ক্যাশে যোগ করুন")
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('অনুগ্রহ করে ক্লায়েন্টের নাম নির্বাচন বা প্রদান করুন।');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('অনুগ্রহ করে বৈধ প্রাপ্ত টাকার অংক লিখুন (Amount must be greater than 0)।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const fullReference = bankBranch
      ? `${reference ? reference + ' - ' : ''}${bankBranch}`
      : reference || (paymentMethod === 'Cash' ? 'Cash in Hand (নগদ গ্রহণ)' : 'Direct Due Settlement');

    const paymentDateStr = date || today;

    const newPaymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      amount: amount,
      date: paymentDateStr,
      method: paymentMethod,
      reference: fullReference,
      receivedBy: receivedBy.trim(),
      notes: purpose.trim() || 'Previous Due Settlement',
    };

    let targetInvoiceNumber = '';

    // ================= 1. ALLOCATE TO INVOICES =================
    if (selectedInvoiceId && selectedInvoiceId !== 'auto') {
      // Allocate specifically to selected invoice
      const targetInv = invoices.find((i) => i.id === selectedInvoiceId);
      if (targetInv) {
        targetInvoiceNumber = targetInv.invoiceNumber;
        const newAdvance = (targetInv.advance || 0) + amount;
        const newDue = Math.max(0, targetInv.total - newAdvance);
        const newStatus = newDue === 0 ? 'Paid' : 'Partial';

        const updatedInvoice: Invoice = {
          ...targetInv,
          advance: newAdvance,
          due: newDue,
          status: newStatus,
          payments: [...(targetInv.payments || []), newPaymentRecord],
        };
        onSaveInvoice(updatedInvoice);
      }
    } else if (clientInvoicesWithDue.length > 0) {
      // Auto-allocate across oldest unpaid invoices
      let remainingToAllocate = amount;
      const sortedInvoices = [...clientInvoicesWithDue].sort((a, b) => a.date.localeCompare(b.date));

      for (const inv of sortedInvoices) {
        if (remainingToAllocate <= 0) break;
        const currentDue = Number(inv.due) || 0;
        const payForThisInv = Math.min(remainingToAllocate, currentDue);

        const newAdvance = (inv.advance || 0) + payForThisInv;
        const newDue = Math.max(0, inv.total - newAdvance);
        const newStatus = newDue === 0 ? 'Paid' : 'Partial';

        const invPaymentRecord: PaymentRecord = {
          ...newPaymentRecord,
          id: `pay-${Date.now()}-${inv.id}`,
          amount: payForThisInv,
          notes: `${purpose} (Allocated to ${inv.invoiceNumber})`,
        };

        const updatedInv: Invoice = {
          ...inv,
          advance: newAdvance,
          due: newDue,
          status: newStatus,
          payments: [...(inv.payments || []), invPaymentRecord],
        };

        onSaveInvoice(updatedInv);
        targetInvoiceNumber = targetInvoiceNumber ? `${targetInvoiceNumber}, ${inv.invoiceNumber}` : inv.invoiceNumber;
        remainingToAllocate -= payForThisInv;
      }
    } else {
      // No existing invoice with due found (e.g. Legacy Opening Due).
      // Create an official Previous Due Settlement Invoice so Cash/Revenue increases in Dashboard
      const settlementInvNumber = `GCMS/INV/PREV/${String(Math.floor(Math.random() * 899) + 101)}`;
      targetInvoiceNumber = settlementInvNumber;

      const settlementInvoice: Invoice = {
        id: `inv-prev-${Date.now()}`,
        invoiceNumber: settlementInvNumber,
        date: paymentDateStr,
        clientName: clientName.trim(),
        clientCompany: clientCompany.trim() || clientName.trim(),
        clientAddress: selectedClient?.address || 'Chattogram, Bangladesh',
        subject: `Previous Due Settlement / পূর্বের বকেয়া আদায় (${purpose})`,
        items: [
          {
            id: `qi-${Date.now()}`,
            job: 'Previous Due Collection',
            description: `Settlement of outstanding opening balance / previous project dues`,
            quantity: 1,
            unitPrice: amount,
            total: amount,
          },
        ],
        subtotal: amount,
        agencyCommissionPercent: 0,
        agencyCommissionAmount: 0,
        vatPercent: 0,
        vatAmount: 0,
        total: amount,
        advance: amount,
        due: 0,
        status: 'Paid',
        payments: [newPaymentRecord],
        termsAndConditions: ['Full payment received against previous outstanding due balance.'],
        signatoryName: receivedBy.trim(),
        signatoryTitle: GRAND_COMPANY_INFO.defaultSignatory.title,
        signatoryPhone: GRAND_COMPANY_INFO.defaultSignatory.phone,
        createdAt: paymentDateStr,
      };

      onSaveInvoice(settlementInvoice);
    }

    // ================= 2. UPDATE CLIENT PROFILE =================
    if (selectedClient && onSaveClient) {
      const updatedCurrentDue = Math.max(0, (selectedClient.currentDue || 0) - amount);
      const updatedTotalPaid = (selectedClient.totalPaid || 0) + amount;

      const updatedClient: Client = {
        ...selectedClient,
        currentDue: updatedCurrentDue,
        totalPaid: updatedTotalPaid,
        notes: `${selectedClient.notes ? selectedClient.notes + ' | ' : ''}Previous due receipt: ৳${amount.toLocaleString()} paid on ${paymentDateStr} (${receiptNumber})`,
      };
      onSaveClient(updatedClient);
    }

    // ================= 3. GENERATE OFFICIAL PRINTABLE RECEIPT =================
    const officialReceiptData: OfficialReceiptData = {
      receiptNumber: receiptNumber.trim() || autoReceiptNo,
      date: paymentDateStr,
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim(),
      amount: amount,
      amountInWords: amountInWords || numberToWordsBDT(amount),
      paymentMethod: paymentMethod,
      reference: fullReference,
      purpose: purpose.trim() || 'Settlement of previous outstanding due',
      receivedBy: receivedBy.trim(),
      invoiceNumber: targetInvoiceNumber || undefined,
    };

    setIsSubmitting(false);
    onClose();

    // Trigger the official stamped money receipt popup
    onReceiptCompleted(officialReceiptData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#0B192C] border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Previous Due Money Receipt</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase">
                  Cash Inflow
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                পূর্বের বকেয়া আদায় রিসিট: রিসিট করার পর Done করলে তাৎক্ষণিক ক্যাশ যোগ হবে এবং বকেয়া সমন্বয় হবে।
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
          <div className="mb-4 p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="p-4 rounded-2xl bg-[#07101C] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Select Client with Previous Due *</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {clients.length} Registered Clients
              </span>
            </div>

            <select
              value={selectedClientId}
              onChange={(e) => handleSelectClientChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">-- Choose Client with Due Balance --</option>
              {clients.map((c) => {
                const clientInvs = invoices.filter(
                  (i) => (i.clientName === c.name || i.clientCompany === c.companyName) && Number(i.due) > 0
                );
                const invDueTotal = clientInvs.reduce((s, i) => s + (Number(i.due) || 0), 0);
                const dueAmt = Math.max(invDueTotal, Number(c.currentDue) || 0);

                return (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} {c.contactPerson ? `(${c.contactPerson})` : ''} — [বকেয়া: ৳ {dueAmt.toLocaleString()}/-]
                  </option>
                );
              })}
            </select>

            {/* Client Due Summary Card */}
            {selectedClient && (
              <div className="p-3 bg-[#0B192C] border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{selectedClient.companyName || selectedClient.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Phone: {selectedClient.phone || 'N/A'} • {selectedClient.address || 'Chattogram'}
                  </p>
                </div>

                <div className="text-right bg-amber-950/40 border border-amber-500/40 px-3.5 py-1.5 rounded-lg">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    Total Outstanding Due
                  </span>
                  <span className="text-base font-black text-amber-400">
                    ৳ {effectiveTotalDue.toLocaleString()}/-
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Allocation Option */}
          {clientInvoicesWithDue.length > 0 && (
            <div className="p-3.5 bg-[#07101C] rounded-2xl border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Allocate Due to Specific Invoice (Optional)</span>
              </label>

              <select
                value={selectedInvoiceId}
                onChange={(e) => {
                  const invId = e.target.value;
                  setSelectedInvoiceId(invId);
                  if (invId && invId !== 'auto') {
                    const inv = invoices.find((i) => i.id === invId);
                    if (inv) {
                      setAmount(inv.due > 0 ? inv.due : inv.total);
                      setPurpose(`Previous Due Collection for Invoice ${inv.invoiceNumber} (${inv.subject})`);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="auto">
                  ⚡ Auto-Adjust Across Oldest Dues (সর্বাধিক কার্যকর বকেয়া সমন্বয়)
                </option>
                {clientInvoicesWithDue.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} ({inv.date}) — Bill: ৳{inv.total.toLocaleString()} | Due: ৳{inv.due.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Box & Quick Buttons */}
          <div className="p-4 rounded-2xl bg-[#07101C] border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>Received Amount to Add to Cash (আদায়কৃত টাকা) *</span>
              </label>
              {effectiveTotalDue > 0 && (
                <button
                  type="button"
                  onClick={() => handleQuickAmount(effectiveTotalDue)}
                  className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Pay Full Due (৳ {effectiveTotalDue.toLocaleString()})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-lg font-black text-emerald-400">৳</span>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0B192C] border border-emerald-500/60 rounded-xl text-lg font-black text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[5000, 10000, 20000, 50000, 100000].map((quickVal) => (
                <button
                  key={quickVal}
                  type="button"
                  onClick={() => handleQuickAmount(quickVal)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  +৳ {quickVal.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Amount in Words (Bengali) */}
            {amountInWords && (
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium">
                <strong>কথায়:</strong> {amountInWords}
              </div>
            )}

            {/* Remaining Due Preview */}
            {effectiveTotalDue > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">পরিশোধ পরবর্তী অবশিষ্ট বকেয়া (Remaining Due):</span>
                <span className={`font-black text-sm ${remainingAfterPayment === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  ৳ {remainingAfterPayment.toLocaleString()}/- {remainingAfterPayment === 0 ? '(সম্পূর্ণ পরিশোধিত ✅)' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Payment Method (পরিশোধ মাধ্যম) *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Cash">Cash (নগদ)</option>
                <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Cheque">Bank Cheque (চেক)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Receipt Date (তারিখ) *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Reference / Cheque No & Bank Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cheque / Txn / Ref No (অপশনাল)
              </label>
              <input
                type="text"
                placeholder={
                  paymentMethod === 'Cheque'
                    ? 'e.g. Cheque # 9018241'
                    : paymentMethod === 'bKash'
                    ? 'e.g. TrxID: 9X82BA91'
                    : 'e.g. Direct cash slip'
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bank / Branch Details (অপশনাল)
              </label>
              <input
                type="text"
                placeholder="e.g. Islami Bank, Agrabad Branch"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Particulars / Purpose */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Purpose / Description on Voucher (রিসিটের বিবরণ) *
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. পূর্বের কাজের বকেয়া বাবদ আদায় / Previous Due Settlement"
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Received By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Receipt Serial Number
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Authorized Signatory / Receiver
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel (বাতিল)
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Done / Confirm Receipt & Add to Cash (রিসিট সম্পন্ন ও ক্যাশে যোগ করুন)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
